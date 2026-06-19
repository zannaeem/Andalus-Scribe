import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const { clinicId } = await params;
  const { data, error } = await supabase
    .from('clinic_users')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('invited_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const { clinicId } = await params;
  const { email, name, role } = await req.json();

  if (!email || !role) return NextResponse.json({ error: 'email and role required' }, { status: 400 });

  const { data, error } = await supabase
    .from('clinic_users')
    .insert({ clinic_id: clinicId, email, name: name ?? email, role })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send Supabase Auth invite email
  await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}/auth/callback`,
  });

  return NextResponse.json(data, { status: 201 });
}
