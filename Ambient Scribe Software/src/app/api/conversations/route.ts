import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { enrichedConversations } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clinicId = searchParams.get('clinicId');
  const outcome = searchParams.get('outcome');
  const search = searchParams.get('search') ?? '';

  if (!clinicId) return NextResponse.json({ error: 'clinicId required' }, { status: 400 });

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json(enrichedConversations);
  }

  let query = supabase
    .from('conversations')
    .select('*, patients(id, name, phone, loyalty_tier)')
    .eq('clinic_id', clinicId)
    .order('last_message_at', { ascending: false });

  if (outcome) query = query.eq('outcome', outcome);
  if (search) query = query.ilike('patient_phone', `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const normalized = (data ?? []).map(({ patients, ...rest }: Record<string, unknown> & { patients?: unknown }) => ({ ...rest, patient: patients }));
  return NextResponse.json(normalized);
}

export async function POST(req: NextRequest) {
  try {
    const { clinicId, patientPhone } = await req.json();

    if (!clinicId || !patientPhone) {
      return NextResponse.json(
        { error: 'clinicId and patientPhone are required' },
        { status: 400 }
      );
    }

    if (process.env.USE_MOCK_DATA === 'true') {
      return NextResponse.json({
        id: `conv-mock-${Date.now()}`,
        clinic_id: clinicId,
        patient_phone: patientPhone,
        status: 'active',
        ai_confidence_avg: 1,
        total_messages: 0,
        ai_messages: 0,
        human_messages: 0,
        outcome: 'unresolved',
        started_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      });
    }

    // Check if conversation already exists for this patient + clinic
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('patient_phone', patientPhone)
      .eq('status', 'active')
      .single();

    if (existingConv) {
      return NextResponse.json(existingConv);
    }

    // Check if patient exists, create if not
    let { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('phone', patientPhone)
      .single();

    if (!patient) {
      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert({
          clinic_id: clinicId,
          name: 'Unknown',
          phone: patientPhone,
          consent_given: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError || !newPatient) {
        console.error('Error creating patient:', createError);
        return NextResponse.json(
          { error: 'Failed to create patient' },
          { status: 500 }
        );
      }
      patient = newPatient;
    }

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found or could not be created' },
        { status: 500 }
      );
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        clinic_id: clinicId,
        patient_id: patient.id,
        patient_phone: patientPhone,
        status: 'active',
        ai_confidence_avg: 1,
        total_messages: 0,
        ai_messages: 0,
        human_messages: 0,
        outcome: 'unresolved',
        started_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('POST /api/conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
