import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { mockDashboardStats } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clinicId = searchParams.get('clinicId');
  if (!clinicId) return NextResponse.json({ error: 'clinicId required' }, { status: 400 });

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json(mockDashboardStats);
  }

  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
  const lastWeekStart = new Date(weekStart); lastWeekStart.setDate(weekStart.getDate() - 7);

  // Parallel queries
  const [
    { count: apptThisWeek },
    { count: apptLastWeek },
    { count: totalPatients },
    { data: conversations },
    { data: apptOverTime },
  ] = await Promise.all([
    supabase.from('appointments').select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId).gte('start_time', weekStart.toISOString()),
    supabase.from('appointments').select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('start_time', lastWeekStart.toISOString())
      .lt('start_time', weekStart.toISOString()),
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId),
    supabase.from('conversations').select('outcome, ai_confidence_avg, total_messages, ai_messages')
      .eq('clinic_id', clinicId),
    supabase.from('appointments').select('start_time')
      .eq('clinic_id', clinicId)
      .gte('start_time', new Date(Date.now() - 30 * 86400000).toISOString())
      .order('start_time', { ascending: true }),
  ]);

  const convList = conversations ?? [];
  const totalConversations = convList.length;
  const aiConfidenceAvg = totalConversations > 0
    ? convList.reduce((s, c) => s + (c.ai_confidence_avg ?? 0), 0) / totalConversations
    : 0;
  const totalMessages = convList.reduce((s, c) => s + (c.total_messages ?? 0), 0);
  const aiMessages = convList.reduce((s, c) => s + (c.ai_messages ?? 0), 0);
  const receptionist_hours_saved = Math.round((aiMessages / 10) * 2) / 10;

  // Outcome breakdown
  const outcomeCounts: Record<string, number> = {};
  for (const c of convList) {
    outcomeCounts[c.outcome] = (outcomeCounts[c.outcome] ?? 0) + 1;
  }
  const outcomeColors: Record<string, string> = {
    appointment_booked: 'hsl(var(--primary))',
    faq_answered: 'hsl(142 71% 45%)',
    escalated_to_human: 'hsl(38 92% 50%)',
    abandoned: 'hsl(var(--muted-foreground))',
    unresolved: 'hsl(0 72% 51%)',
  };
  const conversation_outcomes = Object.entries(outcomeCounts).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    fill: outcomeColors[name] ?? 'hsl(var(--muted))',
  }));

  // Appointments over time (last 30 days, grouped by date)
  const dateMap: Record<string, number> = {};
  for (const a of apptOverTime ?? []) {
    const date = a.start_time.slice(0, 10);
    dateMap[date] = (dateMap[date] ?? 0) + 1;
  }
  const appointments_over_time = Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    appointments_booked_this_week: apptThisWeek ?? 0,
    appointments_booked_last_week: apptLastWeek ?? 0,
    receptionist_hours_saved,
    ai_confidence_avg: Math.round(aiConfidenceAvg * 100),
    total_conversations: totalConversations,
    total_patients: totalPatients ?? 0,
    top_faqs: [],
    appointments_over_time,
    conversation_outcomes,
  });
}
