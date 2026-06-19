import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { mockPatients } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clinicId = searchParams.get('clinicId');
  const search = searchParams.get('search') ?? '';

  if (!clinicId) return NextResponse.json({ error: 'clinicId required' }, { status: 400 });

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json(mockPatients);
  }

  let query = supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clinicId, name, phone, email, dateOfBirth, gender } = body;

  if (!clinicId || !phone) return NextResponse.json({ error: 'clinicId and phone required' }, { status: 400 });

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json({
      id: `pat-mock-${Date.now()}`, clinic_id: clinicId, name: name ?? 'Unknown', phone, email,
      date_of_birth: dateOfBirth, gender, loyalty_points: 0, loyalty_tier: 'bronze',
      total_visits: 0, consent_given: false, created_at: new Date().toISOString(),
    }, { status: 201 });
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      clinic_id: clinicId,
      name: name ?? 'Unknown',
      phone,
      email,
      date_of_birth: dateOfBirth,
      gender,
      loyalty_points: 0,
      loyalty_tier: 'bronze',
      total_visits: 0,
      consent_given: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
