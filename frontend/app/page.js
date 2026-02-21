"use client";
import { useState, useEffect, useRef } from "react";

function useTypingEffect(text, speed = 20) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return displayed;
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const typedTranscript = useTypingEffect(result?.transcript, 20);
  const typedSummary = useTypingEffect(result?.summary, 25);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const recordedFile = new File([blob], "recording.webm", { type: "audio/webm" });
      setFile(recordedFile);
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorder.start();
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://ai-meeting-notes-production-b917.up.railway.app/transcribe-audio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err) {
      setError("Could not connect to the server. Make sure FastAPI is running.");
    }

    setLoading(false);
  }

  function formatTime(s) {
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">AI Meeting Notes</h1>
          <p className="text-gray-400">Upload or record audio to get an instant summary with action items</p>
        </div>

        {/* Input Box */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 space-y-6">

          {/* Upload */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-400 font-medium">Upload Audio File</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-700"/>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-700"/>
          </div>

          {/* Record */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                recording
                  ? "bg-red-600 hover:bg-red-500 animate-pulse"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {recording ? (
                <span className="w-5 h-5 bg-white rounded-sm"/>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 17.93V21H9v2h6v-2h-2v-2.07A8 8 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93z"/>
                </svg>
              )}
            </button>
            {recording && (
              <span className="text-red-400 text-sm font-mono">{formatTime(recordingTime)} — click to stop</span>
            )}
            {!recording && file?.name === "recording.webm" && (
              <span className="text-green-400 text-sm">Recording ready ✓</span>
            )}
          </div>

          {/* Selected file */}
          {file && file.name !== "recording.webm" && (
            <p className="text-xs text-gray-500">Selected: {file.name}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-semibold transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing...
              </span>
            ) : "Transcribe & Summarize"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl p-6 text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Transcript</h2>
              <p className="text-gray-200 leading-relaxed">
                {typedTranscript}<span className="animate-pulse">|</span>
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Summary</h2>
              <p className="text-gray-200 leading-relaxed">
                {typedSummary}<span className="animate-pulse">|</span>
              </p>
            </div>

            <div className="bg-gray-900 border border-indigo-700 rounded-2xl p-6 space-y-3">
              <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Action Items</h2>
              {result.action_items.length === 0 ? (
                <p className="text-gray-500">No action items found.</p>
              ) : (
                <ul className="space-y-2">
                  {result.action_items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                      <span className="text-gray-200">
                        {typeof item === "string" ? item : item.text || item.description || JSON.stringify(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}