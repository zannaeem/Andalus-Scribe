"use client";

import { useState } from "react";
import { Lock, List, LayoutGrid, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  type: "Note";
  sections: string[];
  usageCount?: number;
  locked?: boolean;
}

const templates: Template[] = [
  {
    id: "tpl-1",
    name: "Administrative Note (Tandem Standard)",
    type: "Note",
    sections: ["Note"],
    usageCount: 1,
    locked: true,
  },
  {
    id: "tpl-2",
    name: "Doctor (Tandem Standard)",
    type: "Note",
    sections: ["Reason for contact", "Past history", "Assistive devices", "Family history", "Allergies"],
    locked: true,
  },
  {
    id: "tpl-3",
    name: "Doctor SOAP (Tandem Standard)",
    type: "Note",
    sections: ["Subjective", "Objective", "Assessment & Plan"],
    locked: true,
  },
  {
    id: "tpl-4",
    name: "EMIS",
    type: "Note",
    sections: ["History", "Examination", "Measurements", "Saturation", "Blood pressure – Systolic"],
    usageCount: 13,
    locked: true,
  },
  {
    id: "tpl-5",
    name: "General Practitioner (Tandem Standard)",
    type: "Note",
    sections: ["Reason for contact", "Past medical history", "Assistive devices", "Family history", "Allergies"],
    locked: true,
  },
  {
    id: "tpl-6",
    name: "GP Note Brief",
    type: "Note",
    sections: ["History", "Allergy", "Social", "Family History", "Examination"],
    locked: true,
  },
  {
    id: "tpl-7",
    name: "Gynaecologist (Tandem Standard)",
    type: "Note",
    sections: ["Reason for contact", "Referred from", "Social", "Tobacco", "Alcohol"],
    locked: true,
  },
  {
    id: "tpl-8",
    name: "Gynecology SOAP Note (Tandem Standard)",
    type: "Note",
    sections: ["Subjective", "Objective", "Assessment and Plan"],
    locked: true,
  },
  {
    id: "tpl-9",
    name: "GP SOAP (Standard)",
    type: "Note",
    sections: ["Subjective", "Objective", "Assessment", "Plan"],
  },
  {
    id: "tpl-10",
    name: "Hypertension Follow-up",
    type: "Note",
    sections: ["Current medications", "BP readings", "Symptoms", "Examination", "Plan"],
  },
  {
    id: "tpl-11",
    name: "T2DM Quarterly Review",
    type: "Note",
    sections: ["HbA1c", "Weight & BMI", "BP", "Foot exam", "Management"],
  },
  {
    id: "tpl-12",
    name: "Message to patient",
    type: "Note",
    sections: ["Message"],
    locked: true,
  },
];

type FilterType = "All" | "Note";
type ViewMode = "grid" | "list";

export default function TemplatesPage() {
  const [filter, setFilter] = useState<FilterType>("All");
  const [view, setView] = useState<ViewMode>("grid");

  const filtered = filter === "All" ? templates : templates.filter((t) => t.type === filter);

  return (
    <div className="min-h-screen bg-white px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-gray-900">Templates</h1>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition-colors">
          <Plus className="h-3.5 w-3.5" />
          New template
        </button>
      </div>

      {/* Sub-header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-medium text-gray-800">My templates</h2>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
            {filter}
            <ChevronDown className="h-3 w-3" />
          </button>
          {/* View toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={cn(
                "w-8 h-8 flex items-center justify-center transition-colors",
                view === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-700"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn(
                "w-8 h-8 flex items-center justify-center transition-colors",
                view === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-700"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} />
          ))}
        </div>
      )}

      {/* List */}
      {view === "list" && (
        <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                {tpl.locked && <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
                <span className="text-[13px] font-medium text-gray-800 truncate">{tpl.name}</span>
                <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shrink-0">
                  {tpl.type}
                </span>
              </div>
              {tpl.usageCount !== undefined && (
                <span className="text-[12px] text-gray-400 shrink-0 ml-4">{tpl.usageCount} uses</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <div className="group border border-gray-150 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:border-gray-200">
      {/* Preview area */}
      <div className="h-[140px] bg-gray-50 px-5 pt-5 overflow-hidden relative">
        <div className="space-y-1.5">
          {template.sections.slice(0, 6).map((section, i) => (
            <div
              key={i}
              className="text-[12px] text-gray-400 truncate"
              style={{ opacity: 1 - i * 0.13 }}
            >
              {section}
            </div>
          ))}
        </div>
        {template.locked && (
          <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <Lock className="h-3 w-3 text-gray-500" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <p className="text-[13px] font-medium text-gray-900 truncate mb-1.5">{template.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            {template.type}
          </span>
          {template.usageCount !== undefined && (
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <span className="text-gray-300">◎</span>
              {template.usageCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
