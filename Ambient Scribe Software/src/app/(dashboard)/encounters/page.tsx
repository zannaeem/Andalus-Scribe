"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Filter, Mic, FileCheck, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO } from "date-fns";

const mockEncounters = [
  { id: "enc-001", patient: "Ahmad bin Karim", age: 42, type: "Follow-up", status: "completed", duration: "8 min", date: "2026-06-19T09:15:00", chief_complaint: "Hypertension review" },
  { id: "enc-002", patient: "Siti Nurhaliza", age: 31, type: "New Patient", status: "draft", duration: "12 min", date: "2026-06-19T10:30:00", chief_complaint: "Persistent cough x 3 days" },
  { id: "enc-003", patient: "Rajesh Kumar", age: 58, type: "Chronic Care", status: "completed", duration: "10 min", date: "2026-06-19T11:00:00", chief_complaint: "T2DM quarterly check" },
  { id: "enc-004", patient: "Lim Wei Ting", age: 25, type: "Acute Visit", status: "draft", duration: "6 min", date: "2026-06-19T14:15:00", chief_complaint: "Sore throat, fever" },
  { id: "enc-005", patient: "Faridah Bt Ismail", age: 67, type: "Follow-up", status: "completed", duration: "9 min", date: "2026-06-18T09:00:00", chief_complaint: "Post-op wound check" },
  { id: "enc-006", patient: "Muhammad Hafiz", age: 35, type: "Acute Visit", status: "completed", duration: "7 min", date: "2026-06-18T11:30:00", chief_complaint: "Lower back pain" },
  { id: "enc-007", patient: "Tan Mei Lin", age: 50, type: "Chronic Care", status: "completed", duration: "11 min", date: "2026-06-17T10:00:00", chief_complaint: "Asthma management" },
  { id: "enc-008", patient: "Noor Azrin Bt Azmi", age: 29, type: "New Patient", status: "completed", duration: "14 min", date: "2026-06-17T14:00:00", chief_complaint: "General health screening" },
];

const statusStyles: Record<string, string> = {
  completed: "bg-primary/10 text-primary",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
};

const typeStyles: Record<string, string> = {
  "New Patient": "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
  "Follow-up": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  "Chronic Care": "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  "Acute Visit": "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
};

export default function EncountersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "completed">("all");

  const filtered = mockEncounters.filter((enc) => {
    const matchSearch = enc.patient.toLowerCase().includes(search.toLowerCase()) ||
      enc.chief_complaint.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || enc.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Encounters</h1>
          <p className="text-[14px] text-muted-foreground mt-1">{mockEncounters.length} consultations recorded</p>
        </div>
        <Link href="/encounters/new">
          <Button className="gap-2 h-9 rounded-xl text-[13px] font-medium">
            <PlusCircle className="h-4 w-4" />
            New Encounter
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: mockEncounters.length, icon: Mic },
          { label: "Completed", value: mockEncounters.filter((e) => e.status === "completed").length, icon: FileCheck },
          { label: "Pending", value: mockEncounters.filter((e) => e.status === "draft").length, icon: Clock },
        ].map((s) => (
          <Card key={s.label} className="border border-border/60 shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[22px] font-semibold tracking-tight leading-none">{s.value}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patient or complaint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-[13px] rounded-xl border-border/60"
          />
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          {(["all", "draft", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors capitalize ${
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "draft" ? "Pending" : "Completed"}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-xl text-[12px] border-border/60">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </Button>
      </div>

      {/* Encounters List */}
      <Card className="border border-border/60 shadow-none">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mic className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-[14px] font-medium text-muted-foreground">No encounters found</p>
              <p className="text-[13px] text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.map((enc) => (
                <Link
                  key={enc.id}
                  href={`/encounters/${enc.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/8 text-primary text-[13px] font-medium">
                      {enc.patient.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-medium text-foreground">{enc.patient}</p>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[12px] text-muted-foreground">{enc.age} y/o</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{enc.chief_complaint}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className={`text-[10px] font-medium rounded-md ${typeStyles[enc.type] || ""}`}>
                      {enc.type}
                    </Badge>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-medium text-foreground">{format(parseISO(enc.date), "MMM d")}</p>
                    <p className="text-[11px] text-muted-foreground">{format(parseISO(enc.date), "h:mm a")} · {enc.duration}</p>
                  </div>

                  <Badge variant="secondary" className={`text-[10px] font-medium rounded-md shrink-0 ${statusStyles[enc.status] || ""}`}>
                    {enc.status === "draft" ? "Pending" : "Completed"}
                  </Badge>

                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
