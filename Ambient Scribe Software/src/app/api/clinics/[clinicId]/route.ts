import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const { clinicId } = await params;

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json({
      id: clinicId,
      name: 'Andalus Health',
      phone: '+60312345678',
      email: 'admin@andalushealth.com',
      address: '12 Jalan Tun Razak, 50400 Kuala Lumpur',
      created_at: '2026-01-01T00:00:00Z',
    });
  }

  const { data, error } = await supabase.from('clinics').select('*').eq('id', clinicId).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const { clinicId } = await params;
  const body = await req.json();

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json({ success: true });
  }

  // Strip fields that must not be updated via this route
  const { id: _id, created_at: _ca, wa_access_token: _tok, ...updates } = body;

  const { error } = await supabase.from('clinics').update(updates).eq('id', clinicId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
