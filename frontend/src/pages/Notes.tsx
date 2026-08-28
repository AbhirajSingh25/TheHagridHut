import {
  useEffect,
  useState,
} from "react";

import MainLayout from "../components/MainLayout";

function Notes() {

  const [notes, setNotes] =
    useState("");

  const [savedMessage, setSavedMessage] =
    useState("");

  useEffect(() => {

    const storedNotes =
      localStorage.getItem(
        "hiresense-notes"
      );

    if (storedNotes) {

      setNotes(storedNotes);
    }

  }, []);

  const saveNotes = () => {

    localStorage.setItem(
      "hiresense-notes",
      notes
    );

    setSavedMessage(
      "Notes saved successfully."
    );

    setTimeout(() => {

      setSavedMessage("");

    }, 2000);
  };

  return (
    <MainLayout>

      <div className="min-h-screen bg-[#050816] text-white px-8 py-10">

        <h1 className="text-5xl font-bold text-cyan-400">
          Interview Notes
        </h1>

        <p className="text-gray-400 mt-3">
          Track interview learnings and improvement goals
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mt-12">

          <h2 className="text-2xl font-bold text-cyan-400">
            Personal AI Journal
          </h2>

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(
                e.target.value
              )
            }
            placeholder="Write your interview reflections, weak areas, preparation goals, AI feedback observations..."
            className="w-full h-[350px] mt-8 bg-[#0b1120] border border-white/10 rounded-2xl p-6 outline-none resize-none text-white leading-8"
          />

          <div className="flex items-center justify-between mt-8">

            <button
              onClick={saveNotes}
              className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition font-bold"
            >
              Save Notes
            </button>

            {savedMessage && (

              <p className="text-green-400 font-bold">

                {savedMessage}

              </p>

            )}

          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">

          <div className="bg-white/5 border border-cyan-500/20 rounded-3xl p-8">

            <h2 className="text-2xl font-bold text-cyan-400">
              Preparation Goals
            </h2>

            <div className="space-y-4 mt-8">

              <div className="bg-white/5 rounded-2xl p-4">
                Improve confidence
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                Practice structured answers
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                Enhance technical explanations
              </div>

            </div>

          </div>

          <div className="bg-white/5 border border-pink-500/20 rounded-3xl p-8">

            <h2 className="text-2xl font-bold text-pink-400">
              Common Weaknesses
            </h2>

            <div className="space-y-4 mt-8">

              <div className="bg-white/5 rounded-2xl p-4">
                Filler words
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                Eye contact consistency
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                Technical depth
              </div>

            </div>

          </div>

          <div className="bg-white/5 border border-green-500/20 rounded-3xl p-8">

            <h2 className="text-2xl font-bold text-green-400">
              AI Suggestions
            </h2>

            <div className="space-y-4 mt-8">

              <div className="bg-white/5 rounded-2xl p-4">
                Maintain balanced speaking pace
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                Use STAR method answers
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                Practice role-specific questions
              </div>

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default Notes;