export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  ic_number?: string;
  total_visits: number;
  last_visit?: string;
  consent_given: boolean;
  created_at: string;
}

export interface Encounter {
  id: string;
  patient_id: string;
  patient?: Patient;
  date: string;
  duration_seconds?: number;
  template_name?: string;
  status: "recording" | "paused" | "draft" | "completed";
  chief_complaint?: string;
  transcript?: string;
  created_at: string;
}

export interface SOAPNote {
  id: string;
  encounter_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  signed_off: boolean;
  signed_off_at?: string;
  created_at: string;
}

export interface NoteTemplate {
  id: string;
  name: string;
  sections: string[];
  specialty?: string;
  is_default: boolean;
  usage_count: number;
  locked: boolean;
}

export interface ClinicUser {
  id: string;
  clinic_id: string;
  email: string;
  full_name: string;
  role: "owner" | "doctor" | "admin" | "viewer";
  created_at: string;
  last_sign_in_at?: string;
}
