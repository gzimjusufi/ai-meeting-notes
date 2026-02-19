from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import whisper
import tempfile
import os
import json

load_dotenv()

app = FastAPI()

# Add this CORS block
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = whisper.load_model("base")
client = Groq()
def real_transcribe_audio(file_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(file_bytes)
        temp_path = tmp.name
    result = model.transcribe(temp_path)
    os.remove(temp_path)
    return result["text"]

def real_ai_summary(text: str) -> dict:
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
async def transcribe_audio(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        return {"error": "Please upload an audio file"}

    audio_bytes = await file.read()
    transcript = real_transcribe_audio(audio_bytes)

    try:
        summary = real_ai_summary(transcript)
    except Exception as e:
        summary = {"summary": "Could not generate summary.", "action_items": [], "error": str(e)}

    return {
        "transcript": transcript,
        "summary": summary.get("summary", ""),
        "action_items": summary.get("action_items", []),
    }