"use client";

import { useRouter } from "next/navigation";
import { FileText, CheckSquare, RefreshCw, ChevronRight, User, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const featureCards = [
  {
    icon: FileText,
    title: "Templates",
    description: "Configure your note templates",
    stat: "12 templates",
    href: "/templates",
  },
  {
    icon: CheckSquare,
    title: "Normal findings",
    description: "Automatically inserts phrases for normal findings",
    stat: "0 phrases",
    href: "#",
  },
  {
    icon: RefreshCw,
    title: "Dot phrases",
    description: "Add custom phrases to use when writing in Andalus",
    stat: "0 phrases",
    href: "#",
  },
];

const settingsLinks = [
  { icon: User, label: "My profile", href: "#" },
  { icon: Settings, label: "General settings", href: "#" },
  { icon: Building2, label: "My clinic", href: "#" },
];

export default function MyAndalusPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white px-8 py-8">
      {/* User header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-900">Dr. Naeem</p>
            <p className="text-[12px] text-gray-500">General Practitioner</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Heading */}
      <h1 className="text-[24px] font-semibold text-gray-900 mb-6">My Andalus</h1>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {featureCards.map((card) => (
          <button
            key={card.title}
            onClick={() => router.push(card.href)}
            className={cn(
              "text-left p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200 transition-all duration-200 group",
              card.title === "Templates" ? "sm:col-span-1" : ""
            )}
          >
            <card.icon className="h-6 w-6 text-gray-600 mb-3" />
            <p className="text-[14px] font-semibold text-gray-900 mb-1">{card.title}</p>
            <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">{card.description}</p>
            <p className="text-[13px] font-medium text-gray-700">{card.stat}</p>
          </button>
        ))}
      </div>

      {/* Settings links */}
      <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100">
        {settingsLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => router.push(link.href)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <link.icon className="h-4 w-4 text-gray-500" />
              <span className="text-[14px] text-gray-800 font-medium">{link.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        ))}
      </div>

      {/* LLM note */}
      <div className="mt-6 p-4 rounded-2xl bg-primary/8 border border-primary/15">
        <p className="text-[12px] font-semibold text-gray-800 mb-1">Local LLM Integration</p>
        <p className="text-[12px] text-gray-500 leading-relaxed">
          Wire in Whisper for transcription at{" "}
          <code className="bg-white px-1.5 py-0.5 rounded text-[11px] border border-gray-200">
            src/lib/local-llm/transcribe.ts
          </code>{" "}
          and a local model for note generation at{" "}
          <code className="bg-white px-1.5 py-0.5 rounded text-[11px] border border-gray-200">
            src/lib/local-llm/generate-note.ts
          </code>
          .
        </p>
      </div>
    </div>
  );
}
