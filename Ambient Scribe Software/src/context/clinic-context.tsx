"use client";

import { createContext, useContext } from "react";

export interface UserProfile {
  display_name: string;
  full_name: string;
  profession: string | null;
}

interface ClinicContextValue {
  clinicId: string;
  profile: UserProfile;
  loading: false;
}

const ClinicContext = createContext<ClinicContextValue>({
  clinicId: "andalus-001",
  profile: { display_name: "Dr. Naeem", full_name: "Dr. Zan Naeem", profession: "General Practitioner" },
  loading: false,
});

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClinicContext.Provider value={{
      clinicId: "andalus-001",
      profile: { display_name: "Dr. Naeem", full_name: "Dr. Zan Naeem", profession: "General Practitioner" },
      loading: false,
    }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  return useContext(ClinicContext);
}
