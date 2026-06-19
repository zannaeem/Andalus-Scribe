import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  bookAppointment,
  getAppointmentsByClinic,
  updateAppointmentStatus,
} from '@/lib/services/appointments';
import { enrichedAppointments } from '@/lib/mock-data';

const BookAppointmentSchema = z.object({
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  chiefComplaint: z.string().optional(),
  appointmentType: z.enum(['general', 'follow-up', 'emergency', 'telemedicine']),
  doctorName: z.string().optional(),
});

const UpdateStatusSchema = z.object({
  appointmentId: z.string().uuid(),
  status: z.enum(['booked', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled']),
});

// GET — List appointments for a clinic
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clinicId = searchParams.get('clinicId');
  const date = searchParams.get('date') ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  if (!clinicId) {
    return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
  }

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json(enrichedAppointments);
  }

  try {
    const appointments = await getAppointmentsByClinic(clinicId, { date, status });
    return NextResponse.json(appointments);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — Book a new appointment
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = BookAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json({ id: `apt-mock-${Date.now()}`, ...parsed.data, status: 'booked', created_at: new Date().toISOString() }, { status: 201 });
  }

  try {
    const appointment = await bookAppointment(parsed.data);
    return NextResponse.json(appointment, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH — Update appointment status
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const parsed = UpdateStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json({ success: true });
  }

  try {
    await updateAppointmentStatus(parsed.data.appointmentId, parsed.data.status);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
