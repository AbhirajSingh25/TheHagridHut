const interviews = [
  {
    company: "Google",
    role: "Software Engineer",
    score: "91%",
    date: "May 2026",
  },
  {
    company: "Amazon",
    role: "Frontend Developer",
    score: "84%",
    date: "April 2026",
  },
  {
    company: "Microsoft",
    role: "AI Engineer",
    score: "88%",
    date: "April 2026",
  },
];

function InterviewHistory() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

      <div className="flex items-center justify-between">

        <h2 className="text-2xl font-bold">
          Interview History
        </h2>

        <button className="text-cyan-400 hover:text-cyan-300 transition">
          View All
        </button>

      </div>

      <div className="mt-8 space-y-5">

        {interviews.map((item, index) => (
          <div
            key={index}
            className="
              flex items-center justify-between
              bg-white/5
              border border-white/10
              rounded-2xl
              p-5
              hover:border-cyan-400/30
              transition
            "
          >

            <div>
              <h3 className="text-xl font-semibold">
                {item.company}
              </h3>

              <p className="text-gray-400 mt-1">
                {item.role}
              </p>
            </div>

            <div className="text-right">

              <p className="text-2xl font-bold text-cyan-400">
                {item.score}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                {item.date}
              </p>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default InterviewHistory;