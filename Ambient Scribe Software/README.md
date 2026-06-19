# Andalus Health — Ambient Scribe

Offline-first AI scribe for clinicians. Records doctor–patient conversations, transcribes locally, and generates structured clinical notes — no cloud, no external APIs, fully PDPA-compliant by design.

## Quick Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects straight to the dashboard, no login required in mock mode.

## Pages

| Route | Description |
|---|---|
| `/dashboard` | Consultation workspace — start recording, view live transcript, generate note |
| `/encounters/[id]` | View and edit a generated SOAP note |
| `/templates` | Browse and manage note templates |
| `/patients` | Patient list |
| `/settings/clinic` | My Andalus — profile, settings, clinic |
| `/settings/billing` | Local LLM setup guide |
| `/settings/users` | Team members |

## Mock Mode

All data is served from local mock files — no network calls are made.

Toggle in `.env.local`:
```
NEXT_PUBLIC_USE_MOCK_DATA=true
USE_MOCK_DATA=true
```

## Local LLM Integration Points

| File | Purpose |
|---|---|
| `src/lib/local-llm/transcribe.ts` | Wire in Whisper.cpp or faster-whisper |
| `src/lib/local-llm/generate-note.ts` | Wire in Ollama (llama3, mistral, etc.) |

## Hardware

- **MacBook Pro M2+** — Whisper large-v3 + llama3 8B runs comfortably on-device
- **NVIDIA GPU (8GB+ VRAM)** — CUDA-accelerated inference via Ollama
- **NVIDIA Jetson Orin** — edge deployment for clinic hardware

## Tech Stack

Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui · Recharts · date-fns · Framer Motion
