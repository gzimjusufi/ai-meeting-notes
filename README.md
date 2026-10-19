# AI Meeting Notes

A full-stack AI app that turns meeting recordings into transcripts, concise summaries, and action items. Upload an audio file and get structured notes in seconds.

**Live demo:** https://frontend-five-nu-45.vercel.app/

![Demo](screenshots/demo.gif)

## Why I Built This

Meetings produce a lot of talk and very little written follow-up. This app automates the boring part: transcribing the recording, summarizing the key points, and pulling out who needs to do what.

## How It Works

1. You upload an audio file (MP3, WAV, etc.) in the web UI.
2. The FastAPI backend transcribes it locally with **OpenAI Whisper** (no audio leaves your machine).
3. The transcript is sent to **Llama 3 via the Groq API**, which generates a summary and extracts action items.
4. The frontend displays the transcript, summary, and action items.

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** FastAPI, Python
- **Transcription:** OpenAI Whisper (runs locally, model: [tiny / base / small, whichever you use])
- **AI Summary:** Groq API (Llama 3)

## Features

- Upload any common audio format (MP3, WAV, etc.)
- Local transcription with Whisper
- AI-generated meeting summary
- Automatic action item extraction
- Clean, responsive UI

## Screenshots

| Upload | Results |
|---|---|
| ![Demo Video](videos/demo.mp4)|

## How to Run Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- ffmpeg (required by Whisper)
- A free Groq API key: https://console.groq.com

### Backend

```
cd ai-meeting-notes
pip install -r requirements.txt
export GROQ_API_KEY=your_api_key_here      # Windows PowerShell: $env:GROQ_API_KEY="your_api_key_here"
uvicorn main:app --reload
```

### Frontend

```
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000

## Notes

- Transcription speed depends on your hardware and the Whisper model size. Larger models are more accurate but slower. [Add a rough example, e.g. "a 5-minute file takes about X seconds on my laptop".]
- Audio is processed locally; only the text transcript is sent to Groq for summarization.

License: MIT
