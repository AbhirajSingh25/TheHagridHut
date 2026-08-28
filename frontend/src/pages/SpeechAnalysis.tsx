import { useState } from "react";

import MainLayout from "../components/MainLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function SpeechAnalysis() {
  const [transcript, setTranscript] = useState("");

  const [result, setResult] = useState<any>(null);

  async function handleAnalyze() {
    try {
      const words = transcript.split(" ").length;

      setResult({
        confidence: "89%",
        clarity: "92%",
        filler_words: Math.max(
          0,
          Math.floor(words * 0.03)
        ),
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">

        <h1
          className="
            text-6xl
            font-black
            mb-10
          "
        >
          Speech Analysis
        </h1>

        <Card className="p-8">

          <textarea
            value={transcript}
            onChange={(e) =>
              setTranscript(e.target.value)
            }
            placeholder="Paste transcript here..."
            className="
              w-full
              h-64
              bg-black/40
              border
              border-zinc-800
              rounded-3xl
              p-6
              text-xl
              outline-none
            "
          />

          <div className="mt-6">
            <Button onClick={handleAnalyze}>
              Analyze Speech
            </Button>
          </div>

        </Card>

        {result && (
          <div className="grid grid-cols-3 gap-6 mt-10">

            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-3">
                Confidence
              </h2>

              <p className="text-5xl font-black text-red-400">
                {result.confidence}
              </p>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-3">
                Clarity
              </h2>

              <p className="text-5xl font-black text-red-400">
                {result.clarity}
              </p>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-3">
                Filler Words
              </h2>

              <p className="text-5xl font-black text-red-400">
                {result.filler_words}
              </p>
            </Card>

          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default SpeechAnalysis;