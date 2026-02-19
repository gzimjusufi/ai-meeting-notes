# AI Meeting Notes

A full-stack AI app that transcribes audio files and generates summaries with action items.

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** FastAPI, Python
- **Transcription:** OpenAI Whisper (runs locally)
- **AI Summary:** Groq API (Llama 3)

## Features

- Upload any audio file (MP3, WAV, etc.)
- Instant transcription using Whisper
- AI-generated meeting summary
- Automatic action item extraction

## How to Run Locally

### Backend
```bash
cd ai-meeting-notes
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000