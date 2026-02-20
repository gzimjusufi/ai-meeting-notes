"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">AI Meeting Notes</h1>
          <p className="text-gray-400">Upload an audio file and get an instant summary with action items</p>
        </div>

        {/* Upload Box */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 space-y-4">
          <label className="block text-sm text-gray-400 font-medium">Upload Audio File</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
          />
          {file && <p className="text-xs text-gray-500">Selected: {file.name}</p>}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-semibold transition-all"
          >
            {loading ? "Processing..." : "Transcribe & Summarize"}
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

            {/* Transcript */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Transcript</h2>
              <p className="text-gray-200 leading-relaxed">{result.transcript}</p>
            </div>

            {/* Summary */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Summary</h2>
              <p className="text-gray-200 leading-relaxed">{result.summary}</p>
            </div>

            {/* Action Items */}
            <div className="bg-gray-900 border border-indigo-700 rounded-2xl p-6 space-y-3">
              <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Action Items</h2>
              {result.action_items.length === 0 ? (
                <p className="text-gray-500">No action items found.</p>
              ) : (
                <ul className="space-y-2">
                  {result.action_items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                      <span className="text-gray-200">{item}</span>
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