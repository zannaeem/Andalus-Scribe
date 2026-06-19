import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getPatientPoints,
  getTransactionHistory,
  redeemPoints,
} from '@/lib/services/loyalty';
import { enrichedTransactions } from '@/lib/mock-data';

const RedeemSchema = z.object({
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  points: z.number().positive(),
  reward: z.string().min(1),
});

// GET — Get loyalty points and transaction history
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clinicId = searchParams.get('clinicId');
  const patientId = searchParams.get('patientId') ?? undefined;

  if (!clinicId) {
    return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
  }

  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.json({ points: null, transactions: enrichedTransactions });
  }

  try {
    const raw = await getTransactionHistory(clinicId, patientId);
    // Normalize Supabase join: `patients` → `patient`
    const transactions = raw.map(({ patients, ...rest }: Record<string, unknown> & { patients?: unknown }) => ({ ...rest, patient: patients }));

    let points = null;
    if (patientId) {
      points = await getPatientPoints(clinicId, patientId);
    }

    return NextResponse.json({ points, transactions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — Redeem loyalty points
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = RedeemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await redeemPoints(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
