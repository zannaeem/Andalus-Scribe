"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/encounters": "Encounters",
  "/encounters/new": "New Encounter",
  "/patients": "Patients",
  "/templates": "Templates",
  "/settings/clinic": "Clinic Settings",
  "/settings/users": "User Management",
  "/settings/billing": "Billing",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/encounters/") && pathname !== "/encounters/new") return "SOAP Note";
  if (pathname.startsWith("/patients/")) return "Patient Details";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Andalus Health";
}

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = getPageTitle(pathname);
  const [pendingNotes, setPendingNotes] = useState(2);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return;
    // Real notification fetch would go here
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 backdrop-blur-xl px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9 rounded-lg"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h2 className="text-[15px] font-semibold tracking-tight text-foreground flex-1">{title}</h2>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg"
          onClick={() => router.push("/encounters?filter=draft")}
        >
          <Bell className="h-4.5 w-4.5" />
          {pendingNotes > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full bg-primary text-primary-foreground border-0">
              {pendingNotes}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}
