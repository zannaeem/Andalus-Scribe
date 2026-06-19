import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const { clinicId } = await params;

  const { data: clinic } = await supabase
    .from('clinics')
    .select('wa_connected, business_hours, name')
    .eq('id', clinicId)
    .single();

  const { count: kbCount } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  const { count: staffCount } = await supabase
    .from('clinic_users')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  const steps = {
    whatsapp_connected: clinic?.wa_connected ?? false,
    business_hours_set: !!clinic?.business_hours,
    knowledge_base_uploaded: (kbCount ?? 0) > 0,
    staff_invited: (staffCount ?? 0) > 1,
  };

  return NextResponse.json({
    steps,
    complete:
      steps.whatsapp_connected &&
      steps.business_hours_set &&
      steps.knowledge_base_uploaded,
  });
}
