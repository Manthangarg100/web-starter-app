🧠 Smart Personal Photo Organizer

Track: On-Device AI · Privacy-First · Offline
Built with: RunAnywhere Web SDK

📌 Problem

Most photo apps rely on cloud-based AI:

Personal photos are uploaded to external servers

AI decisions are black-box

Sensitive documents are at risk

Apps degrade without internet

Users lack privacy, transparency, and control.

💡 Solution

We built a Smart Personal Photo Organizer that runs entirely on-device using the RunAnywhere Web SDK.

No cloud inference

No external APIs

Works offline

Explains every AI decision

Actively protects sensitive images

AI runs where the data lives.

✨ Key Features
1️⃣ On-Device Photo Classification

Automatically classifies images into:

Document

Receipt

Screenshot

Note

Personal Photo

Uses an on-device Vision-Language Model (VLM).
Images never leave the device.

2️⃣ Explainable AI (“Why is this photo here?”)

Every classification includes a human-readable explanation.

Example:

“Classified as Document because structured text and official layout were detected.”

This makes AI transparent and trustworthy.

3️⃣ Privacy Risk Scanner

Detects sensitive images such as:

ID cards

Certificates

Official documents

Assigns a Privacy Risk Level:

Low / Medium / High

All analysis is done locally using OCR + vision.

4️⃣ Contextual (Memory-Style) Search

Search photos using natural language:

“Receipts from last month”

“Screenshots taken at night”

“Study notes”

Works offline, no tagging required.

5️⃣ Digital Memory Lock (Unique Innovation)

A password-free security mechanism for sensitive photos.

Instead of PINs or biometrics:

Uses context-based memory questions

Example:

“Was this photo related to college or work?”

“Was it taken during the day or night?”

✔ No passwords
✔ No biometrics
✔ No cloud authentication

This is human-centric, cognitive security.

6️⃣ AI Data Leak Prevention

Before opening or sharing a sensitive image, the app shows an on-device warning:

“This image contains sensitive personal information. Sharing it may cause data leakage.”

Helps prevent accidental privacy breaches.

🧠 How It Works (Technical Overview)

RunAnywhere Web SDK initializes on app startup

On-device backends:

LlamaCPP (LLM + VLM)

ONNX (OCR / STT / TTS / VAD)

Models are loaded locally and on-demand

Vision runs inside a Web Worker for performance

No network calls for inference

🤖 Models Used (On-Device)
Model	Purpose
LFM2 350M	On-device LLM (explanations, search)
LFM2-VL 450M	Vision-Language Model (classification)
Whisper Tiny	Speech-to-Text
Piper VITS	Text-to-Speech
Silero VAD	Voice Activity Detection

All models run entirely on the user’s device.

🛠️ Tech Stack

Frontend: React + Vite + TypeScript

AI Runtime: RunAnywhere Web SDK

Backends: LlamaCPP, ONNX

Deployment: Local Web App (on-device inference)
