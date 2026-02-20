from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq()

def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    response = client.audio.transcriptions.create(
        file=(filename, file_bytes),
        model="whisper-large-v3",
    )
    return response.text

def ai_summary(text: str) -> dict:
    prompt = f"""You are a meeting assistant. Given this transcript, return a JSON object with:
- "summary": a 1-2 sentence summary
- "action_items": a list of concrete action items (empty list if none)

Transcript:
{text}

Respond ONLY with valid JSON, no markdown."""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()
    return json.loads(raw)

@app.post("/transcribe-audio")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        return {"error": "Please upload an audio file"}

    audio_bytes = await file.read()

    try:
        transcript = transcribe_audio(audio_bytes, file.filename)
        summary = ai_summary(transcript)
    except Exception as e:
        return {"error": str(e)}

    return {
        "transcript": transcript,
        "summary": summary.get("summary", ""),
        "action_items": summary.get("action_items", []),
    }