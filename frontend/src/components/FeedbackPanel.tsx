function FeedbackPanel() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

      <h2 className="text-2xl font-bold">
        AI Feedback
      </h2>

      <div className="mt-8 space-y-6">

        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5">
          <h3 className="font-bold text-cyan-400">
            Communication
          </h3>

          <p className="text-gray-300 mt-2">
            Strong speaking clarity and pacing.
          </p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
          <h3 className="font-bold text-purple-400">
            Technical Depth
          </h3>

          <p className="text-gray-300 mt-2">
            Improve system design explanation quality.
          </p>
        </div>

        <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-5">
          <h3 className="font-bold text-pink-400">
            Eye Contact
          </h3>

          <p className="text-gray-300 mt-2">
            Maintain better camera focus during responses.
          </p>
        </div>

      </div>
    </div>
  );
}

export default FeedbackPanel;