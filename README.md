# PMO Risk & Capacity Dashboard

React/Vite dashboard untuk upload satu atau beberapa file Excel, membaca portfolio proyek, lalu menampilkan health, due status, schedule, open issue, workload PM, dan cost per PM.

## Local Development

```bash
npm install
npm run dev
```

## Deploy ke Vercel

Import repo ini di Vercel. Konfigurasi build sudah ada di `vercel.json`.

- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

## AI Brief dan PMO Chat Gratis dengan Gemini

Fitur AI Brief dan chatbot PMO tidak memakai OpenAI secara default. Untuk opsi gratis, buat API key dari Google AI Studio, lalu set environment variable di Vercel:

```text
GEMINI_API_KEY=your_google_ai_studio_key
```

Opsional:

```text
GEMINI_MODEL=gemini-3.5-flash
```

`OPENAI_API_KEY` masih didukung sebagai fallback, tetapi tidak wajib.

Endpoint Vercel yang dipakai:

- `/api/ai-insights`
- `/api/chatbot`
