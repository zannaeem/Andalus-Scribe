"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  BookOpen,
  Settings,
  ChevronDown,
  MoreHorizontal,
  X,
  ChevronRight,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Encounter {
  id: string;
  time: string;
  title: string;
  status: "recording" | "paused" | "draft" | "completed";
}

interface EncounterGroup {
  label: string;
  encounters: Encounter[];
}

const mockGroups: EncounterGroup[] = [
  {
    label: "Today",
    encounters: [
      { id: "enc-new", time: "14:02", title: "New consultation", status: "draft" },
    ],
  },
  {
    label: "Yesterday",
    encounters: [
      { id: "enc-001", time: "16:45", title: "GP SOAP (Standard)", status: "completed" },
      { id: "enc-002", time: "11:20", title: "Hypertension Follow-up", status: "completed" },
      { id: "enc-003", time: "09:10", title: "New consultation", status: "draft" },
    ],
  },
];

const statusConfig: Record<Encounter["status"], { label: string; dot: string; text: string; bg: string }> = {
  recording: { label: "In progress", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-100" },
  paused: { label: "Paused", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-100" },
  draft: { label: "Not transferred", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-100" },
  completed: { label: "Transferred", dot: "bg-gray-400", text: "text-gray-500", bg: "bg-gray-100" },
};

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "User guide", href: "/settings/clinic", icon: BookOpen },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [encountersOpen, setEncountersOpen] = useState(true);

  if (collapsed) {
    return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-[52px] bg-[#fafafa] border-r border-gray-200 flex flex-col items-center py-3 gap-4">
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
                isActive ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
            </Link>
          );
        })}
        <div className="mt-auto mb-1">
          <button
            onClick={() => router.push("/settings/clinic")}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] bg-[#fafafa] border-r border-gray-200 flex flex-col">
      {/* Top nav */}
      <div className="flex flex-col pt-2 pb-1">
        {/* Close / collapse button */}
        <div className="flex items-center justify-between px-3 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-[11px] font-bold text-black">A</span>
            </div>
            <span className="text-[13px] font-semibold text-gray-900 tracking-tight">Andalus</span>
          </div>
          <button
            onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-[15px] w-[15px] shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Onboarding progress */}
        <div className="px-4 pt-3 pb-1">
          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-primary" />
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">3 steps left</p>
        </div>
      </div>

      {/* Encounters list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <button
          onClick={() => setEncountersOpen(!encountersOpen)}
          className="w-full flex items-center justify-between px-2.5 py-2 text-[12px] font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
        >
          <span className="flex items-center gap-1.5">
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !encountersOpen && "-rotate-90")} />
            All encounters
          </span>
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        {encountersOpen && (
          <div className="mt-1 space-y-3">
            {mockGroups.map((group) => (
              <div key={group.label}>
                <p className="px-2.5 py-1 text-[11px] text-gray-400 font-medium">{group.label}</p>
                <div className="space-y-0.5">
                  {group.encounters.map((enc) => {
                    const cfg = statusConfig[enc.status];
                    const isActive = pathname === `/encounters/${enc.id}`;
                    return (
                      <Link
                        key={enc.id}
                        href={`/encounters/${enc.id}`}
                        className={cn(
                          "flex flex-col px-2.5 py-2 rounded-lg transition-colors cursor-pointer",
                          isActive ? "bg-gray-200" : "hover:bg-gray-100"
                        )}
                      >
                        <span className="text-[13px] text-gray-800 font-medium truncate">
                          {enc.time} &middot; {enc.title}
                        </span>
                        <span className={cn("inline-flex items-center gap-1 mt-0.5 text-[11px] font-medium", cfg.text)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                          {cfg.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {mockGroups.every((g) => g.encounters.length === 0) && (
          <p className="px-2.5 py-2 text-[12px] text-gray-400">
            No encounters yet. Click &apos;Start&apos; to begin.
          </p>
        )}
      </div>

      {/* Bottom section */}
      <div className="border-t border-gray-200">
        {/* Local LLM chip */}
        <div className="px-3 pt-2.5 pb-1">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Cpu className="h-3.5 w-3.5 text-primary shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-gray-800">Local LLM</p>
              <p className="text-[10px] text-gray-500">Mock mode active</p>
            </div>
          </div>
        </div>


        {/* User row */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">A</span>
            </div>
            <span className="text-[13px] font-medium text-gray-900">Dr. Naeem</span>
          </div>
          <Link href="/settings/clinic">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors">
              <Settings className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
