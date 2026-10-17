import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Trophy,
  Brain,
  Mic,
  BarChart3,
  Sparkles,
  Target,
  Flame,
  Clock,
  FileText,
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Play,
  ChevronRight,
} from "lucide-react";

import PerformanceRadar from "../components/dashboard/PerformanceRadar";
import AIInsights from "../components/dashboard/AIInsights";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";

import GlassCard from "../components/ui/GlassCard";
import AIButton from "../components/ui/AIButton";
import PageHeader from "../components/ui/PageHeader";
import MetricCard from "../components/ui/MetricCard";
import SectionTitle from "../components/ui/SectionTitle";
import { useTheme } from "../context/ThemeContext";

import {
  getDashboardStats,
} from "../services/api";


/* =========================================================
   TYPES
   ========================================================= */

interface DashboardStats {
  total_interviews: number;
  avg_confidence: number;
  communication: number;
  ai_rank: number;
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {

  const navigate = useNavigate();
  const { experience } = useTheme();

  const [
    stats,
    setStats,
  ] = useState<DashboardStats>({
    total_interviews: 0,
    avg_confidence: 0,
    communication: 0,
    ai_rank: 0,
  });


  const [
    loading,
    setLoading,
  ] = useState(true);


  /* =======================================================
     FETCH DASHBOARD DATA
     ======================================================= */

  useEffect(() => {

    async function fetchStats() {

      try {

        const data =
          await getDashboardStats();

        setStats(data);

      } catch (error) {

        console.error(
          "Failed to load dashboard stats:",
          error,
        );

      } finally {

        setLoading(false);

      }

    }

    fetchStats();

  }, []);


  /* =======================================================
     LOADING STATE
     ======================================================= */

  if (loading) {

    return (

      <div
        className="
          min-h-[calc(100vh-80px)]
          flex
          items-center
          justify-center
        "
      >

        <GlassCard
          className="
            px-10
            py-8
            text-center
          "
        >

          <div
            className="
              mx-auto
              mb-5
              h-12
              w-12
              rounded-full
              border-2
              border-purple-500/20
              border-t-purple-400
              animate-spin
            "
          />

          <p
            className="
              text-sm
              font-medium
              text-[var(--text)]
            "
          >
            Loading AI workspace
          </p>

          <p
            className="
              mt-2
              text-xs
              text-[var(--muted)]
            "
          >
            Synchronizing your performance data...
          </p>

        </GlassCard>

      </div>

    );

  }


  /* =======================================================
     PERFORMANCE DATA
     ======================================================= */

  const performance = [

    {
      title: "Communication",
      value: 88,
      color: "bg-cyan-400",
      text: "text-cyan-400",
    },

    {
      title: "Technical Depth",
      value: 93,
      color: "bg-purple-500",
      text: "text-purple-400",
    },

    {
      title: "Confidence",
      value: stats.avg_confidence,
      color: "bg-emerald-400",
      text: "text-emerald-400",
    },

    {
      title: "Problem Solving",
      value: 90,
      color: "bg-amber-400",
      text: "text-amber-400",
    },

  ];


  /* =======================================================
     QUICK ACTIONS
     ======================================================= */

  const quickActions = [

    {
      title: "AI Interview",
      description:
        "Run a realistic recruiter-style interview.",
      icon: Brain,
      path: "/live-interview",
      accent: "purple",
    },

    {
      title: "Practice Arena",
      description:
        "Improve your interview answers with AI.",
      icon: Mic,
      path: "/practice",
      accent: "cyan",
    },

    {
      title: "Resume Analyzer",
      description:
        "Analyze your resume and improve ATS compatibility.",
      icon: FileText,
      path: "/resume-analyzer",
      accent: "emerald",
    },

    {
      title: "Analytics",
      description:
        "Explore your performance and hiring intelligence.",
      icon: BarChart3,
      path: "/analytics",
      accent: "amber",
    },

  ];


  /* =======================================================
     INSIGHT CARDS
     ======================================================= */

  const insights = [

    {
      icon: Target,
      title: "Strong technical profile",
      description:
        "Your technical answers are consistently outperforming your baseline.",
      color: "text-purple-400",
      background: "bg-purple-500/10",
    },

    {
      icon: Mic,
      title: "Improve answer delivery",
      description:
        "Practice concise explanations and reduce hesitation during behavioral answers.",
      color: "text-cyan-400",
      background: "bg-cyan-500/10",
    },

    {
      icon: Flame,
      title: "Keep your streak alive",
      description:
        "Consistent practice is one of the strongest predictors of interview improvement.",
      color: "text-amber-400",
      background: "bg-amber-500/10",
    },

  ];


  return (

    <div
      className="
        w-full
        max-w-[1500px]
        mx-auto
        px-1
        pb-20
      "
    >

      {/* =================================================
          HERO
          ================================================= */}

      <div
        className="
          relative
          mb-8
          overflow-hidden
          rounded-3xl
          border
          border-[var(--border)]
          bg-[var(--overlay-soft)]
          px-7
          py-8
          md:px-10
          md:py-10
        "
      >

        {/* ambient glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-80
            w-80
            rounded-full
            bg-purple-600/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-40
            left-1/3
            h-72
            w-72
            rounded-full
            bg-cyan-500/5
            blur-3xl
          "
        />


        <div
          className="
            relative
            z-10
            flex
            flex-col
            gap-7
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          <PageHeader
            title={
              experience === "cozy"
                ? "Hagrid's Study Desk"
                : "Advanced Telemetry Dashboard"
            }
            description={
              experience === "cozy"
                ? "Welcome back to your study. Settle in, review your goals, and practise with calm, steady confidence."
                : "Real-time interview telemetry, candidate signals, and performance progression."
            }
          />


          <AIButton
            onClick={() =>
              navigate("/practice")
            }
          >

            <span
              className="
                flex
                items-center
                gap-2
              "
            >

              <Play
                size={15}
                fill="currentColor"
              />

              {experience === "cozy" ? "Enter Practice Room" : "Launch AI Interview"}

              <ArrowUpRight
                size={15}
              />

            </span>

          </AIButton>

        </div>

      </div>


      {/* =================================================
          SYSTEM STATUS
          ================================================= */}

      


      {/* =================================================
          METRICS
          ================================================= */}

      <section>

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
          "
        >

          <SectionTitle>
            Performance Overview
          </SectionTitle>

          <button
            onClick={() =>
              navigate("/analytics")
            }
            className="
              flex
              items-center
              gap-1
              text-xs
              text-[var(--muted)]
              transition
              hover:text-[var(--text)]
            "
          >

            Full analytics

            <ChevronRight
              size={14}
            />

          </button>

        </div>


        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <MetricCard
  title="Interviews Completed"
  value={String(stats.total_interviews)}
  description="+12% this month"
  accent="purple"
  icon={Trophy}
/>

<MetricCard
  title="AI Confidence"
  value={`${stats.avg_confidence}%`}
  description="Above previous average"
  accent="cyan"
  icon={Brain}
/>

<MetricCard
  title="Communication"
  value={`${stats.communication}%`}
  description="Strong communication signal"
  accent="green"
  icon={Mic}
/>

<MetricCard
  title="AI Ranking"
  value={`#${stats.ai_rank}`}
  description="Global candidate ranking"
  accent="amber"
  icon={BarChart3}
/>

        </div>

      </section>


      {/* =================================================
          MAIN INTELLIGENCE GRID
          ================================================= */}

      <section
        className="
          mt-6
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-12
        "
      >

        {/* PERFORMANCE */}

        <GlassCard
          className="
            p-6
            xl:col-span-8
          "
        >

          <div
            className="
              mb-6
              flex
              items-start
              justify-between
            "
          >

            <div>

              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                "
              >

                <Activity
                  size={14}
                  className="text-purple-400"
                />

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-purple-400
                  "
                >
                  Performance
                </span>

              </div>


              <h2
                className="
                  text-xl
                  font-semibold
                  text-[var(--text)]
                "
              >
                Interview Performance
              </h2>


              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--muted)]
                "
              >
                Current capability profile
              </p>

            </div>


            <button
              onClick={() =>
                navigate("/analytics")
              }
              className="
                rounded-lg
                border
                border-white/10
                bg-[var(--overlay-soft)]
                px-3
                py-2
                text-[11px]
                text-[var(--text-soft)]
                transition
                hover:border-purple-500/30
                hover:text-[var(--text)]
              "
            >
              Full analytics →
            </button>

          </div>


          <div
            className="
              grid
              grid-cols-1
              gap-6
              lg:grid-cols-[1.15fr_0.85fr]
            "
          >

            <div
              className="
                min-h-[340px]
                rounded-2xl
                border
                border-[var(--border)]
                bg-black/20
                p-3
              "
            >

              <PerformanceRadar
                confidence={stats.avg_confidence}
                communication={stats.communication}
                technical={93}
                problemSolving={90}
                leadership={84}
              />

            </div>


            <div
              className="
                flex
                flex-col
                justify-center
                gap-5
              "
            >

              {performance.map(
                (item) => (

                  <div
                    key={item.title}
                  >

                    <div
                      className="
                        mb-2
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <span
                        className="
                          text-xs
                          text-[var(--text-soft)]
                        "
                      >
                        {item.title}
                      </span>

                      <span
                        className={`
                          text-xs
                          font-semibold
                          ${item.text}
                        `}
                      >
                        {item.value}%
                      </span>

                    </div>


                    <div
                      className="
                        h-1.5
                        overflow-hidden
                        rounded-full
                        bg-[var(--overlay-med)]
                      "
                    >

                      <div
                        className={`
                          h-full
                          rounded-full
                          transition-all
                          duration-700
                          ${item.color}
                        `}
                        style={{
                          width:
                            `${item.value}%`,
                        }}
                      />

                    </div>

                  </div>

                ),
              )}

            </div>

          </div>

        </GlassCard>


        {/* AI INSIGHTS */}

        <GlassCard
          className="
            p-6
            xl:col-span-4
          "
        >

          <div
            className="
              mb-6
              flex
              items-start
              justify-between
            "
          >

            <div>

              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                "
              >

                <Sparkles
                  size={14}
                  className="text-purple-400"
                />

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-purple-400
                  "
                >
                  AI Insight
                </span>

              </div>


              <h2
                className="
                  text-xl
                  font-semibold
                  text-[var(--text)]
                "
              >
                Your next move
              </h2>

            </div>


            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-purple-500/20
                bg-purple-500/10
              "
            >

              <Sparkles
                size={16}
                className="text-purple-400"
              />

            </div>

          </div>


          <div
            className="
              space-y-3
            "
          >

            {insights.map(
              (item) => {

                const Icon =
                  item.icon;

                return (

                  <div
                    key={item.title}
                    className="
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--overlay-soft)]
                      p-4
                      transition
                      duration-300
                      hover:border-white/10
                      hover:bg-[var(--overlay-soft)]
                    "
                  >

                    <div
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >

                      <div
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          ${item.background}
                        `}
                      >

                        <Icon
                          size={15}
                          className={item.color}
                        />

                      </div>


                      <div>

                        <h3
                          className="
                            text-sm
                            font-medium
                            text-[var(--text)]
                          "
                        >
                          {item.title}
                        </h3>


                        <p
                          className="
                            mt-1
                            text-[11px]
                            leading-relaxed
                            text-[var(--muted)]
                          "
                        >
                          {item.description}
                        </p>

                      </div>

                    </div>

                  </div>

                );

              },
            )}

          </div>

        </GlassCard>

      </section>


      {/* =================================================
          QUICK ACTIONS
          ================================================= */}

      <section className="mt-6">

        <SectionTitle>
          Quick Actions
        </SectionTitle>


        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          {quickActions.map(
            (item) => {

              const Icon =
                item.icon;

              return (

                <button
                  key={item.title}
                  onClick={() =>
                    navigate(item.path)
                  }
                  className="
                    group
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--overlay-soft)]
                    p-5
                    text-left
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-purple-500/25
                    hover:bg-[var(--overlay-med)]
                  "
                >

                  <div
                    className="
                      mb-7
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-white/10
                        bg-[var(--overlay-med)]
                        transition
                        group-hover:border-purple-500/20
                        group-hover:bg-purple-500/10
                      "
                    >

                      <Icon
                        size={18}
                        className="
                          text-[var(--text-soft)]
                          transition
                          group-hover:text-purple-400
                        "
                      />

                    </div>


                    <ArrowUpRight
                      size={17}
                      className="
                        text-[var(--muted)]
                        transition
                        group-hover:text-purple-400
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />

                  </div>


                  <h3
                    className="
                      text-sm
                      font-semibold
                      text-[var(--text)]
                    "
                  >
                    {item.title}
                  </h3>


                  <p
                    className="
                      mt-2
                      text-xs
                      leading-relaxed
                      text-[var(--muted)]
                    "
                  >
                    {item.description}
                  </p>

                </button>

              );

            },
          )}

        </div>

      </section>


      {/* =================================================
          ACTIVITY + ORIGINAL AI INSIGHTS
          ================================================= */}

      <section
        className="
          mt-6
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-2
        "
      >

        <GlassCard
          className="p-6"
        >

          <div
            className="
              mb-6
            "
          >

            <div
              className="
                mb-2
                flex
                items-center
                gap-2
              "
            >

              <Clock
                size={14}
                className="text-cyan-400"
              />

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-cyan-400
                "
              >
                Recent Activity
              </span>

            </div>


            <h2
              className="
                text-xl
                font-semibold
                text-[var(--text)]
              "
            >
              Activity Timeline
            </h2>

          </div>


          <ActivityTimeline />

        </GlassCard>


      <AIInsights />

      </section>


      {/* =================================================
          FOOTER STATUS
          ================================================= */}

      <div
        className="
          mt-8
          flex
          flex-col
          gap-3
          border-t
          border-[var(--border)]
          pt-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-400
            "
          />

          <span
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-[var(--muted)]
            "
          >
            Hagrid's Hut Engine Online · The Sorted Club
          </span>

        </div>


        <span
          className="
            text-[10px]
            text-[var(--text-faint)]
          "
        >
          Intelligence layer synchronized
        </span>

      </div>

    </div>

  );
}


export default Dashboard;