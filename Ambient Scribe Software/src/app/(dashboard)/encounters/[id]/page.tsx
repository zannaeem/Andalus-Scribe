"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  Copy,
  Sparkles,
  Plus,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface NoteSection {
  label: string;
  content: string;
}

const mockNotes: Record<string, { title: string; status: string; date: Date; template: string; sections: NoteSection[] }> = {
  "enc-new": {
    title: "GP SOAP (Standard)",
    status: "draft",
    date: new Date(),
    template: "GP SOAP (Standard)",
    sections: [
      {
        label: "Subjective",
        content:
          "Patient presents with recurring headache for the past 3 days. Pain described as throbbing, rated 7/10. No fever or visual disturbances reported. History of migraines, last episode 2 months ago. Currently taking ibuprofen 400mg PRN.",
      },
      {
        label: "Objective",
        content:
          "BP 128/82 mmHg, Pulse 74 bpm, Temperature 36.8°C. Alert and orientated. No neurological deficits on examination. Pupils equal and reactive to light. No neck stiffness.",
      },
      {
        label: "Assessment",
        content:
          "Migraine without aura, acute episode (G43.0). Differential includes tension-type headache.",
      },
      {
        label: "Plan",
        content:
          "- Sumatriptan 50mg stat if not already taken\n- Continue ibuprofen 400mg TDS with food for 3 days\n- Rest in dark, quiet room\n- Adequate hydration\n- Return if no improvement in 48 hours or new neurological symptoms\n- Migraine diary recommended",
      },
    ],
  },
  "enc-001": {
    title: "GP SOAP (Standard)",
    status: "completed",
    date: new Date(Date.now() - 86400000),
    template: "GP SOAP (Standard)",
    sections: [
      {
        label: "Subjective",
        content:
          "Follow-up for hypertension. Patient reports feeling well. No chest pain, shortness of breath, or oedema. Compliant with amlodipine 5mg daily. Home BP readings averaging 138/88 mmHg.",
      },
      {
        label: "Objective",
        content:
          "BP 136/86 mmHg, Pulse 72 bpm. No peripheral oedema. Heart sounds normal. Weight stable at 78kg.",
      },
      {
        label: "Assessment",
        content: "Hypertension, controlled (I10). BP improving but not yet at target.",
      },
      {
        label: "Plan",
        content:
          "- Increase amlodipine to 10mg daily\n- Continue low-sodium diet\n- Increase physical activity to 30 min brisk walk daily\n- Repeat BP check in 4 weeks\n- Annual bloods due next month",
      },
    ],
  },
  "enc-002": {
    title: "Hypertension Follow-up",
    status: "completed",
    date: new Date(Date.now() - 86400000 * 2),
    template: "Hypertension Follow-up",
    sections: [
      {
        label: "Subjective",
        content: "Review of HbA1c results. Patient managing diet well. No hypoglycaemic episodes.",
      },
      {
        label: "Objective",
        content: "HbA1c 7.2% (improved from 7.8%). Weight 82kg. BP 134/80 mmHg.",
      },
      {
        label: "Assessment",
        content: "Type 2 diabetes mellitus, improving control (E11).",
      },
      {
        label: "Plan",
        content:
          "- Continue metformin 1g BD\n- Reinforce dietary advice\n- Review in 3 months with repeat HbA1c\n- Foot and eye review due",
      },
    ],
  },
  "enc-003": {
    title: "New consultation",
    status: "draft",
    date: new Date(Date.now() - 86400000 * 3),
    template: "GP SOAP (Standard)",
    sections: [
      { label: "Subjective", content: "Sore throat for 4 days. Mild fever. Difficulty swallowing." },
      { label: "Objective", content: "Temp 37.8°C. Tonsils enlarged with exudate bilaterally." },
      { label: "Assessment", content: "Tonsillitis, bacterial likely (J03.9)." },
      {
        label: "Plan",
        content:
          "- Amoxicillin 500mg TDS for 7 days\n- Paracetamol for fever\n- Salt water gargle\n- Return if not improving in 5 days",
      },
    ],
  },
};

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  draft: { label: "Not transferred", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  completed: { label: "Transferred", dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200" },
};

export default function EncounterNotePage() {
  const { id } = useParams<{ id: string }>();
  const note = mockNotes[id as string] || mockNotes["enc-new"];
  const cfg = statusConfig[note.status] || statusConfig.draft;

  const [sections, setSections] = useState(note.sections);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"transcription" | "note">("note");

  const handleCopy = () => {
    const text = sections.map((s) => `${s.label}\n${s.content}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-6 pb-0 shrink-0">
        <div />
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
            Speech-to-text
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-black text-[13px] font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            New consultation
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-8 py-4 overflow-hidden">
        {/* Date + status */}
        <div className="flex items-center gap-2.5 mb-2 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
              cfg.bg,
              cfg.text,
              cfg.border
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
            {cfg.label}
          </span>
          <span className="text-[12px] text-gray-400">
            {format(note.date, "EEEE, d MMMM yyyy 'at' HH:mm")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[24px] font-medium text-gray-800 border-b-2 border-dashed border-gray-200 pb-0.5 mb-4 shrink-0 w-fit">
          {note.title}
        </h1>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 shrink-0">
          {(["transcription", "note"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors capitalize",
                activeTab === tab
                  ? "bg-primary/15 text-gray-900 border border-primary/30"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              {tab === "transcription" ? "Transcription" : "Note"}
            </button>
          ))}
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            Create new <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Note content */}
        {activeTab === "note" && (
          <div className="flex-1 overflow-y-auto border border-gray-100 rounded-2xl">
            <div className="divide-y divide-gray-100">
              {sections.map((section, idx) => (
                <div key={section.label} className="flex min-h-[80px]">
                  {/* Label column */}
                  <div className="w-[200px] shrink-0 px-6 py-5">
                    <span className="text-[13px] font-semibold text-gray-700">{section.label}</span>
                  </div>

                  {/* Content column */}
                  <div className="flex-1 px-4 py-5 pr-6">
                    {editingIdx === idx ? (
                      <textarea
                        autoFocus
                        value={section.content}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[idx] = { ...updated[idx], content: e.target.value };
                          setSections(updated);
                        }}
                        onBlur={() => setEditingIdx(null)}
                        className="w-full text-[13px] text-gray-700 leading-relaxed bg-transparent outline-none resize-none min-h-[100px] border-b border-dashed border-gray-300 focus:border-primary"
                      />
                    ) : (
                      <p
                        onClick={() => setEditingIdx(idx)}
                        className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line cursor-text hover:bg-gray-50 rounded-lg px-1 -mx-1 py-0.5 transition-colors"
                      >
                        {section.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcription tab */}
        {activeTab === "transcription" && (
          <div className="flex-1 overflow-y-auto border border-gray-100 rounded-2xl p-6">
            <p className="text-[13px] text-gray-400 italic">
              No transcription stored for this encounter.
            </p>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
            Template: {note.template.substring(0, 18)}
            {note.template.length > 18 ? "..." : ""}
            <ChevronDown className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
            <Plus className="h-3 w-3" />
            Add entry
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 text-[12px] font-medium text-gray-800 border border-primary/30 hover:bg-primary/20 transition-colors">
            <Sparkles className="h-3 w-3" />
            Adjust
          </button>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
