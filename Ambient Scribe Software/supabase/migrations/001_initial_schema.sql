-- ============================================================
-- Humance Clinic AI Receptionist – Initial Schema
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector (enable in Supabase dashboard first)

-- ============================================================
-- TABLES
-- ============================================================

-- ── clinics ─────────────────────────────────────────────────────
CREATE TABLE clinics (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                            TEXT NOT NULL,
  address                         TEXT,
  phone                           TEXT,
  email                           TEXT,
  whatsapp_number                 TEXT,
  business_hours                  JSONB,         -- { "mon": { "open": "09:00", "close": "17:00" }, ... }
  ai_confidence_threshold         FLOAT NOT NULL DEFAULT 0.75,
  loyalty_enabled                 BOOLEAN NOT NULL DEFAULT false,
  loyalty_points_per_appointment  INT NOT NULL DEFAULT 10,
  loyalty_reward_catalog          JSONB DEFAULT '[]'::jsonb,
  subscription_status             TEXT NOT NULL DEFAULT 'trial'
                                    CHECK (subscription_status IN ('trial','active','past_due','cancelled')),
  subscription_plan               TEXT NOT NULL DEFAULT 'starter'
                                    CHECK (subscription_plan IN ('starter','growth','enterprise')),
  -- WhatsApp Cloud API (populated after Embedded Signup)
  wa_phone_number_id              TEXT,
  wa_waba_id                      TEXT,
  wa_access_token                 TEXT,          -- store encrypted in production
  wa_display_name                 TEXT,
  wa_connected                    BOOLEAN NOT NULL DEFAULT false,
  wa_connected_at                 TIMESTAMPTZ,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── clinic_users ────────────────────────────────────────────────
CREATE TABLE clinic_users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- null until invite accepted
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'receptionist'
                 CHECK (role IN ('owner','admin','receptionist','doctor','viewer')),
  avatar_url   TEXT,
  last_login   TIMESTAMPTZ,
  invited_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at  TIMESTAMPTZ,
  UNIQUE (clinic_id, email)
);

-- ── Helper: check clinic membership (depends on clinic_users) ──
CREATE OR REPLACE FUNCTION auth_clinic_ids()
RETURNS SETOF UUID
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT clinic_id FROM clinic_users WHERE user_id = auth.uid();
$$;

-- ── patients ────────────────────────────────────────────────────
CREATE TABLE patients (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  phone            TEXT NOT NULL,
  email            TEXT,
  date_of_birth    DATE,
  gender           TEXT CHECK (gender IN ('male','female','other','prefer_not_to_say')),
  loyalty_points   INT NOT NULL DEFAULT 0,
  loyalty_tier     TEXT NOT NULL DEFAULT 'bronze'
                     CHECK (loyalty_tier IN ('bronze','silver','gold','platinum')),
  total_visits     INT NOT NULL DEFAULT 0,
  last_visit       DATE,
  consent_given    BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (clinic_id, phone)
);

-- ── appointments ────────────────────────────────────────────────
CREATE TABLE appointments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'booked'
                        CHECK (status IN ('booked','confirmed','completed','cancelled','no_show','rescheduled')),
  chief_complaint     TEXT,
  appointment_type    TEXT NOT NULL DEFAULT 'general'
                        CHECK (appointment_type IN ('general','follow-up','emergency','telemedicine')),
  doctor_name         TEXT,
  reminder_sent_24h   BOOLEAN NOT NULL DEFAULT false,
  reminder_sent_2h    BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── conversations ───────────────────────────────────────────────
CREATE TABLE conversations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id          UUID REFERENCES patients(id) ON DELETE SET NULL,
  patient_phone       TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  ai_confidence_avg   FLOAT NOT NULL DEFAULT 0,
  total_messages      INT NOT NULL DEFAULT 0,
  ai_messages         INT NOT NULL DEFAULT 0,
  human_messages      INT NOT NULL DEFAULT 0,
  outcome             TEXT NOT NULL DEFAULT 'unresolved'
                        CHECK (outcome IN ('appointment_booked','faq_answered','escalated_to_human','abandoned','unresolved')),
  takeover_active     BOOLEAN NOT NULL DEFAULT false,
  takeover_count      INT NOT NULL DEFAULT 0,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── messages ────────────────────────────────────────────────────
CREATE TABLE messages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  clinic_id         UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content           TEXT NOT NULL,
  ai_confidence     FLOAT,
  sent_by_human     BOOLEAN NOT NULL DEFAULT false,
  rag_sources       TEXT[],           -- knowledge_base entry IDs used
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── knowledge_base ──────────────────────────────────────────────
CREATE TABLE knowledge_base (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  embedding    VECTOR(1536),          -- text-embedding-3-small (1536 dims)
  source_type  TEXT NOT NULL DEFAULT 'manual_entry'
                 CHECK (source_type IN ('manual_entry','pdf_upload','docx_upload')),
  category     TEXT NOT NULL DEFAULT 'general',
  tags         TEXT[] DEFAULT '{}',
  usage_count  INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── loyalty_transactions ─────────────────────────────────────────
CREATE TABLE loyalty_transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('earn','redeem','expire','adjustment')),
  points        INT NOT NULL,          -- positive = earn, negative = redeem/expire
  description   TEXT NOT NULL,
  redeemed_for  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── takeover_sessions ────────────────────────────────────────────
CREATE TABLE takeover_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  patient_phone    TEXT NOT NULL,
  reason           TEXT NOT NULL CHECK (reason IN ('low_confidence','patient_request','staff_initiated')),
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','resolved')),
  assigned_to      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at      TIMESTAMPTZ
);


-- ============================================================
-- INDEXES
-- ============================================================

-- Clinic lookups
CREATE INDEX idx_clinics_wa_phone_number_id ON clinics(wa_phone_number_id);

-- Conversations: active conversation lookup (hot path in WhatsApp webhook)
CREATE INDEX idx_conversations_clinic_phone_status
  ON conversations(clinic_id, patient_phone, status);

-- Messages: history retrieval
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Appointments: reminder cron queries
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_clinic_status ON appointments(clinic_id, status);

-- Patients: phone lookup
CREATE INDEX idx_patients_clinic_phone ON patients(clinic_id, phone);

-- Knowledge base: vector similarity search
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_knowledge_base_clinic_id ON knowledge_base(clinic_id);

-- Loyalty
CREATE INDEX idx_loyalty_transactions_patient ON loyalty_transactions(patient_id);
CREATE INDEX idx_loyalty_transactions_clinic ON loyalty_transactions(clinic_id);

-- Takeover
CREATE INDEX idx_takeover_clinic_status ON takeover_sessions(clinic_id, status);


-- ============================================================
-- UPDATED_AT TRIGGER (knowledge_base)
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- VECTOR SEARCH RPC
-- ============================================================

CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding  VECTOR(1536),
  clinic_id        UUID,
  match_threshold  FLOAT DEFAULT 0.7,
  match_count      INT   DEFAULT 5
)
RETURNS TABLE (
  id          UUID,
  title       TEXT,
  content     TEXT,
  category    TEXT,
  similarity  FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE
    kb.clinic_id = search_knowledge_base.clinic_id
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
$$;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE clinics              ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base       ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeover_sessions    ENABLE ROW LEVEL SECURITY;

-- Service role (API routes / Inngest) bypass RLS entirely – no policy needed.
-- Dashboard users: only see data belonging to their clinic(s).

-- clinics: read/update own clinic
CREATE POLICY clinics_select ON clinics FOR SELECT
  USING (id IN (SELECT auth_clinic_ids()));

CREATE POLICY clinics_update ON clinics FOR UPDATE
  USING (id IN (SELECT auth_clinic_ids()));

-- clinic_users
CREATE POLICY clinic_users_select ON clinic_users FOR SELECT
  USING (clinic_id IN (SELECT auth_clinic_ids()));

CREATE POLICY clinic_users_insert ON clinic_users FOR INSERT
  WITH CHECK (clinic_id IN (SELECT auth_clinic_ids()));

CREATE POLICY clinic_users_update ON clinic_users FOR UPDATE
  USING (clinic_id IN (SELECT auth_clinic_ids()));

CREATE POLICY clinic_users_delete ON clinic_users FOR DELETE
  USING (clinic_id IN (SELECT auth_clinic_ids()));

-- patients
CREATE POLICY patients_all ON patients FOR ALL
  USING (clinic_id IN (SELECT auth_clinic_ids()))
  WITH CHECK (clinic_id IN (SELECT auth_clinic_ids()));

-- appointments
CREATE POLICY appointments_all ON appointments FOR ALL
  USING (clinic_id IN (SELECT auth_clinic_ids()))
  WITH CHECK (clinic_id IN (SELECT auth_clinic_ids()));

-- conversations
CREATE POLICY conversations_all ON conversations FOR ALL
  USING (clinic_id IN (SELECT auth_clinic_ids()))
  WITH CHECK (clinic_id IN (SELECT auth_clinic_ids()));

-- messages
CREATE POLICY messages_all ON messages FOR ALL
  USING (clinic_id IN (SELECT auth_clinic_ids()))
  WITH CHECK (clinic_id IN (SELECT auth_clinic_ids()));

-- knowledge_base
CREATE POLICY knowledge_base_all ON knowledge_base FOR ALL
  USING (clinic_id IN (SELECT auth_clinic_ids()))
  WITH CHECK (clinic_id IN (SELECT auth_clinic_ids()));

-- loyalty_transactions
CREATE POLICY loyalty_all ON loyalty_transactions FOR ALL
  USING (clinic_id IN (SELECT auth_clinic_ids()))
  WITH CHECK (clinic_id IN (SELECT auth_clinic_ids()));

-- takeover_sessions
CREATE POLICY takeover_all ON takeover_sessions FOR ALL
  USING (clinic_id IN (SELECT auth_clinic_ids()))
  WITH CHECK (clinic_id IN (SELECT auth_clinic_ids()));


-- ============================================================
-- SEED: demo clinic (delete before production)
-- ============================================================
-- INSERT INTO clinics (name, email, subscription_status, subscription_plan)
-- VALUES ('Humance Demo Clinic', 'demo@humance.ai', 'trial', 'starter');
