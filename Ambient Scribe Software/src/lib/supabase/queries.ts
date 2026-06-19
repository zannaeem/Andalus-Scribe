import { supabase } from './client';

// ── Clinic Queries ──────────────────────────────────────────────

export async function getClinicByPhoneNumberId(phoneNumberId: string) {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('wa_phone_number_id', phoneNumberId)
    .single();

  if (error) throw new Error(`Clinic lookup failed: ${error.message}`);
  return data;
}

export async function getClinicById(clinicId: string) {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();

  if (error) throw new Error(`Clinic not found: ${error.message}`);
  return data;
}

// ── Conversation Queries ────────────────────────────────────────

export async function getActiveConversation(clinicId: string, patientPhone: string) {
  const { data } = await supabase
    .from('conversations')
    .select('id, takeover_active')
    .eq('clinic_id', clinicId)
    .eq('patient_phone', patientPhone)
    .eq('status', 'active')
    .single();

  return data;
}

export async function getOrCreateConversation(clinicId: string, patientPhone: string) {
  // Try to find an active conversation
  const existing = await getActiveConversation(clinicId, patientPhone);
  if (existing) return existing;

  // Create a new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      clinic_id: clinicId,
      patient_phone: patientPhone,
      ai_confidence_avg: 0,
      total_messages: 0,
      ai_messages: 0,
      human_messages: 0,
      outcome: 'unresolved',
      takeover_active: false,
      takeover_count: 0,
      status: 'active',
      started_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .select('id, takeover_active')
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return data;
}

// ── Message Queries ─────────────────────────────────────────────

export async function saveMessages(
  messages: {
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    clinic_id: string;
    ai_confidence?: number;
    sent_by_human?: boolean;
    rag_sources?: string[];
  }[]
) {
  const { error } = await supabase.from('messages').insert(messages);
  if (error) throw new Error(`Failed to save messages: ${error.message}`);
}

export async function getConversationHistory(conversationId: string, limit = 10) {
  const { data } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data?.reverse() ?? [];
}

// ── Knowledge Base (RAG) ────────────────────────────────────────

export async function searchKnowledgeBase(
  queryEmbedding: number[],
  clinicId: string,
  matchThreshold = 0.7,
  matchCount = 5
) {
  const { data } = await supabase.rpc('search_knowledge_base', {
    query_embedding: queryEmbedding,
    clinic_id: clinicId,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  return data ?? [];
}

// ── Appointment Queries ─────────────────────────────────────────

export async function getUpcomingAppointments(
  dateStr: string,
  reminderFlag: 'reminder_sent_24h' | 'reminder_sent_2h'
) {
  const { data } = await supabase
    .from('appointments')
    .select('*, patients(*), clinics(*)')
    .eq('appointment_date', dateStr)
    .eq('status', 'confirmed')
    .eq(reminderFlag, false);

  return data ?? [];
}

export async function getAppointmentsInTimeRange(
  startTime: string,
  endTime: string,
  reminderFlag: 'reminder_sent_24h' | 'reminder_sent_2h'
) {
  const { data } = await supabase
    .from('appointments')
    .select('*, patients(*), clinics(*)')
    .gte('start_time', startTime)
    .lte('start_time', endTime)
    .eq('status', 'confirmed')
    .eq(reminderFlag, false);

  return data ?? [];
}

export async function markReminderSent(
  appointmentId: string,
  flag: 'reminder_sent_24h' | 'reminder_sent_2h'
) {
  const { error } = await supabase
    .from('appointments')
    .update({ [flag]: true })
    .eq('id', appointmentId);

  if (error) throw new Error(`Failed to mark reminder: ${error.message}`);
}

// ── Patient Queries ─────────────────────────────────────────────

export async function getPatientByPhone(clinicId: string, phone: string) {
  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('phone', phone)
    .single();

  return data;
}

// ── Takeover Queries ────────────────────────────────────────────

export async function setTakeoverActive(conversationId: string, active: boolean) {
  const { error } = await supabase
    .from('conversations')
    .update({ takeover_active: active })
    .eq('id', conversationId);

  if (error) throw new Error(`Failed to update takeover: ${error.message}`);
}

export async function getActiveTakeovers(clinicId: string) {
  const { data } = await supabase
    .from('takeover_sessions')
    .select('*, conversations(*)')
    .eq('clinic_id', clinicId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false });

  return data ?? [];
}
