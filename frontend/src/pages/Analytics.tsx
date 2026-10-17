import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Activity,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock3,
  Flame,
  Gauge,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Mic,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import {
  getAnalytics,
} from "../services/api";


type Session = {
  id: string | number;
  role: string;
  level: string;
  score: number;
  confidence: number;
  communication: number;
  technical: number;
  createdAt?: string;
};


type AnalyticsState = {
  totalInterviews: number;
  averageScore: number;
  confidence: number;
  communication: number;
  technical: number;
  improvement: number;
  sessions: Session[];
};


const DEFAULT_ANALYTICS: AnalyticsState = {
  totalInterviews: 0,
  averageScore: 0,
  confidence: 0,
  communication: 0,
  technical: 0,
  improvement: 0,
  sessions: [],
};


function getNumber(
  ...values: unknown[]
) {

  for (
    const value of values
  ) {

    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed) &&
      parsed >= 0
    ) {

      return Math.round(parsed);

    }

  }

  return 0;

}


function normalizeSession(
  session: any,
  index: number
): Session {

  return {
    id:
      session?.id ??
      session?.session_id ??
      index + 1,

    role:
      session?.role ??
      session?.target_role ??
      "Mock Interview",

    level:
      session?.level ??
      session?.experience_level ??
      "General",

    score:
      getNumber(
        session?.score,
        session?.overall_score,
        session?.overall,
        session?.final_score
      ),

    confidence:
      getNumber(
        session?.confidence,
        session?.confidence_score,
        session?.metrics?.confidence
      ),

    communication:
      getNumber(
        session?.communication,
        session?.communication_score,
        session?.metrics?.communication
      ),

    technical:
      getNumber(
        session?.technical,
        session?.technical_score,
        session?.metrics?.technical
      ),

    createdAt:
      session?.created_at ??
      session?.date ??
      session?.createdAt,

  };

}


function normalizeAnalytics(
  data: any
): AnalyticsState {

  const sessionsSource =
    data?.sessions ??
    data?.interviews ??
    data?.history ??
    data?.recent_sessions ??
    [];

  const sessions =
    Array.isArray(
      sessionsSource
    )
      ? sessionsSource.map(
          normalizeSession
        )
      : [];


  const calculatedAverage =
    sessions.length > 0
      ? Math.round(
          sessions.reduce(
            (
              total,
              session
            ) =>
              total +
              session.score,
            0
          ) /
            sessions.length
        )
      : 0;


  return {

    totalInterviews:
      getNumber(
        data?.total_interviews,
        data?.totalInterviews,
        data?.interviews_completed,
        data?.summary?.total_interviews,
        sessions.length
      ),

    averageScore:
      getNumber(
        data?.average_score,
        data?.averageScore,
        data?.overall_score,
        data?.summary?.average_score,
        calculatedAverage
      ),

    confidence:
      getNumber(
        data?.confidence,
        data?.average_confidence,
        data?.confidence_score,
        data?.metrics?.confidence,
        data?.summary?.confidence
      ),

    communication:
      getNumber(
        data?.communication,
        data?.average_communication,
        data?.communication_score,
        data?.metrics?.communication,
        data?.summary?.communication
      ),

    technical:
      getNumber(
        data?.technical,
        data?.average_technical,
        data?.technical_score,
        data?.metrics?.technical,
        data?.summary?.technical
      ),

    improvement:
      getNumber(
        data?.improvement,
        data?.growth,
        data?.improvement_percentage,
        data?.summary?.improvement
      ),

    sessions,

  };

}


function Analytics() {

  const [
    analytics,
    setAnalytics,
  ] =
    useState<AnalyticsState>(
      DEFAULT_ANALYTICS
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  async function loadAnalytics() {

    try {

      setLoading(true);
      setError("");

      const data =
        await getAnalytics();

      const normalized =
        normalizeAnalytics(
          data
        );

      setAnalytics(
        normalized
      );

    } catch (err) {

      console.error(
        "Analytics loading failed:",
        err
      );

      setError(
        "Analytics data could not be loaded. Your frontend is ready, but the analytics backend is not returning usable data yet."
      );

      setAnalytics(
        DEFAULT_ANALYTICS
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadAnalytics();

  }, []);


  const strongestArea =
    useMemo(() => {

      const areas = [

        {
          name:
            "Technical",
          value:
            analytics.technical,
        },

        {
          name:
            "Communication",
          value:
            analytics.communication,
        },

        {
          name:
            "Confidence",
          value:
            analytics.confidence,
        },

      ];

      return areas.reduce(
        (
          strongest,
          current
        ) =>
          current.value >
          strongest.value
            ? current
            : strongest
      );

    }, [
      analytics,
    ]);


  const weakestArea =
    useMemo(() => {

      const areas = [

        {
          name:
            "Technical",
          value:
            analytics.technical,
        },

        {
          name:
            "Communication",
          value:
            analytics.communication,
        },

        {
          name:
            "Confidence",
          value:
            analytics.confidence,
        },

      ];

      return areas.reduce(
        (
          weakest,
          current
        ) =>
          current.value <
          weakest.value
            ? current
            : weakest
      );

    }, [
      analytics,
    ]);


  const trendData =
    useMemo(() => {

      if (
        analytics.sessions.length
      ) {

        return analytics.sessions
          .slice(-7)
          .map(
            (
              session,
              index
            ) => ({
              label:
                `S${index + 1}`,
              value:
                session.score,
            })
          );

      }

      return Array.from(
        {
          length: 7,
        },
        (
          _,
          index
        ) => ({
          label:
            `S${index + 1}`,
          value: 0,
        })
      );

    }, [
      analytics.sessions,
    ]);


  const scoreStatus =
    analytics.averageScore >= 80
      ? "Excellent"
      : analytics.averageScore >= 60
      ? "Strong"
      : analytics.averageScore >= 40
      ? "Developing"
      : "Starting";


  return (

    <div
      className="
        relative
        min-h-full
        overflow-hidden
        px-5
        pb-10
        pt-5
        lg:px-7
      "
    >

      {/* ========================================
          BACKGROUND
      ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            left-[8%]
            top-[5%]
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-500/[0.045]
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            right-[4%]
            top-[35%]
            h-[480px]
            w-[480px]
            rounded-full
            bg-cyan-500/[0.04]
            blur-[160px]
          "
        />

      </div>


      <div
        className="
          relative
          z-10
        "
      >


        {/* ======================================
            HERO
        ====================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.08]
            bg-[#0a0d16]/85
            p-6
            backdrop-blur-xl
            lg:p-8
          "
        >

          <div
            className="
              absolute
              right-[-80px]
              top-[-100px]
              h-[360px]
              w-[360px]
              rounded-full
              bg-gradient-to-br
              from-violet-500/[0.16]
              via-cyan-500/[0.04]
              to-transparent
              blur-[90px]
            "
          />


          <div
            className="
              relative
              flex
              flex-col
              justify-between
              gap-6
              xl:flex-row
              xl:items-end
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.32em]
                  text-violet-300
                "
              >

                <Activity
                  size={13}
                />

                Performance Intelligence

              </div>


              <h1
                className="
                  mt-4
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-white
                  lg:text-4xl
                "
              >

                Analytics

              </h1>


              <p
                className="
                  mt-3
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-400
                "
              >

                Track your interview progress,
                identify performance patterns,
                and discover exactly where your
                next improvement should happen.

              </p>

            </div>


            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  px-5
                  py-3
                "
              >

                <div
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.2em]
                    text-slate-500
                  "
                >

                  Current Level

                </div>


                <div
                  className="
                    mt-1
                    text-sm
                    font-semibold
                    text-white
                  "
                >

                  {scoreStatus}

                </div>

              </div>


              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="
                  flex
                  h-[52px]
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-white/[0.09]
                  bg-white/[0.04]
                  px-5
                  text-sm
                  font-medium
                  text-slate-200
                  transition
                  hover:bg-white/[0.08]
                  disabled:opacity-50
                "
              >

                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

          </div>

        </motion.div>


        {/* ======================================
            ERROR
        ====================================== */}

        {error && (

          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mt-5
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-500/[0.05]
              px-5
              py-4
              text-sm
              text-amber-200
            "
          >

            <CircleAlert
              size={18}
            />

            {error}

          </motion.div>

        )}


        {/* ======================================
            LOADING
        ====================================== */}

        {loading ? (

          <div
            className="
              flex
              min-h-[500px]
              flex-col
              items-center
              justify-center
            "
          >

            <div
              className="
                relative
                flex
                h-28
                w-28
                items-center
                justify-center
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  animate-spin
                  rounded-full
                  border
                  border-violet-400/10
                  border-t-violet-400
                "
              />

              <Loader2
                size={30}
                className="
                  animate-spin
                  text-cyan-300
                "
              />

            </div>


            <div
              className="
                mt-5
                text-lg
                font-semibold
                text-white
              "
            >

              Loading performance intelligence

            </div>


            <div
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >

              Synchronizing interview signals...

            </div>

          </div>

        ) : (

          <>


            {/* ==================================
                TOP METRICS
            ================================== */}

            <div
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
              "
            >

              <MetricCard
                label="Interviews"
                value={
                  analytics.totalInterviews
                }
                subtitle="Completed sessions"
                icon={
                  <Trophy
                    size={20}
                  />
                }
                accent="violet"
              />


              <MetricCard
                label="Average Score"
                value={`${analytics.averageScore}%`}
                subtitle="Overall interview score"
                icon={
                  <Gauge
                    size={20}
                  />
                }
                accent="cyan"
              />


              <MetricCard
                label="Improvement"
                value={`${analytics.improvement}%`}
                subtitle="Growth over previous performance"
                icon={
                  analytics.improvement >= 0
                    ? (
                      <TrendingUp
                        size={20}
                      />
                    )
                    : (
                      <TrendingDown
                        size={20}
                      />
                    )
                }
                accent="emerald"
              />


              <MetricCard
                label="Best Area"
                value={
                  strongestArea.value > 0
                    ? strongestArea.name
                    : "--"
                }
                subtitle={
                  strongestArea.value > 0
                    ? `${strongestArea.value}% performance`
                    : "Waiting for data"
                }
                icon={
                  <Sparkles
                    size={20}
                  />
                }
                accent="amber"
              />

            </div>


            {/* ==================================
                MAIN GRID
            ================================== */}

            <div
              className="
                mt-6
                grid
                gap-6
                xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]
              "
            >


              {/* ================================
                  PERFORMANCE TREND
              ================================ */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.08,
                }}
                className="
                  rounded-[28px]
                  border
                  border-white/[0.08]
                  bg-[#090c15]/85
                  p-6
                  backdrop-blur-xl
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    justify-between
                    gap-5
                    sm:flex-row
                    sm:items-start
                  "
                >

                  <div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.28em]
                        text-cyan-300
                      "
                    >

                      <TrendingUp
                        size={13}
                      />

                      Progress Trend

                    </div>


                    <h2
                      className="
                        mt-3
                        text-xl
                        font-semibold
                        text-white
                      "
                    >

                      Interview trajectory

                    </h2>


                    <p
                      className="
                        mt-2
                        text-sm
                        text-slate-500
                      "
                    >

                      Your overall performance across
                      recent interview sessions.

                    </p>

                  </div>


                  <div
                    className="
                      rounded-2xl
                      border
                      border-emerald-400/15
                      bg-emerald-400/[0.05]
                      px-4
                      py-3
                    "
                  >

                    <div
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.18em]
                        text-emerald-300
                      "
                    >

                      Current Score

                    </div>


                    <div
                      className="
                        mt-1
                        text-xl
                        font-semibold
                        text-white
                      "
                    >

                      {analytics.averageScore}%

                    </div>

                  </div>

                </div>


                {/* CHART */}

                <div
                  className="
                    mt-8
                    flex
                    h-[260px]
                    items-end
                    gap-3
                    rounded-[24px]
                    border
                    border-white/[0.05]
                    bg-gradient-to-b
                    from-white/[0.025]
                    to-transparent
                    px-5
                    pb-6
                    pt-8
                  "
                >

                  {trendData.map(
                    (
                      point,
                      index
                    ) => (

                      <div
                        key={
                          point.label
                        }
                        className="
                          flex
                          h-full
                          flex-1
                          flex-col
                          justify-end
                        "
                      >

                        <div
                          className="
                            mb-2
                            text-center
                            text-[10px]
                            font-medium
                            text-slate-500
                          "
                        >

                          {point.value > 0
                            ? `${point.value}%`
                            : "--"}

                        </div>


                        <motion.div
                          initial={{
                            height: 0,
                          }}
                          animate={{
                            height:
                              point.value > 0
                                ? `${Math.max(
                                    point.value,
                                    8
                                  )}%`
                                : "6%",
                          }}
                          transition={{
                            duration: 0.7,
                            delay:
                              index * 0.07,
                            ease: "easeOut",
                          }}
                          className="
                            relative
                            min-h-[8px]
                            rounded-t-xl
                            bg-gradient-to-t
                            from-violet-600
                            via-cyan-500
                            to-emerald-300
                            opacity-90
                          "
                        >

                          {point.value > 0 && (

                            <div
                              className="
                                absolute
                                inset-x-1
                                top-0
                                h-px
                                bg-white/60
                              "
                            />

                          )}

                        </motion.div>


                        <div
                          className="
                            mt-3
                            text-center
                            text-[10px]
                            uppercase
                            tracking-wider
                            text-slate-600
                          "
                        >

                          {point.label}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </motion.div>


              {/* ================================
                  AI INSIGHT
              ================================ */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: 16,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.14,
                }}
                className="
                  rounded-[28px]
                  border
                  border-white/[0.08]
                  bg-[#090c15]/85
                  p-6
                  backdrop-blur-xl
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                  "
                >

                  <div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.28em]
                        text-violet-300
                      "
                    >

                      <BrainCircuit
                        size={13}
                      />

                      AI Insight

                    </div>


                    <h2
                      className="
                        mt-3
                        text-xl
                        font-semibold
                        text-white
                      "
                    >

                      Your next move

                    </h2>

                  </div>


                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-violet-400/15
                      bg-violet-500/[0.06]
                    "
                  >

                    <Sparkles
                      size={19}
                      className="
                        text-violet-300
                      "
                    />

                  </div>

                </div>


                <div
                  className="
                    mt-7
                    space-y-4
                  "
                >

                  <InsightCard
                    icon={
                      <Trophy
                        size={17}
                      />
                    }
                    title="Strongest performance"
                    description={
                      strongestArea.value > 0
                        ? `${strongestArea.name} is currently your strongest signal at ${strongestArea.value}%.`
                        : "Complete an interview session to discover your strongest area."
                    }
                    accent="cyan"
                  />


                  <InsightCard
                    icon={
                      <Target
                        size={17}
                      />
                    }
                    title="Priority improvement"
                    description={
                      weakestArea.value > 0
                        ? `Focus on ${weakestArea.name.toLowerCase()}. This is currently the signal with the greatest room for improvement.`
                        : "Your AI improvement priorities will appear after interview analysis."
                    }
                    accent="violet"
                  />


                  <InsightCard
                    icon={
                      <Zap
                        size={17}
                      />
                    }
                    title="Recommended action"
                    description={
                      analytics.totalInterviews > 0
                        ? "Practice another focused interview and target one specific weak performance signal."
                        : "Start your first mock interview to generate personalized analytics."
                    }
                    accent="amber"
                  />

                </div>

              </motion.div>

            </div>


            {/* ==================================
                PERFORMANCE DIMENSIONS
            ================================== */}

            <div
              className="
                mt-6
                grid
                gap-6
                lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]
              "
            >


              {/* RADAR STYLE AREA */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.18,
                }}
                className="
                  rounded-[28px]
                  border
                  border-white/[0.08]
                  bg-[#090c15]/85
                  p-6
                  backdrop-blur-xl
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div>

                    <div
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.28em]
                        text-cyan-300
                      "
                    >

                      Capability Profile

                    </div>


                    <h2
                      className="
                        mt-3
                        text-xl
                        font-semibold
                        text-white
                      "
                    >

                      Performance dimensions

                    </h2>

                  </div>


                  <BarChart3
                    size={22}
                    className="
                      text-slate-500
                    "
                  />

                </div>


                <div
                  className="
                    mt-8
                    grid
                    gap-5
                    md:grid-cols-3
                  "
                >

                  <DimensionCard
                    label="Technical"
                    value={
                      analytics.technical
                    }
                    icon={
                      <BrainCircuit
                        size={21}
                      />
                    }
                    description="Problem solving and role knowledge"
                    accent="violet"
                  />


                  <DimensionCard
                    label="Communication"
                    value={
                      analytics.communication
                    }
                    icon={
                      <MessageSquareText
                        size={21}
                      />
                    }
                    description="Clarity, structure and delivery"
                    accent="cyan"
                  />


                  <DimensionCard
                    label="Confidence"
                    value={
                      analytics.confidence
                    }
                    icon={
                      <Flame
                        size={21}
                      />
                    }
                    description="Presence and answer conviction"
                    accent="emerald"
                  />

                </div>

              </motion.div>


              {/* RECENT ACTIVITY */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.24,
                }}
                className="
                  rounded-[28px]
                  border
                  border-white/[0.08]
                  bg-[#090c15]/85
                  p-6
                  backdrop-blur-xl
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.28em]
                        text-violet-300
                      "
                    >

                      <Clock3
                        size={13}
                      />

                      Recent Activity

                    </div>


                    <h2
                      className="
                        mt-3
                        text-xl
                        font-semibold
                        text-white
                      "
                    >

                      Latest sessions

                    </h2>

                  </div>


                  <CalendarDays
                    size={20}
                    className="
                      text-slate-500
                    "
                  />

                </div>


                <div
                  className="
                    mt-6
                    space-y-3
                  "
                >

                  {analytics.sessions
                    .slice(-4)
                    .reverse()
                    .map(
                      (
                        session
                      ) => (

                        <div
                          key={
                            session.id
                          }
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            rounded-2xl
                            border
                            border-white/[0.06]
                            bg-white/[0.02]
                            p-4
                            transition
                            hover:bg-white/[0.04]
                          "
                        >

                          <div
                            className="
                              min-w-0
                            "
                          >

                            <div
                              className="
                                truncate
                                text-sm
                                font-medium
                                text-white
                              "
                            >

                              {session.role}

                            </div>


                            <div
                              className="
                                mt-1
                                text-xs
                                text-slate-500
                              "
                            >

                              {session.level}

                            </div>

                          </div>


                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >

                            <div
                              className="
                                text-right
                              "
                            >

                              <div
                                className="
                                  text-sm
                                  font-semibold
                                  text-white
                                "
                              >

                                {session.score}%

                              </div>


                              <div
                                className="
                                  text-[10px]
                                  text-slate-500
                                "
                              >

                                SCORE

                              </div>

                            </div>


                            <ChevronRight
                              size={16}
                              className="
                                text-slate-600
                              "
                            />

                          </div>

                        </div>

                      )
                    )}


                  {analytics.sessions.length ===
                    0 && (

                    <div
                      className="
                        flex
                        min-h-[190px]
                        flex-col
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-dashed
                        border-white/[0.08]
                        bg-white/[0.015]
                        p-6
                        text-center
                      "
                    >

                      <Activity
                        size={25}
                        className="
                          text-slate-600
                        "
                      />


                      <div
                        className="
                          mt-4
                          text-sm
                          font-medium
                          text-slate-300
                        "
                      >

                        No sessions yet

                      </div>


                      <div
                        className="
                          mt-2
                          max-w-xs
                          text-xs
                          leading-5
                          text-slate-600
                        "
                      >

                        Complete a mock interview and
                        your performance history will
                        appear here.

                      </div>

                    </div>

                  )}

                </div>

              </motion.div>

            </div>


            {/* ==================================
                BOTTOM INSIGHT
            ================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
                delay: 0.3,
              }}
              className="
                mt-6
                flex
                flex-col
                justify-between
                gap-5
                rounded-[26px]
                border
                border-white/[0.07]
                bg-gradient-to-r
                from-violet-500/[0.07]
                via-[#0a0d16]
                to-cyan-500/[0.05]
                p-6
                lg:flex-row
                lg:items-center
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-cyan-400/15
                    bg-cyan-400/[0.06]
                  "
                >

                  <Lightbulb
                    size={21}
                    className="
                      text-cyan-300
                    "
                  />

                </div>


                <div>

                  <div
                    className="
                      text-base
                      font-semibold
                      text-white
                    "
                  >

                    Consistency creates better data

                  </div>


                  <div
                    className="
                      mt-2
                      max-w-3xl
                      text-sm
                      leading-6
                      text-slate-400
                    "
                  >

                    The more interview sessions you
                    complete, the better Hagrid's Hut
                    can identify your trends,
                    improvement areas and career
                    readiness.

                  </div>

                </div>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-emerald-300
                "
              >

                <CircleCheck
                  size={16}
                />

                Performance tracking active

              </div>

            </motion.div>

          </>

        )}

      </div>

    </div>

  );

}


/* ============================================
   METRIC CARD
============================================ */

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  accent:
    | "violet"
    | "cyan"
    | "emerald"
    | "amber";
}) {

  const accentClasses = {

    violet:
      "text-violet-300 border-violet-400/15 bg-violet-500/[0.06]",

    cyan:
      "text-cyan-300 border-cyan-400/15 bg-cyan-500/[0.06]",

    emerald:
      "text-emerald-300 border-emerald-400/15 bg-emerald-500/[0.06]",

    amber:
      "text-amber-300 border-amber-400/15 bg-amber-500/[0.06]",

  };


  return (

    <motion.div
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        rounded-[24px]
        border
        border-white/[0.08]
        bg-[#090c15]/85
        p-5
        backdrop-blur-xl
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
        "
      >

        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            ${accentClasses[accent]}
          `}
        >

          {icon}

        </div>


        <TrendingUp
          size={15}
          className="
            text-slate-600
          "
        />

      </div>


      <div
        className="
          mt-7
          text-3xl
          font-semibold
          tracking-tight
          text-white
        "
      >

        {value}

      </div>


      <div
        className="
          mt-3
          text-xs
          font-medium
          text-slate-300
        "
      >

        {label}

      </div>


      <div
        className="
          mt-1
          text-[11px]
          text-slate-600
        "
      >

        {subtitle}

      </div>

    </motion.div>

  );

}


/* ============================================
   INSIGHT CARD
============================================ */

function InsightCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent:
    | "cyan"
    | "violet"
    | "amber";
}) {

  const accentClasses = {

    cyan:
      "text-cyan-300 bg-cyan-500/[0.06] border-cyan-400/15",

    violet:
      "text-violet-300 bg-violet-500/[0.06] border-violet-400/15",

    amber:
      "text-amber-300 bg-amber-500/[0.06] border-amber-400/15",

  };


  return (

    <div
      className="
        flex
        gap-4
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.015]
        p-4
      "
    >

      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          ${accentClasses[accent]}
        `}
      >

        {icon}

      </div>


      <div>

        <div
          className="
            text-sm
            font-semibold
            text-slate-200
          "
        >

          {title}

        </div>


        <div
          className="
            mt-1.5
            text-xs
            leading-5
            text-slate-500
          "
        >

          {description}

        </div>

      </div>

    </div>

  );

}


/* ============================================
   DIMENSION CARD
============================================ */

function DimensionCard({
  label,
  value,
  icon,
  description,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  accent:
    | "violet"
    | "cyan"
    | "emerald";
}) {

  const gradientClasses = {

    violet:
      "from-violet-500 to-violet-300",

    cyan:
      "from-cyan-500 to-cyan-300",

    emerald:
      "from-emerald-500 to-emerald-300",

  };


  const iconClasses = {

    violet:
      "text-violet-300 border-violet-400/15 bg-violet-500/[0.06]",

    cyan:
      "text-cyan-300 border-cyan-400/15 bg-cyan-500/[0.06]",

    emerald:
      "text-emerald-300 border-emerald-400/15 bg-emerald-500/[0.06]",

  };


  return (

    <div
      className="
        rounded-[22px]
        border
        border-white/[0.06]
        bg-white/[0.015]
        p-5
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            ${iconClasses[accent]}
          `}
        >

          {icon}

        </div>


        <div
          className="
            text-2xl
            font-semibold
            text-white
          "
        >

          {value > 0
            ? `${value}%`
            : "--"}

        </div>

      </div>


      <div
        className="
          mt-6
          text-sm
          font-semibold
          text-white
        "
      >

        {label}

      </div>


      <div
        className="
          mt-1
          min-h-[32px]
          text-[11px]
          leading-4
          text-slate-600
        "
      >

        {description}

      </div>


      <div
        className="
          mt-5
          h-1.5
          overflow-hidden
          rounded-full
          bg-white/[0.05]
        "
      >

        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width:
              `${Math.max(
                value,
                0
              )}%`,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className={`
            h-full
            rounded-full
            bg-gradient-to-r
            ${gradientClasses[accent]}
          `}
        />

      </div>

    </div>

  );

}


export default Analytics;