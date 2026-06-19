# Andalus Health Ambient Scribe Product Requirements Document

**Version:** 1.1  
**Date:** June 2026  
**Product Owner:** Andalus Health — Zan Naeem  
**Product Name:** Andalus Health Ambient Scribe  
**Target Market:** Clinicians in outpatient settings (GPs, specialists, allied health) — starting with pilot users in Malaysia  
**Status:** Ready for Development (Foundation: UI/UX from Humance Dashboard)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Competitive Landscape](#competitive-landscape)
3. [User Personas](#user-personas)
4. [Core Features (MVP)](#core-features-mvp)
5. [Technical Architecture](#technical-architecture)
6. [Data Models](#data-models)
7. [Local LLM Integration Strategy](#local-llm-integration-strategy)
8. [Next.js Application Structure](#nextjs-application-structure)
9. [Mock Data Strategy (Offline-First)](#mock-data-strategy-offline-first)
10. [User Stories (Prioritized)](#user-stories-prioritized)
11. [Success Metrics](#success-metrics)
12. [Risks & Mitigations](#risks--mitigations)
13. [Go-to-Market Strategy](#go-to-market-strategy)
14. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### Problem Statement

Clinicians spend 30–50% of their working time on documentation — writing SOAP notes, referral letters, and clinical summaries after each patient encounter. This administrative burden leads to:
- **Physician burnout** (documentation cited as top cause in Malaysia and globally)
- **Reduced face time** with patients (doctors look at screens, not patients)
- **Late/incomplete notes** (written retrospectively from memory → clinical errors)
- **Consultation throughput limits** (cannot see more patients due to note-writing bottleneck)

Existing solutions fall into three inadequate categories for Malaysian hospitals:
- **Cloud scribes** (Tandem Health, Heidi Health, Nuance DAX): patient data exits Malaysia, cloud-dependent, not PDPA-aligned, no MDA clearance
- **Proprietary edge hardware** (aiMai — MDA-cleared, operating in Malaysia): offline-capable but requires purchasing and maintaining vendor hardware; IT procurement overhead; black-box LLM with no model control
- **Integrated device platforms** (Keikku — FDA-cleared, US/UK focus): clinically sophisticated (stethoscope + scribe) but no MDA clearance, no PDPA compliance story, premium hardware cost in USD

**The gap for Malaysian hospitals:** No solution exists that is (a) offline-first, (b) runs on existing hospital infrastructure without hardware purchase, (c) gives IT teams full control over the AI models, and (d) is built for Malaysian clinical workflows and PDPA compliance from day one.

### Solution

Andalus Health Ambient Scribe is an **offline-first, ambient AI scribe** that:
- **Listens** to doctor-patient conversations during the encounter (with consent)
- **Transcribes** speech to text locally using a Whisper model running on-device
- **Generates** a structured clinical note (SOAP / clinical letter format) using a local LLM
- **Presents** a draft note for the doctor to review and approve in under 30 seconds
- **Requires zero internet** — all inference runs locally; no patient data ever leaves the device

The clinician reviews, edits if needed, and signs off. Andalus Health Ambient Scribe cuts documentation time from 5–10 minutes to under 60 seconds per encounter.

### Differentiation vs. Key Competitors

| Feature | Tandem Health | Heidi Health | aiMai | Keikku | **Andalus Health Ambient Scribe** |
|---------|-------------|-------------|-------|--------|--------------------------|
| Cloud-based | Yes | Yes | **No — edge hardware** | Yes (cloud scribe) | **No — 100% local software** |
| Patient data leaves device | Yes | Yes | No | Yes | **Never** |
| Works without internet | No | No | **Yes (proprietary hardware)** | Partial | **Yes (runs on clinic PC)** |
| Offline LLM note generation | No | No | Yes (black-box hardware) | No | **Yes — open, configurable LLM** |
| Malaysian market presence | No | No | **Yes — MDA cleared, deployed** | No | **Yes — built for Malaysia** |
| Requires proprietary hardware | No | No | **Yes — vendor lock-in** | Yes (stethoscope device) | **No — runs on any Windows/Mac** |
| PDPA-compliant by design | Cloud T&Cs | Cloud T&Cs | Yes | HIPAA/GDPR only | **Yes — data never leaves clinic** |
| Open model selection | No | No | No (closed system) | No | **Yes — doctor chooses LLM** |
| Pricing model | Per user SaaS | Per user SaaS | Hardware + licensing | Hardware + SaaS | **Self-hosted, clinic-owned** |
| Digital stethoscope integration | No | No | No | **Yes (FDA-cleared)** | Roadmap (v2) |
| ICD-10 / CPT code generation | No | No | Unknown | **Yes** | Roadmap (v2) |
| Malaysian clinical templates | No | No | Partial | No | **Yes — core feature** |

### Tech Stack Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Frontend** | Next.js 16 (App Router, Turbopack) | Existing foundation from Humance Dashboard |
| **UI Components** | shadcn/ui + Tailwind CSS v4 | Already built — keeping design system intact |
| **Transcription** | OpenAI Whisper (local model via `whisper.cpp` or Ollama) | Best OSS speech-to-text; runs on M-series Mac or Windows with GPU |
| **Note Generation** | Local LLM via Ollama (e.g., Llama 3.1 8B, Mistral) | Offline inference; no API keys needed |
| **Storage** | Browser `localStorage` / JSON files (MVP) → SQLite (v2) | Zero external DB dependency |
| **Auth** | None for MVP (local single-user app) | CTO adds auth in v2 |
| **Deployment** | `npm run dev` locally / Electron (future) | Doctor runs on clinic workstation |

---

## Competitive Landscape

### Threat Assessment Summary

Two companies require immediate strategic attention. Both are already in market.

---

### Competitor 1: aiMai Technologies — HIGH THREAT ⚠️

**Website:** https://www.aimai.ai  
**Status: MDA-cleared, deployed in Malaysia. This is our most dangerous direct competitor.**

#### What They Do
aiMai builds a **plug-and-play, portable edge AI hardware hub** for healthcare settings with no internet connectivity. Their device creates its own private local Wi-Fi network and supports clinical staff through mobile terminals.

**Three technical pillars:**
1. **Clinical Intelligence** — Locally hosted medical knowledge base for triage, diagnosis, treatment planning
2. **Workflow Automation** — Multilingual voice-to-text technology that auto-generates clinical documentation (ambient scribe)
3. **Privacy Architecture** — Federated Learning that improves AI models without moving patient data off-site

#### Why They're Dangerous
- **Already MDA-cleared in Malaysia** — they've done the regulatory groundwork we have not started
- **Already deployed** at premier Malaysian medical institutions serving hundreds of thousands of patients annually
- **Offline-first hardware** is exactly our architecture claim — they own this positioning in Malaysia today
- **Reduced AI response latency from 120 to 15 seconds** via proprietary model optimization — they have production-validated performance
- **PDPA compliant** — they've solved the same compliance story we're building toward
- **Team spans US and Asia** — well-resourced, not a local startup
- **Government partnerships** — targeting governments bridging digital health divides (Ministry of Health alignment possible)

#### Their Weaknesses (Our Openings)
- **Proprietary hardware = vendor lock-in** — clinics must buy aiMai's device; Andalus Health runs on existing clinic hardware (zero capex)
- **Black-box system** — clinicians cannot choose or switch LLM models; Andalus Health Ambient Scribe is fully configurable
- **Not a pure scribe product** — aiMai is a broad clinical intelligence platform (triage, diagnosis, documentation); Andalus Health is laser-focused on documentation speed
- **Enterprise/government GTM** — they target health systems and governments; Andalus Health targets individual doctors and small clinics (faster sales cycle)
- **No product-led growth** — no public pricing, no freemium, no self-serve; Andalus Health can be downloaded and running in 5 minutes
- **High upfront cost** (hardware) — Andalus Health has zero hardware cost

#### Strategic Response
- **Do not compete head-on** on offline edge AI infrastructure — aiMai wins that framing
- **Compete on accessibility**: Andalus Health requires no hardware purchase; doctors try it free, adopt instantly
- **Compete on clinician UX**: aiMai is built for hospitals/governments; Andalus Health is built for the individual doctor's workflow
- **Accelerate MDA clearance** as a priority — without it, hospital procurement will choose aiMai
- **Explore partnership** — aiMai's hardware could run Andalus Health's software stack; they are a potential channel, not just a competitor

---

### Competitor 2: Keikku — MEDIUM THREAT, STRONG PRODUCT 📊

**Website:** https://keikku.health  
**Status: FDA-cleared. No Malaysian presence. Premium hardware + software play.**

#### What They Do
Keikku is an **FDA-cleared clinical AI platform** combining three integrated products in one device:

1. **Scribe** — Ambient documentation generating SOAP notes, ICD-10 codes, CPT codes from real-time consultation audio
2. **Reference** — Evidence-based clinical answers synthesized from 3M+ peer-reviewed articles with source citations (like a smart UpToDate)
3. **Auscultation** — FDA-cleared digital stethoscope with 40x amplification, active noise cancellation, murmur detection (AI-powered, validated at Johns Hopkins and Stanford)

**Hardware specs:** Voice-activated, clinical-grade microphone array, wireless, purpose-built for noisy clinical environments (ICU, ambulance, paediatrics)

**Integrations:** Epic, Cerner, FHIR (native EHR integration for enterprise)

**Compliance:** FDA-cleared, ISO 13485, HIPAA, GDPR, VA-approved

**Geographic presence:** USA, UK, Peru, Saudi Arabia — **not yet Malaysia**

**Partners:** NVIDIA, Nordic Semiconductor, NHS, eMurmur, Clínica Internacional

#### Why They're Notable
- **Most clinically sophisticated** ambient scribe in the market — the combination of scribe + reference + stethoscope in one workflow is genuinely differentiated
- **FDA clearance** gives serious enterprise credibility; hospital procurement committees will shortlist them
- **ICD-10/CPT auto-coding** is a feature Malaysian private hospitals need for insurance billing
- **Murmur detection** at 87% sensitivity (validated at Johns Hopkins) is a clinical capability no scribe competitor has
- **Specialty-specific templates** (cardiology, psychiatry, OB/GYN, paediatrics, internal medicine) — far more granular than generic SOAP

#### Why They're Not an Immediate Threat in Malaysia
- **No Malaysian presence, no MDA clearance** — entering Malaysia from a US/UK base requires significant regulatory and sales investment
- **Premium hardware product** — requires device purchase; doesn't align with Malaysian GP clinic economics
- **HIPAA/GDPR only** — not explicitly PDPA-compliant; MDA clearance not mentioned
- **Complex enterprise sales** — not self-serve; wrong motion for Malaysian GP market

#### What We Can Learn From Them
- **ICD-10 code generation is table stakes** in v2 — private hospitals in Malaysia use this for billing; add to roadmap
- **Specialty templates matter** — launch with GP/SOAP but immediately build cardiologist, psychiatrist, paediatric templates
- **Hardware microphone quality matters** — their purpose-built clinical mic beats a laptop mic; we should support/recommend external USB medical-grade mic for v2
- **Evidence reference is a differentiated add-on** — "Andalus Health Reference" powered by local PubMed mirror could be a meaningful v2 feature

---

### Competitor 3: Tandem Health & Heidi Health — LOWER THREAT IN MALAYSIA

Both are cloud-based pure-software ambient scribes with no Malaysia/APAC presence, no PDPA compliance story, and no offline capability. They are benchmarks for UX and feature quality, not direct market threats in Malaysia for now.

**Key learning from Heidi Health:** They have a strong freemium funnel — doctors try free for 10 encounters/month, convert to paid. **Andalus Health should mirror this motion** with the mock mode as the "always free" tier.

---

### Competitor 4: Dragon Medical / Nuance DAX (Microsoft)

Enterprise-grade, cloud-dependent, USD-priced, requires IT procurement. Irrelevant for small Malaysian clinics. Mentioned here because large hospital IT departments will compare against it.

---

### Competitive Positioning Map

```
                    HIGH CLINICAL SOPHISTICATION
                              │
                         Keikku │
                    (FDA, stethoscope,
                     ICD-10, NVIDIA)│
                              │
HARDWARE                      │                      SOFTWARE
REQUIRED ─────────────────────┼────────────────────── ONLY
                              │
                    aiMai     │            Andalus Health ◀ WE ARE HERE
                (MDA cleared, │         (zero hardware,
                 edge hub,    │          offline, Malaysia-
                 Malaysia)    │          first, open LLM)
                              │
                   Tandem / Heidi
                  (cloud, no Malaysia)
                              │
                    LOW CLINICAL SOPHISTICATION
```

**Andalus Health's defensible position:** Pure software, runs on clinic's existing hardware, Malaysia-first, offline, open LLM, self-serve. No competitor owns this quadrant in Malaysia today — aiMai is closest but requires hardware purchase.

---

### Persona 1: Dr. Zan (GP / Primary Care Physician)

- **Role:** General Practitioner, 20–40 patients/day
- **Pain Points:** Writes SOAP notes after every consult; clinic closes late because documentation runs over; high mental load maintaining eye contact + taking notes simultaneously
- **Goals:** Finish documentation before the next patient enters; reduce after-hours admin; never lose a key clinical detail from conversations
- **Technical Proficiency:** Medium — uses EMR daily, not a developer
- **Session Pattern:** Opens Andalus Health Scribe at start of clinic session, records each consultation, reviews and signs off notes, exports to paste into EMR

### Persona 2: Dr. Aisha (Specialist — Internal Medicine)

- **Role:** Specialist in a hospital outpatient clinic
- **Pain Points:** Complex cases with 10+ problems per note; referral letters take 15 minutes each; junior MOs write poor-quality notes
- **Goals:** Generate structured referral letters instantly; maintain high note quality under time pressure; train junior doctors via high-quality AI-assisted note examples
- **Technical Proficiency:** Medium-Low
- **Session Pattern:** Uses Andalus Health Scribe for complex cases and referral letter generation; simple notes still done manually

### Persona 3: CTO / Developer (Andalus Health Engineering)

- **Role:** Technical lead responsible for building and deploying Andalus Health Scribe
- **Pain Points:** Needs a clean, well-structured Next.js codebase to extend; cannot spend weeks understanding legacy dependencies
- **Goals:** Clone repo, run `npm run dev`, see a working demo immediately; wire in local LLM models without rewriting frontend logic; add real storage later
- **Technical Proficiency:** High — senior software engineer
- **Session Pattern:** Reads README, sets up local environment, runs app with mock data, identifies LLM stub points, begins integration

### Persona 4: Clinic Administrator

- **Role:** Manages clinic operations (not clinical)
- **Pain Points:** Doctors not finishing notes on time → billing issues; unsigned notes in EMR
- **Goals:** Dashboard showing note completion rate; know which encounters are pending doctor sign-off
- **Technical Proficiency:** Low-Medium

---

## Core Features (MVP)

### Feature 1: Encounter Recording

**User Story:**  
*"As Dr. Zan, I want to start recording a patient encounter with one tap and have the audio transcribed automatically, so I don't have to type anything during the consultation."*

**Flow:**
1. Doctor opens the New Encounter screen, enters patient name / MRN (optional)
2. Taps **Start Recording** — microphone begins capturing audio
3. During consultation, live transcript appears in real-time (word-by-word via Whisper streaming)
4. Doctor taps **Stop Recording** when encounter ends
5. System sends audio/transcript to local LLM note generator
6. Draft clinical note appears within 10–30 seconds

**Technical Requirements:**
- Browser Web Audio API for microphone capture (`MediaRecorder`)
- Audio chunked and sent to local Whisper endpoint (`http://localhost:11434` via Ollama or `whisper.cpp` REST server)
- Real-time transcript displayed in `<EncounterTranscript />` component
- On stop: full transcript sent to local LLM with SOAP note generation prompt
- Draft note rendered in `<NoteEditor />` component (rich text / structured fields)

**Acceptance Criteria:**
- [ ] One-tap start/stop recording with visual recording indicator
- [ ] Live transcript visible during recording
- [ ] Draft note generated within 30 seconds of stopping
- [ ] Note includes SOAP structure (Subjective, Objective, Assessment, Plan)
- [ ] Works with no internet connection (all inference local)

---

### Feature 2: AI Note Generation (SOAP + Clinical Templates)

**User Story:**  
*"As Dr. Zan, I want the AI to produce a structured SOAP note from the transcript, following the format I use in my clinic, so I only need to review and sign — not rewrite."*

**Note Templates:**
- **SOAP Note** (default for GP encounters)
- **Referral Letter** (specialist referral with reason, history, investigations)
- **Medical Certificate** (diagnosis, duration, signature placeholder)
- **Discharge Summary** (inpatient use case — future)
- **Custom Template** (clinic defines their own schema via settings)

**SOAP Note Structure:**
```
Patient: [Name] | Date: [Date] | Doctor: [Name]
Encounter Type: [GP Consult / Follow-up / Specialist Review]

S — SUBJECTIVE
[Chief complaint, HPC, history, patient's own words from transcript]

O — OBJECTIVE
[Vitals if mentioned, physical examination findings from transcript]

A — ASSESSMENT
[Diagnosis / differential diagnoses identified from consultation]

P — PLAN
[Management plan: medications, investigations, referrals, follow-up]

Notes: [Any additional clinical notes / red flags / safety-netting]
Doctor Sign-off: _________________ Date: _____________
```

**LLM Prompt Engineering (CTO stub):**
- System prompt instructs the model to: extract clinical information from transcript, format per Malaysian clinical conventions, never fabricate information not present in transcript, flag ambiguous sections with `[UNCLEAR]` marker
- Temperature: 0.1 (low, deterministic clinical output)
- Model: configurable via settings (defaults to `llama3.1:8b`)

**Acceptance Criteria:**
- [ ] Note generated follows selected template
- [ ] AI marks uncertain sections as `[UNCLEAR - please verify]`
- [ ] Doctor can edit any field in the note before saving
- [ ] Template selection persists as user preference

---

### Feature 3: Note Review & Sign-Off

**User Story:**  
*"As Dr. Zan, I want to review the AI-generated note, make quick edits, and sign off — all in under 60 seconds."*

**Flow:**
1. Draft note appears in structured editor after generation
2. Doctor reads through, clicks any field to edit inline
3. Can accept the full note with one click ("Looks Good") or modify
4. Clicks **Sign & Save** — note status changes to "Signed"
5. Note saved to local storage, available in Encounters history

**Technical Requirements:**
- `<NoteEditor />` — structured form component (not free-text; each SOAP section is a separate `<textarea>`)
- Track draft vs. signed status
- "Regenerate" button to re-run LLM on same transcript with different template
- "Copy to Clipboard" button for pasting into external EMR
- Keyboard shortcut: `Cmd+Enter` to sign and save

**Acceptance Criteria:**
- [ ] All SOAP fields individually editable
- [ ] Sign-off action saves note with timestamp and "signed" status
- [ ] Unsigned notes visible in dashboard as "Pending Review"
- [ ] Copy-to-clipboard copies formatted plain text of note

---

### Feature 4: Encounter Dashboard (Today's Sessions)

**User Story:**  
*"As Dr. Zan, I want to see all my encounters for today at a glance — how many are done, how many notes are pending sign-off, and quick access to each note."*

**Dashboard KPIs (today):**
- Encounters Completed
- Notes Signed
- Notes Pending Review
- Average Note Generation Time

**Encounter List (Today):**
- Each row: Patient Name | Time | Duration | Status (Recording / Draft / Signed) | Actions
- Click to open note
- Filter by status
- "New Encounter" CTA button

**Technical Requirements:**
- Reads from mock data store / local storage
- Real-time status update as encounters progress
- Empty state for new users with "Start your first encounter" CTA

---

### Feature 5: Encounter History

**User Story:**  
*"As Dr. Zan, I want to search through past encounters to review a patient's note from 3 weeks ago before their follow-up today."*

**History Page:**
- Paginated list of all past encounters (newest first)
- Search by: patient name, date, keyword in note
- Filter by: date range, template type, sign-off status
- Click to open read-only view of note (with "Re-open for editing" option)

**Technical Requirements:**
- Sorted, searchable list of all saved encounters
- Encounter data stored in-browser (localStorage) or local JSON files

---

### Feature 6: Patient Management (Lightweight)

**User Story:**  
*"As Dr. Zan, I want to attach encounters to a patient record so I can see their full history in one place — without setting up a whole EMR."*

**Patient Record:**
- Name, date of birth, MRN (optional), phone
- Encounter history linked to this patient
- No sensitive data stored (IC, address) — this is a scribe tool, not a full EMR

**Note:** This is intentionally lightweight. Andalus Health Scribe is a **documentation tool**, not an EMR. The doctor's existing EMR remains source of truth for the full patient record.

---

### Feature 7: Note Templates Manager

**User Story:**  
*"As Dr. Zan, I want to customize the SOAP note template to include fields specific to my specialty, so the AI output is already formatted the way I need."*

**Templates Page:**
- List of built-in templates (SOAP, Referral Letter, Med Cert)
- "Duplicate and Customize" to create clinic-specific variant
- Edit template fields, section labels, default instructions to LLM
- Set default template for new encounters

---

### Feature 8: Settings

**Technical Settings (for CTO):**
- Local Whisper endpoint URL (default: `http://localhost:11434/api/transcribe`)
- Local LLM endpoint URL (default: `http://localhost:11434/api/generate`)
- LLM model name (default: `llama3.1:8b`)
- Transcription language (default: English; Malay option for future)

**Clinic Settings:**
- Doctor name (used in note header)
- Clinic name
- Default note template
- Audio input device selection

---

## Technical Architecture

### System Architecture — Offline First

```
                  ┌─────────────────────────────────────────┐
                  │         DOCTOR'S LOCAL WORKSTATION       │
                  │                                          │
  ┌─────────────┐ │  ┌──────────────────────────────────┐   │
  │  Microphone │─┼─→│  Browser (Next.js — Andalus Health Scribe UI)    │   │
  └─────────────┘ │  │                                  │   │
                  │  │  /dashboard — Today's encounters  │   │
                  │  │  /encounter/[id] — Live record    │   │
                  │  │  /encounters — History            │   │
                  │  │  /patients — Patient list         │   │
                  │  │  /templates — Note templates      │   │
                  │  │  /settings — LLM config           │   │
                  │  └──────────┬───────────┬────────────┘   │
                  │             │           │                 │
                  │             ▼           ▼                 │
                  │  ┌──────────────┐ ┌───────────────────┐  │
                  │  │ Whisper      │ │  Local LLM        │  │
                  │  │ (whisper.cpp │ │  (Ollama + LLaMA  │  │
                  │  │  or Ollama)  │ │   or Mistral)     │  │
                  │  │             │ │                   │  │
                  │  │ Audio → Text│ │ Transcript → Note │  │
                  │  └──────────────┘ └───────────────────┘  │
                  │             │           │                 │
                  │             ▼           ▼                 │
                  │  ┌────────────────────────────────────┐  │
                  │  │  Local Storage / SQLite (future)   │  │
                  │  │  Encounters, Notes, Patients        │  │
                  │  └────────────────────────────────────┘  │
                  └─────────────────────────────────────────┘
                            
                  ⚠️  NO EXTERNAL NETWORK CALLS
                  ⚠️  NO PATIENT DATA LEAVES DEVICE
                  ⚠️  NO API KEYS REQUIRED
```

### Request Flow — Live Encounter

```
1. Doctor taps "Start Recording"
   → Browser MediaRecorder API begins capturing audio
   → Audio chunked every 5 seconds
   
2. Each chunk sent to local Whisper
   → POST http://localhost:11434/api/transcribe
   → { audio: base64, language: "en" }
   → Response: { text: "Patient presents with..." }
   → Appended to live transcript in UI
   
3. Doctor taps "Stop Recording"
   → Full transcript assembled
   → POST http://localhost:11434/api/generate
   → { model: "llama3.1:8b", prompt: SOAP_PROMPT + transcript }
   → Streamed response parsed into SOAP fields
   
4. Draft note rendered in NoteEditor
   → Doctor reviews, edits, signs
   → Saved to localStorage as JSON encounter record
```

### LLM Stub Architecture (CTO Integration Points)

The MVP ships with **stub functions** that return mock responses. The CTO replaces each stub with real API calls:

```typescript
// src/lib/local-llm/transcribe.ts
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // TODO (CTO): Replace with real Whisper call
  // POST http://localhost:11434/api/transcribe
  // Return: transcript string
  return MOCK_TRANSCRIPT; // Mock during development
}

// src/lib/local-llm/generate-note.ts
export async function generateSOAPNote(transcript: string, template: NoteTemplate): Promise<SOAPNote> {
  // TODO (CTO): Replace with real Ollama call
  // POST http://localhost:11434/api/generate
  // Body: { model: settings.llmModel, prompt: buildPrompt(transcript, template) }
  // Return: parsed SOAPNote object
  return MOCK_SOAP_NOTE; // Mock during development
}
```

---

## Data Models

### Encounter

```typescript
interface Encounter {
  id: string;                      // UUID
  patientId: string | null;        // Optional link to patient record
  patientName: string;             // Quick entry (no full patient record required)
  date: string;                    // ISO date
  startTime: string;               // ISO datetime
  endTime: string | null;          // Null while recording
  durationSeconds: number | null;
  
  // Recording
  audioBlob?: Blob;                // Temporary — not persisted
  transcript: string;              // Full transcript text
  
  // Note
  template: NoteTemplateId;        // "soap" | "referral" | "med-cert" | custom ID
  note: SOAPNote | ReferralNote | MedCertNote;
  noteStatus: "draft" | "signed";
  signedAt: string | null;
  signedBy: string;                // Doctor name from settings
  
  // Generation Metadata
  generationTimeMs: number | null;
  llmModel: string | null;         // e.g., "llama3.1:8b"
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### SOAP Note

```typescript
interface SOAPNote {
  subjective: string;   // Chief complaint, HPC, history
  objective: string;    // Vitals, examination findings
  assessment: string;   // Diagnosis / differential
  plan: string;         // Management plan
  additionalNotes: string;
}
```

### Patient

```typescript
interface Patient {
  id: string;
  name: string;
  dateOfBirth: string | null;
  mrn: string | null;          // Medical Record Number (clinic's own)
  phone: string | null;
  gender: "male" | "female" | "other" | null;
  encounterIds: string[];       // Linked encounters
  createdAt: string;
  updatedAt: string;
}
```

### Note Template

```typescript
interface NoteTemplate {
  id: string;
  name: string;                 // e.g., "GP SOAP Note"
  type: "soap" | "referral" | "med-cert" | "custom";
  isDefault: boolean;
  fields: TemplateField[];
  systemPrompt: string;         // Instruction to LLM for this template
  createdAt: string;
  isBuiltIn: boolean;           // Built-in templates cannot be deleted
}

interface TemplateField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  multiline: boolean;
}
```

### Doctor Settings

```typescript
interface DoctorSettings {
  doctorName: string;           // Used in note header
  clinicName: string;
  defaultTemplate: NoteTemplateId;
  
  // LLM Config
  whisperEndpoint: string;      // default: "http://localhost:11434/api/transcribe"
  llmEndpoint: string;          // default: "http://localhost:11434/api/generate"
  llmModel: string;             // default: "llama3.1:8b"
  transcriptionLanguage: "en" | "ms";
  
  // Audio
  audioInputDeviceId: string | null;
}
```

---

## Local LLM Integration Strategy

### Recommended Local Stack (for CTO)

#### Option A — Ollama (Recommended)

```bash
# 1. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Pull models
ollama pull llama3.1:8b          # Note generation (8B — fast on M2/M3 Mac)
ollama pull llama3.2:3b          # Faster, smaller, for lower-spec hardware

# 3. Whisper via Ollama (when available) or use whisper.cpp directly
# OR use: https://github.com/ggerganov/whisper.cpp with HTTP server mode
#   ./server --model models/ggml-base.bin --port 8080

# 4. Start Ollama server (runs automatically on install)
ollama serve   # Listens on http://localhost:11434
```

#### Whisper.cpp HTTP Server (Transcription)

```bash
# Clone and build whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp && make

# Download model
bash models/download-ggml-model.sh base.en

# Start HTTP server
./build/bin/server --model models/ggml-base.en.bin --port 8080 --host 127.0.0.1

# Endpoint: POST http://localhost:8080/inference
# Body: multipart/form-data with audio file
```

#### LLM Note Generation Prompt (SOAP)

```
SYSTEM:
You are a clinical documentation assistant. Extract information from the following doctor-patient consultation transcript and generate a structured SOAP note.

Rules:
- Use only information explicitly present in the transcript
- Mark any inferred or ambiguous information with [UNCLEAR - verify]
- Use standard medical terminology
- Be concise but clinically complete
- Format exactly as specified below

OUTPUT FORMAT:
SUBJECTIVE:
[Chief complaint and history from patient's perspective]

OBJECTIVE:
[Examination findings and vitals mentioned by the doctor]

ASSESSMENT:
[Diagnosis or differential diagnoses]

PLAN:
[Treatment plan, medications, investigations, referrals, follow-up]

TRANSCRIPT:
{transcript}
```

### Hardware Requirements for CTO

| Hardware | Recommended Model | Performance |
|----------|-----------------|-------------|
| MacBook Pro M2/M3 (16GB+) | `llama3.1:8b` | ~20 tokens/sec → note in ~15s |
| MacBook Pro M1 (8GB) | `llama3.2:3b` | ~15 tokens/sec → note in ~20s |
| Windows PC (RTX 3060+) | `llama3.1:8b` | ~25 tokens/sec → note in ~12s |
| Windows PC (CPU only) | `llama3.2:3b` | ~3 tokens/sec → note in ~60s |

---

## Next.js Application Structure

### Recommended File Structure

```
humance-dashboard/  (renamed: andalus-health-scribe)
├── src/
│   ├── app/
│   │   ├── (auth)/                     # Removed in MVP (no login required)
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Keep existing sidebar/topbar layout
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Today's encounters + KPIs
│   │   │   ├── encounter/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Live recording + transcript + note editor
│   │   │   ├── encounters/
│   │   │   │   └── page.tsx            # Encounter history (all time)
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx            # Patient list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Patient detail + encounter history
│   │   │   ├── templates/
│   │   │   │   └── page.tsx            # Note template manager
│   │   │   └── settings/
│   │   │       └── page.tsx            # Doctor settings + LLM config
│   │   ├── api/
│   │   │   └── encounters/             # Local API routes (no DB needed for MVP)
│   │   │       └── route.ts
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                         # Keep ALL shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx             # Update nav links for new pages
│   │   │   └── topbar.tsx              # Keep design, remove Supabase realtime
│   │   ├── encounter/
│   │   │   ├── RecordingControls.tsx   # Start/Stop/Pause recording UI
│   │   │   ├── EncounterTranscript.tsx # Live transcript display
│   │   │   ├── NoteEditor.tsx          # SOAP note structured editor
│   │   │   ├── GeneratingIndicator.tsx # "AI is writing your note..." animation
│   │   │   └── SignOffBar.tsx          # Sign + save + copy actions
│   │   ├── dashboard/
│   │   │   ├── EncounterKPIs.tsx       # Today's stats cards
│   │   │   └── EncounterList.tsx       # Today's encounter table
│   │   └── patients/
│   │       └── PatientCard.tsx
│   │
│   ├── lib/
│   │   ├── local-llm/
│   │   │   ├── transcribe.ts           # Whisper stub → real call (CTO)
│   │   │   ├── generate-note.ts        # LLM SOAP generation stub → real (CTO)
│   │   │   └── prompts.ts              # Template-based prompt builder
│   │   ├── storage/
│   │   │   ├── encounters.ts           # localStorage CRUD for encounters
│   │   │   ├── patients.ts             # localStorage CRUD for patients
│   │   │   └── settings.ts             # localStorage CRUD for settings
│   │   └── mock-data/
│   │       ├── encounters.ts           # Sample encounters for demo
│   │       ├── patients.ts             # Sample patients
│   │       └── transcripts.ts          # Sample transcripts for testing
│   │
│   ├── hooks/
│   │   ├── useRecording.ts             # MediaRecorder hook
│   │   ├── useTranscription.ts         # Whisper streaming hook
│   │   └── useNoteGeneration.ts        # LLM generation + streaming hook
│   │
│   ├── types/
│   │   ├── encounter.ts
│   │   ├── patient.ts
│   │   └── template.ts
│   │
│   └── middleware.ts                   # Simplified: no auth, just route protection
│
├── .env.local                          # Only USE_MOCK_DATA=true required
├── .env.example                        # Committed to git for CTO
├── README.md                           # CTO onboarding guide
└── package.json
```

### Sidebar Navigation (Updated)

```
Andalus Health Scribe
├── Dashboard              /dashboard         (Today's encounters)
├── New Encounter          /encounter/new     (Start recording)
├── Encounters             /encounters        (History)
├── Patients               /patients          (Patient list)
├── Templates              /templates         (Note templates)
└── Settings               /settings          (Doctor profile + LLM config)
```

---

## Mock Data Strategy (Offline-First)

### Philosophy

The entire UI runs off mock data when `USE_MOCK_DATA=true`. The mock data is realistic, clinically plausible, and comprehensive enough for the CTO to demo the product to any stakeholder without needing a running LLM.

### Mock Data Included

**`src/lib/mock-data/encounters.ts`** — 8 sample encounters:
- Mix of statuses: 3 signed, 2 draft pending review, 1 currently recording (simulated), 2 from past week
- Mix of encounter types: GP consult, follow-up, specialist referral
- Realistic Malaysian patient names, chief complaints, and SOAP notes

**`src/lib/mock-data/patients.ts`** — 12 sample patients with linked encounter IDs

**`src/lib/mock-data/transcripts.ts`** — 3 complete sample transcripts (realistic doctor-patient dialogue) used to show what a raw transcript looks like before note generation

**`src/lib/mock-data/templates.ts`** — Built-in templates: SOAP, Referral Letter, Medical Certificate

### Mock LLM Responses

When `USE_MOCK_DATA=true`, the transcribe and generate-note functions return:
- **Transcription:** A realistic mock transcript (2–3 minute consultation)
- **Note Generation:** A pre-written SOAP note that matches the mock transcript, with a 2-second artificial delay to simulate LLM response time

This allows the CTO to demo the full UI flow (record → transcript → loading state → note appears) without a running LLM.

---

## User Stories (Prioritized)

### P0 — MVP (Must-Have for CTO Handoff)

1. **As a doctor, I can start and stop recording an encounter with one tap**
   - Acceptance: Visual recording indicator, timer, microphone permission prompt

2. **As a doctor, I can see the live transcript as I speak**
   - Acceptance: Text appears in real-time, auto-scrolls, legible during consultation

3. **As a doctor, I receive a draft SOAP note within 30 seconds of stopping recording**
   - Acceptance: All 4 SOAP sections populated from transcript; uncertain sections marked `[UNCLEAR]`

4. **As a doctor, I can edit any section of the draft note before signing**
   - Acceptance: Each SOAP field is independently editable, changes persist

5. **As a doctor, I can sign off and save the note with one action**
   - Acceptance: Note status changes to "Signed", timestamp recorded, saved to local storage

6. **As a doctor, I can see today's encounters on the dashboard**
   - Acceptance: List shows patient name, time, status; KPIs show counts

7. **As a doctor, I can copy the completed note to paste into my EMR**
   - Acceptance: One-click copy formats note as clean plain text

8. **As a CTO, I can run the app locally with zero external dependencies**
   - Acceptance: `cp .env.example .env.local && npm install && npm run dev` → app loads with mock data

9. **As a CTO, I can find all LLM integration points as clearly marked stubs**
   - Acceptance: Each stub has a `// TODO (CTO):` comment with exact API spec

### P1 — Shortly After MVP

10. **As a doctor, I can search my past encounters by patient name or keyword**

11. **As a doctor, I can select a different note template (Referral Letter, Med Cert)**

12. **As a doctor, I can configure the LLM model and endpoint in settings**

13. **As a doctor, I can create and link a patient record to an encounter**

### P2 — v2 (Post-Pilot)

14. **As a doctor, I can replay the encounter audio while reviewing the note**

15. **As a doctor, I can see the patient's previous encounters and notes**

16. **As a clinic admin, I can see note completion rates across all doctors**

17. **As a doctor, I can export encounters as PDF or structured data (FHIR)**

---

## Success Metrics

### Pilot Phase (First 5 clinicians)

- **Documentation time per encounter:** Target <60s (vs. 5–10 min baseline)
- **Note acceptance rate:** % of AI-generated notes signed without major edits — target >70%
- **Daily active usage:** Target ≥5 encounters/day per doctor
- **Setup success rate:** % of CTOs/IT staff who complete local setup without support — target 100%
- **Offline reliability:** Zero failed encounters due to network — target 100%

### Product Quality Metrics

- **Transcription accuracy (WER):** Word Error Rate <10% in quiet environment
- **Note generation latency:** <30 seconds on recommended hardware
- **SOAP completeness:** All 4 sections populated in >90% of notes
- **False information rate:** AI fabricates details not in transcript — target 0% (enforced by prompt)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|-----------|
| **Whisper transcription inaccurate** (accents, medical terminology) | High | Medium | Fine-tune Whisper on medical vocabulary; allow doctor to manually correct transcript before note generation |
| **LLM hallucinates clinical details** | High | Medium | Low temperature (0.1), explicit "do not fabricate" prompt, `[UNCLEAR]` markers, mandatory doctor review before sign-off |
| **Hardware too slow for real-time** (older clinic PCs) | Medium | Medium | Offer quantized 3B model option; process in batches not real-time for slower hardware |
| **Doctor loses unsaved note** (browser crash) | High | Low | Auto-save to localStorage every 10 seconds during editing |
| **Medical record privacy concerns** (audio captured on device) | High | Low | Audio blob deleted from memory after transcription; transcript stored encrypted in localStorage; clear data policy documented |
| **Clinicians don't trust AI notes** | High | Medium | UI enforces mandatory review before sign-off; AI output is clearly a "draft"; undo / regenerate available |
| **PDPA compliance questions from hospitals** | Medium | Medium | All data stays on-device; no external connections; PDPA compliance is trivially satisfied by architecture |

---

## Go-to-Market Strategy

### GTM Philosophy: Enterprise-First

Andalus Health targets **Malaysian hospitals and large medical centres first** — not solo GPs. This is a deliberate strategic choice driven by the competitive reality:

- aiMai already owns the "underserved/government" segment; hospital clinical departments are under-served by their enterprise hardware approach
- Hospital IT infrastructure (GPU servers, on-prem compute) is exactly what our local LLM stack needs to perform well
- One hospital contract = 20–200 doctors → faster adoption curve than individual doctor sales
- Hospital deals create the clinical validation and case studies needed to expand later
- Hospital credibility is the prerequisite for any MOH or government engagement

### Phase 1: Anchor Hospital Pilot (Month 1–3)

- **Target:** 1 private hospital in Klang Valley — KPJ, Pantai, Sunway Medical, or Columbia Asia
- **Entry point:** Medical Director, Head of Department (Internal Medicine, O&G, or GP cluster — high documentation volume), CMO
- **Goal:** Deploy on 5–10 doctors' workstations within one department
- **Setup:** Hospital IT team deploys Ollama on a hospital GPU server; doctors access Andalus Health Scribe via browser on existing workstations; zero hardware purchase required
- **Pricing:** Free 3-month pilot in exchange for:
  - Anonymised usage metrics for clinical evidence
  - Co-authored case study
  - Medical advisor status for at least one HOD
- **Success Criteria:**
  - 80% of participating doctors use the scribe for >50% of consultations
  - Documentation time reduced >60% vs. baseline (measured)
  - Zero data breach or privacy incidents
  - HOD willing to be named reference customer

### Phase 2: Hospital Expansion + MDA Application (Month 4–8)

- **Expand** pilot department to 2 additional departments in the same hospital
- **Start MDA clearance application** — use pilot data as clinical evidence (aiMai has done this; their clearance sets the regulatory precedent)
- **Second hospital** — use anchor hospital HOD as reference; target a different state (Penang or Johor)
- **First paying contract**

| Plan | Price | Scope |
|------|-------|-------|
| **Department** | RM 3,000/month | Up to 20 doctors, 1 department |
| **Hospital** | RM 8,000/month | Unlimited doctors, full IT support, FHIR export |
| **Hospital Group** | Custom (RM 15k–30k/month) | Multi-site, white-label option, SLA guarantee |

### Phase 3: Hospital Chains + Ministry of Health Engagement (Month 9–18)

- **Target KPJ Healthcare** (40+ hospitals in Malaysia) or **IHH Healthcare Malaysia** for group deal
- **Engage Ministry of Health** — government hospital pilot positions Andalus Health as national health digitisation infrastructure (competing directly with aiMai's government strategy, but with software-only flexibility advantage)
- **MDA clearance obtained** by this phase — unlocks Ministry of Health and public hospital procurement
- **Annual enterprise licensing** with multi-year contracts

---

## Future Enhancements

### Year 1

1. **FHIR Export** — Export signed notes as HL7 FHIR `DocumentReference` for direct EMR integration (compatible with ClinicMaster, OpenMRS)
2. **Malay Language Support** — Fine-tune Whisper on BM clinical audio; bilingual SOAP notes
3. **Voice Commands** — Doctor can say "mark as urgent" or "add to plan" without stopping recording
4. **Multiple Doctors per Clinic** — Simple login system; each doctor sees only their encounters
5. **Electron Desktop App** — Packaged as `.dmg` / `.exe` for easy clinic deployment without Node.js

### Year 2

6. **Real-Time Clinical Decision Support** — As LLM reads transcript, surface relevant drug interaction alerts or clinical guidelines (local inference only)
7. **Specialty-Specific Models** — Fine-tuned models for specific specialties (cardiology, psychiatry, paediatrics) with domain vocabulary
8. **Referral Letter Auto-Send** — Generate referral letter and attach to outgoing email/fax directly from Andalus Health Scribe
9. **VitalSync Integration** — Bridge to Andalus Health's AI ICU monitoring product; encounter notes from ICU rounds auto-populated into VitalSync patient record

---

## Appendix A: CTO Setup Guide

### Prerequisites

```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# (Optional — for real LLM) Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.1:8b

# (Optional — for real transcription) whisper.cpp
# See: https://github.com/ggerganov/whisper.cpp
```

### Quick Start (Mock Mode)

```bash
git clone https://github.com/zannaeim/airep.git
cd airep  # repo name
cp .env.example .env.local
npm install
npm run dev
# Open http://localhost:3000
```

### Wire in Real LLM (When Ready)

1. Start Ollama: `ollama serve`
2. Edit `.env.local`:
   ```
   USE_MOCK_DATA=false
   NEXT_PUBLIC_LLM_ENDPOINT=http://localhost:11434/api/generate
   NEXT_PUBLIC_WHISPER_ENDPOINT=http://localhost:8080/inference
   NEXT_PUBLIC_LLM_MODEL=llama3.1:8b
   ```
3. Implement stubs in `src/lib/local-llm/transcribe.ts` and `src/lib/local-llm/generate-note.ts`

### Key Integration Files for CTO

| File | What to implement |
|------|------------------|
| `src/lib/local-llm/transcribe.ts` | Replace mock with Whisper HTTP call |
| `src/lib/local-llm/generate-note.ts` | Replace mock with Ollama HTTP call |
| `src/lib/local-llm/prompts.ts` | Refine SOAP prompt per template |
| `src/lib/storage/encounters.ts` | Replace localStorage with SQLite when ready |

---

## Appendix B: .env.example

```bash
# Mock mode — set to "true" to run with sample data (no LLM required)
USE_MOCK_DATA=true
NEXT_PUBLIC_USE_MOCK_DATA=true

# Local LLM config (only needed when USE_MOCK_DATA=false)
NEXT_PUBLIC_LLM_ENDPOINT=http://localhost:11434/api/generate
NEXT_PUBLIC_WHISPER_ENDPOINT=http://localhost:8080/inference
NEXT_PUBLIC_LLM_MODEL=llama3.1:8b
```

---

*This PRD defines the complete scope for Andalus Health Ambient Scribe v1.0 — the Andalus Health ambient scribe foundation. The UI/UX inherits from the Humance Dashboard design system. All pages, components, and data flows described here are the target state after the codebase reshape.*

**Built by Andalus Health. For clinicians who want to document less and heal more.**
