import { ClinicUser } from "@/types";

export const mockUsers: ClinicUser[] = [
  {
    id: "cu-001",
    clinic_id: "andalus-001",
    email: "naeem@andalushealth.com",
    full_name: "Dr. Zan Naeem",
    role: "owner",
    created_at: "2026-01-01T00:00:00Z",
    last_sign_in_at: "2026-06-20T08:00:00Z",
  },
  {
    id: "cu-002",
    clinic_id: "andalus-001",
    email: "sarah@andalushealth.com",
    full_name: "Dr. Sarah Lim",
    role: "doctor",
    created_at: "2026-02-01T00:00:00Z",
    last_sign_in_at: "2026-06-19T17:00:00Z",
  },
];

export const currentUser = mockUsers[0];
