import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const clinicId = new URL(req.url).searchParams.get('clinicId');

  const query = supabase
    .from('patients')
    .select('*')
    .eq('id', id);

  if (clinicId) query.eq('clinic_id', clinicId);

  const { data, error } = await query.single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // Also fetch their appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', id)
    .order('start_time', { ascending: false });

  return NextResponse.json({ ...data, appointments: appointments ?? [] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const { error } = await supabase.from('patients').update(body).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
