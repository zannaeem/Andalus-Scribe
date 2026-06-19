"use client";

import { Cpu, Mic, FileText, ChevronRight } from "lucide-react";

export default function LocalLLMPage() {
  return (
    <div className="min-h-screen bg-white px-8 py-8">
      <h1 className="text-[24px] font-semibold text-gray-900 mb-2">Local LLM Setup</h1>
      <p className="text-[14px] text-gray-500 mb-8">
        Andalus Scribe is designed to run fully offline. Wire in your local models below.
      </p>

      <div className="space-y-4">
        {/* Whisper */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Mic className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold text-gray-900">Speech-to-Text (Whisper)</p>
                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                  Wire in Whisper.cpp or faster-whisper for local transcription.
                </p>
                <code className="inline-block mt-2 text-[11px] bg-white border border-gray-200 rounded px-2 py-1 text-gray-700">
                  src/lib/local-llm/transcribe.ts
                </code>
              </div>
            </div>
            <span className="text-[11px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium shrink-0">
              Not wired
            </span>
          </div>
        </div>

        {/* Ollama */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold text-gray-900">Note Generation (LLM)</p>
                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                  Wire in Ollama (llama3, mistral, etc.) for SOAP note generation from transcripts.
                </p>
                <code className="inline-block mt-2 text-[11px] bg-white border border-gray-200 rounded px-2 py-1 text-gray-700">
                  src/lib/local-llm/generate-note.ts
                </code>
              </div>
            </div>
            <span className="text-[11px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium shrink-0">
              Not wired
            </span>
          </div>
        </div>

        {/* Hardware */}
        <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Cpu className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-gray-900">Hardware Recommendations</p>
              <ul className="mt-2 space-y-1">
                {[
                  "MacBook Pro M2+ — runs Whisper large-v3 + llama3 8B comfortably",
                  "NVIDIA GPU (8GB+ VRAM) — use CUDA-accelerated Whisper + Ollama",
                  "NVIDIA Jetson Orin — edge deployment for clinic hardware",
                ].map((item) => (
                  <li key={item} className="text-[12px] text-gray-600 flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
