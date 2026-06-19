"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Pause,
  Play,
  Mic,
  ChevronDown,
  MessageSquare,
  Plus,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type ConsultationState = "idle" | "recording" | "paused" | "processing";
type ActiveTab = "transcription" | "note";

const TRANSCRIPT_LINES = [
  "Patient presents with recurring headache for the past 3 days.",
  "Pain is described as throbbing, rated 7 out of 10.",
  "No fever or visual disturbances reported.",
  "Patient has history of migraines, last episode 2 months ago.",
  "Currently taking ibuprofen 400mg as needed.",
  "Blood pressure 128 over 82, pulse 74, temperature normal.",
  "No neurological deficits on examination.",
  "Assessment: Migraine without aura, acute episode.",
];

const LOADING_STEPS = [
  "Removing unnecessary information",
  "Structuring clinical note",
  "Applying GP SOAP template",
  "Finalising output",
];

export default function ConsultationPage() {
  const router = useRouter();
  const [state, setState] = useState<ConsultationState>("idle");
  const [activeTab, setActiveTab] = useState<ActiveTab>("transcription");
  const [title, setTitle] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (transcriptRef.current) clearInterval(transcriptRef.current);
  }, []);

  useEffect(() => {
    if (state === "recording") {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

      let lineIdx = transcriptLines.length;
      transcriptRef.current = setInterval(() => {
        if (lineIdx < TRANSCRIPT_LINES.length) {
          setTranscriptLines((prev) => [...prev, TRANSCRIPT_LINES[lineIdx]]);
          lineIdx++;
        }
      }, 2500);
    } else {
      stopTimer();
    }
    return stopTimer;
  }, [state, stopTimer]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptLines]);

  useEffect(() => {
    if (state !== "processing") return;
    setActiveTab("note");
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLoadingStep(step);
      if (step >= LOADING_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => router.push("/encounters/enc-new"), 600);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [state, router]);

  const handleStart = () => {
    setSeconds(0);
    setTranscriptLines([]);
    setState("recording");
    setActiveTab("transcription");
  };

  const handlePause = () => {
    setState("paused");
    setShowPauseDialog(true);
  };

  const handleResume = () => {
    setShowPauseDialog(false);
    setState("recording");
  };

  const handleFinish = () => {
    setState("processing");
    setShowPauseDialog(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const isActive = state !== "idle";
  const now = new Date();

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-6 pb-0 shrink-0">
        <div />
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            Speech-to-text
          </button>
          {isActive && (
            <button
              onClick={() => {
                setState("idle");
                setSeconds(0);
                setTranscriptLines([]);
                setTitle("");
                setActiveTab("transcription");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-black text-[13px] font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New consultation
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-8 py-4 overflow-hidden">
        {/* Encounter header — only shown when active */}
        {isActive && (
          <div className="mb-1 shrink-0">
            <p className="text-[12px] text-gray-400">
              {format(now, "EEEE, d MMMM yyyy 'at' HH:mm")}
            </p>
          </div>
        )}

        {/* Editable title */}
        {isActive && (
          <div className="mb-3 shrink-0">
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                placeholder="New consultation"
                className="text-[24px] font-medium text-gray-800 bg-transparent outline-none border-b-2 border-dashed border-gray-300 focus:border-primary w-full placeholder:text-gray-400"
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="flex items-center gap-2 group"
              >
                <h1 className="text-[24px] font-medium text-gray-700 border-b-2 border-dashed border-gray-200 pb-0.5">
                  {title || "New consultation"}
                </h1>
                <Pencil className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        )}

        {/* Tabs — only shown when active */}
        {isActive && (
          <div className="flex items-center gap-1 mb-4 shrink-0">
            {(["transcription", "note"] as ActiveTab[]).map((tab) => (
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
        )}

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">

          {/* IDLE STATE */}
          {state === "idle" && (
            <div className="flex flex-col items-center gap-5 select-none">
              <div className="text-center">
                <h2 className="text-[22px] font-semibold text-gray-900">Hello Dr. Naeem</h2>
                <p className="text-[14px] text-gray-500 mt-1">Press start to begin consultation</p>
              </div>
              <button
                onClick={handleStart}
                className="px-16 py-3.5 rounded-full bg-gray-900 text-white text-[15px] font-medium hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg"
              >
                Start
              </button>
            </div>
          )}

          {/* RECORDING STATE */}
          {(state === "recording" || state === "paused") && activeTab === "transcription" && (
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Orb */}
              <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>

                {/* Ripple ring 1 — fires outward continuously */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 300, height: 300,
                    background: "radial-gradient(circle, rgba(0,246,155,0.18) 0%, transparent 65%)",
                    animation: state === "recording" ? "orb-ripple 2.8s ease-out infinite" : "none",
                    opacity: state === "paused" ? 0 : undefined,
                    transition: "opacity 0.6s",
                  }}
                />

                {/* Ripple ring 2 — offset phase */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 300, height: 300,
                    background: "radial-gradient(circle, rgba(0,246,155,0.12) 0%, transparent 65%)",
                    animation: state === "recording" ? "orb-ripple 2.8s ease-out infinite 1.4s" : "none",
                    opacity: state === "paused" ? 0 : undefined,
                    transition: "opacity 0.6s",
                  }}
                />

                {/* Outer soft haze — breathes slowly */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 240, height: 240,
                    background: "radial-gradient(circle, rgba(0,246,155,0.12) 0%, rgba(0,246,155,0.04) 55%, transparent 75%)",
                    animation: state === "recording" ? "orb-breathe-outer 3.6s ease-in-out infinite" : "none",
                    opacity: state === "paused" ? 0.08 : undefined,
                    transition: "opacity 0.8s",
                  }}
                />

                {/* Mid glow ring — breathes at different rate */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 190, height: 190,
                    background: "radial-gradient(circle, rgba(0,246,155,0.28) 0%, rgba(0,246,155,0.08) 60%, transparent 80%)",
                    animation: state === "recording" ? "orb-breathe-mid 2.4s ease-in-out infinite 0.3s" : "none",
                    opacity: state === "paused" ? 0.15 : undefined,
                    transition: "opacity 0.8s",
                  }}
                />

                {/* Inner bright glow — fastest breath */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 148, height: 148,
                    background: "radial-gradient(circle, rgba(0,246,155,0.55) 0%, rgba(0,246,155,0.25) 50%, transparent 80%)",
                    animation: state === "recording" ? "orb-breathe 2s ease-in-out infinite 0.1s" : "none",
                    opacity: state === "paused" ? 0.2 : undefined,
                    transition: "opacity 0.8s",
                  }}
                />

                {/* Core orb body */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 130, height: 130,
                    background: state === "recording"
                      ? "radial-gradient(circle at 38% 32%, rgba(0,246,155,0.85) 0%, rgba(0,246,155,0.55) 40%, rgba(0,200,120,0.3) 75%, transparent 100%)"
                      : "radial-gradient(circle at 38% 32%, rgba(180,180,180,0.6) 0%, rgba(140,140,140,0.3) 70%)",
                    animation: state === "recording" ? "orb-core-glow 2s ease-in-out infinite" : "none",
                    transition: "background 0.8s, opacity 0.8s",
                    opacity: state === "paused" ? 0.3 : 1,
                  }}
                />

                {/* Pause/Play button — sits on top of all layers */}
                <button
                  onClick={handlePause}
                  className="relative z-10 w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-700 active:scale-95 transition-all shadow-xl"
                >
                  <Pause className="h-5 w-5 text-white fill-white" />
                </button>
              </div>

              {/* Timer and status */}
              <div className="text-center">
                <p className="text-[28px] font-semibold tabular-nums text-gray-900 tracking-tight">
                  {formatTime(seconds)}
                </p>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  {state === "recording" ? "Listening..." : "Paused"}
                </p>
              </div>
            </div>
          )}

          {/* TRANSCRIPTION CONTENT */}
          {(state === "recording" || state === "paused") && activeTab === "transcription" && transcriptLines.length > 0 && (
            <div className="absolute bottom-20 left-[calc(240px+2rem)] right-8 max-h-[180px] overflow-y-auto">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
                {transcriptLines.map((line, i) => (
                  <p key={i} className="text-[13px] text-gray-600 leading-relaxed">{line}</p>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          )}

          {/* PROCESSING STATE */}
          {state === "processing" && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-medium text-gray-900">Generating note</p>
                <p className="text-[13px] text-gray-400 mt-1">
                  {LOADING_STEPS[Math.min(loadingStep, LOADING_STEPS.length - 1)]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pause dialog */}
      {showPauseDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-gray-900">Keep recording for a better note</h3>
              <button
                onClick={() => setShowPauseDialog(false)}
                className="text-gray-400 hover:text-gray-600 -mt-0.5 -mr-1"
              >
                ×
              </button>
            </div>
            <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
              Record for at least 30 seconds to get the best results. Or stop now and generate a note from your short recording.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleFinish}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Stop and generate note
              </button>
              <button
                onClick={handleResume}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition-colors"
              >
                Resume recording
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom toolbar — shown during/after recording */}
      {isActive && state !== "processing" && (
        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
              Template: GP SOAP (Standard)
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
              <Pencil className="h-3 w-3" />
              Add text
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-50 transition-colors">
              <Mic className="h-3 w-3" />
              Microphone (Built-in)
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={handleFinish}
            className="px-5 py-2 rounded-xl bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition-colors"
          >
            Finish and create note
          </button>
        </div>
      )}

      {/* Encounter settings link */}
      {state === "idle" && (
        <div className="shrink-0 flex justify-center pb-4">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronDown className="h-3.5 w-3.5" />
            Encounter settings
          </button>
        </div>
      )}
    </div>
  );
}
