-- ============================================================
-- Humance — Migration 002: Missing tables & functions
-- Run after 001_initial_schema.sql
-- ============================================================

-- ── pending_messages (staff inbox for takeover sessions) ─────
CREATE TABLE IF NOT EXISTS pending_messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  patient_phone    TEXT NOT NULL,
  content          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pending_messages_clinic ON pending_messages(clinic_id, status);

ALTER TABLE pending_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY pending_messages_all ON pending_messages FOR ALL
  USING (clinic_id IN (SELECT auth_clinic_ids()))
  WITH CHECK (clinic_id IN (SELECT auth_clinic_ids()));

-- ── increment_takeover_count ─────────────────────────────────
CREATE OR REPLACE FUNCTION increment_takeover_count(conv_id UUID)
RETURNS VOID LANGUAGE SQL AS $$
  UPDATE conversations
  SET takeover_count = takeover_count + 1
  WHERE id = conv_id;
$$;

-- ── Supabase Auth email redirect URL (run once) ──────────────
-- Set in Supabase Dashboard → Auth → URL Configuration:
-- Site URL: http://localhost:3000
-- Redirect URLs: http://localhost:3000/auth/callback
