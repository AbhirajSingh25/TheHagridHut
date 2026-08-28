import {
  motion,
} from "framer-motion";

import {
  Calendar,
  Clock3,
  TrendingUp,
  Brain,
} from "lucide-react";

import MainLayout from "../components/MainLayout";

import AnimatedPage from "../components/AnimatedPage";

import PageLayout from "../components/PageLayout";

import PremiumCard from "../components/PremiumCard";

import EmptyState from "../components/ui/EmptyState";

function History() {

  const history =
    JSON.parse(
      localStorage.getItem(
        "hiresense-history"
      ) || "[]"
    );

  const avgConfidence =
    history.length > 0
      ? Math.round(
          history.reduce(
            (
              acc: number,
              item: any
            ) =>
              acc +
              item.confidence,
            0
          ) / history.length
        )
      : 0;

  return (
    <MainLayout>

      <AnimatedPage>

        <PageLayout
          title="Interview History"
          subtitle="Track AI interview progression and recruiter readiness over time"
        >

          {history.length === 0 ? (

            <EmptyState
              title="No interview history found"
              description="Complete interview sessions to build AI performance tracking and recruiter analytics history."
              buttonText="Start Interview"
            />

          ) : (

            <div className="space-y-8">

              <div className="grid lg:grid-cols-3 gap-5">

                <PremiumCard className="p-6">

                  <p className="text-gray-400">

                    Total Interviews

                  </p>

                  <h2 className="text-4xl font-bold text-white mt-4">

                    {history.length}

                  </h2>

                </PremiumCard>

                <PremiumCard className="p-6">

                  <p className="text-gray-400">

                    Average Confidence

                  </p>

                  <h2 className="text-4xl font-bold text-cyan-300 mt-4">

                    {avgConfidence}%

                  </h2>

                </PremiumCard>

                <PremiumCard className="p-6">

                  <p className="text-gray-400">

                    AI Progression

                  </p>

                  <h2 className="text-4xl font-bold text-green-300 mt-4">

                    Improving

                  </h2>

                </PremiumCard>

              </div>

              <div className="space-y-6">

                {history.map(
                  (
                    item: any,
                    index: number
                  ) => (

                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        y: 16,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >

                      <PremiumCard className="p-8 overflow-hidden">

                        <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl" />

                        <div className="relative z-10">

                          <div className="flex flex-wrap items-start justify-between gap-5">

                            <div>

                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-semibold">

                                <Brain size={16} />

                                AI Interview Session

                              </div>

                              <h2 className="text-3xl font-bold text-white mt-6">

                                {item.role}

                              </h2>

                            </div>

                            <div className="px-5 py-3 rounded-2xl bg-green-500/10 border border-green-500/20">

                              <span className="text-green-300 font-semibold">

                                Completed

                              </span>

                            </div>

                          </div>

                          <div className="grid md:grid-cols-4 gap-5 mt-10">

                            <div className="rounded-3xl bg-white/5 border border-white/5 p-5">

                              <p className="text-gray-400 text-sm">

                                Confidence

                              </p>

                              <h3 className="text-cyan-300 text-3xl font-bold mt-4">

                                {item.confidence}%

                              </h3>

                            </div>

                            <div className="rounded-3xl bg-white/5 border border-white/5 p-5">

                              <p className="text-gray-400 text-sm">

                                Communication

                              </p>

                              <h3 className="text-purple-300 text-3xl font-bold mt-4">

                                {item.communication}%

                              </h3>

                            </div>

                            <div className="rounded-3xl bg-white/5 border border-white/5 p-5">

                              <p className="text-gray-400 text-sm">

                                Duration

                              </p>

                              <h3 className="text-green-300 text-2xl font-bold mt-4">

                                {item.duration}

                              </h3>

                            </div>

                            <div className="rounded-3xl bg-white/5 border border-white/5 p-5">

                              <p className="text-gray-400 text-sm">

                                Recruiter Signal

                              </p>

                              <h3 className="text-cyan-300 text-2xl font-bold mt-4">

                                Strong

                              </h3>

                            </div>

                          </div>

                          <div className="flex flex-wrap gap-6 mt-10 text-gray-400 text-sm">

                            <div className="flex items-center gap-2">

                              <Calendar size={16} />

                              {item.createdAt}

                            </div>

                            <div className="flex items-center gap-2">

                              <Clock3 size={16} />

                              Session stored successfully

                            </div>

                            <div className="flex items-center gap-2">

                              <TrendingUp size={16} />

                              AI progression tracked

                            </div>

                          </div>

                        </div>

                      </PremiumCard>

                    </motion.div>

                  )
                )}

              </div>

            </div>

          )}

        </PageLayout>

      </AnimatedPage>

    </MainLayout>
  );
}

export default History;