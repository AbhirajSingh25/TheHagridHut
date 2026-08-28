import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import MainLayout from "../components/MainLayout";

function Progress() {

  const history =
    JSON.parse(
      localStorage.getItem(
        "hiresense-history"
      ) || "[]"
    );

  const chartData =
    history
      .slice()
      .reverse()
      .map(
        (
          item: any,
          index: number
        ) => ({

          session:
            `#${index + 1}`,

          confidence:
            item.confidence,

          communication:
            item.communication,

          eyeContact:
            item.eyeContact,
        })
      );

  const latest =
    history[0];

  const oldest =
    history[
      history.length - 1
    ];

  const confidenceGrowth =
    latest && oldest
      ? latest.confidence -
        oldest.confidence
      : 0;

  const communicationGrowth =
    latest && oldest
      ? latest.communication -
        oldest.communication
      : 0;

  return (
    <MainLayout>

      <div className="min-h-screen bg-[#050816] text-white px-8 py-10">

        <h1 className="text-5xl font-bold text-cyan-400">
          Performance Progress
        </h1>

        <p className="text-gray-400 mt-3">
          AI-powered interview growth tracking
        </p>

        {history.length === 0 && (

          <div className="bg-white/5 rounded-3xl p-10 mt-12">

            No interview history found.

          </div>

        )}

        {history.length > 0 && (

          <>

            <div className="grid md:grid-cols-4 gap-6 mt-12">

              <div className="bg-white/5 border border-cyan-500/20 rounded-3xl p-8">

                <p className="text-gray-400">
                  Total Sessions
                </p>

                <p className="text-5xl font-bold text-cyan-400 mt-4">

                  {history.length}

                </p>

              </div>

              <div className="bg-white/5 border border-green-500/20 rounded-3xl p-8">

                <p className="text-gray-400">
                  Confidence Growth
                </p>

                <p className="text-5xl font-bold text-green-400 mt-4">

                  {confidenceGrowth > 0
                    ? "+"
                    : ""}
                  {confidenceGrowth}%

                </p>

              </div>

              <div className="bg-white/5 border border-pink-500/20 rounded-3xl p-8">

                <p className="text-gray-400">
                  Communication Growth
                </p>

                <p className="text-5xl font-bold text-pink-400 mt-4">

                  {communicationGrowth > 0
                    ? "+"
                    : ""}
                  {communicationGrowth}%

                </p>

              </div>

              <div className="bg-white/5 border border-purple-500/20 rounded-3xl p-8">

                <p className="text-gray-400">
                  Best Confidence
                </p>

                <p className="text-5xl font-bold text-purple-400 mt-4">

                  {Math.max(
                    ...history.map(
                      (item: any) =>
                        item.confidence
                    )
                  )}%

                </p>

              </div>

            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mt-12">

              <h2 className="text-3xl font-bold text-cyan-400 mb-8">
                AI Performance Trends
              </h2>

              <div className="w-full h-[450px]">

                <ResponsiveContainer>

                  <LineChart
                    data={chartData}
                  >

                    <XAxis
                      dataKey="session"
                    />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="confidence"
                    />

                    <Line
                      type="monotone"
                      dataKey="communication"
                    />

                    <Line
                      type="monotone"
                      dataKey="eyeContact"
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">

              <div className="bg-white/5 border border-green-500/20 rounded-3xl p-8">

                <h2 className="text-3xl font-bold text-green-400">
                  AI Growth Insights
                </h2>

                <div className="space-y-5 mt-8">

                  <div className="bg-white/5 rounded-2xl p-5">
                    Confidence consistency is improving steadily.
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5">
                    Communication structure has become stronger.
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5">
                    Interview delivery appears more professional.
                  </div>

                </div>

              </div>

              <div className="bg-white/5 border border-cyan-500/20 rounded-3xl p-8">

                <h2 className="text-3xl font-bold text-cyan-400">
                  AI Recommendations
                </h2>

                <div className="space-y-5 mt-8">

                  <div className="bg-white/5 rounded-2xl p-5">
                    Continue practicing technical interviews.
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5">
                    Improve concise answer delivery.
                  </div>

                  <div className="bg-white/5 rounded-2xl p-5">
                    Focus on advanced scenario-based responses.
                  </div>

                </div>

              </div>

            </div>

          </>

        )}

      </div>

    </MainLayout>
  );
}

export default Progress;