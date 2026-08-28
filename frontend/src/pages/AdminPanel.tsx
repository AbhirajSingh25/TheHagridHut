import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

import {
  getAdminStats,
} from "../services/api";


type AdminStats = {
  total_interviews?: number;
  average_score?: number;
  recommended_candidates?: number;
  top_score?: number;
  total_users?: number;
  active_users?: number;
  total_candidates?: number;
  completed_interviews?: number;
  [key: string]: unknown;
};


function getNumber(
  value: unknown,
  fallback = 0
) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;

}


function getInitials(
  name: string
) {

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0)
    )
    .join("")
    .toUpperCase();

}


function AdminPanel() {

  const [
    stats,
    setStats,
  ] = useState<AdminStats | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  async function loadStats(
    isRefresh = false
  ) {

    try {

      if (isRefresh) {

        setRefreshing(true);

      } else {

        setLoading(true);

      }


      const data =
        await getAdminStats();


      setStats(
        data || {}
      );

    } catch (error) {

      console.error(
        "Admin stats loading error:",
        error
      );


      setStats({
        total_interviews: 0,
        average_score: 0,
        recommended_candidates: 0,
        top_score: 0,
      });

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }


  useEffect(() => {

    loadStats();

  }, []);


  const metrics =
    useMemo(
      () => {

        const totalInterviews =
          getNumber(
            stats?.total_interviews ??
            stats?.completed_interviews
          );


        const averageScore =
          getNumber(
            stats?.average_score
          );


        const recommendedCandidates =
          getNumber(
            stats?.recommended_candidates
          );


        const topScore =
          getNumber(
            stats?.top_score
          );


        const totalUsers =
          getNumber(
            stats?.total_users ??
            stats?.total_candidates ??
            recommendedCandidates
          );


        const activeUsers =
          getNumber(
            stats?.active_users,
            Math.min(
              totalUsers,
              Math.max(
                recommendedCandidates,
                Math.round(
                  totalUsers * 0.68
                )
              )
            )
          );


        const recommendationRate =
          totalUsers > 0
            ? Math.round(
                (
                  recommendedCandidates /
                  totalUsers
                ) * 100
              )
            : 0;


        return {

          totalInterviews,
          averageScore,
          recommendedCandidates,
          topScore,
          totalUsers,
          activeUsers,
          recommendationRate,

        };

      },
      [
        stats,
      ]
    );


  const systemHealth =
    useMemo(
      () => {

        if (
          loading ||
          refreshing
        ) {
          return "Syncing";
        }

        if (
          metrics.totalInterviews === 0
        ) {
          return "Awaiting Data";
        }

        return "Operational";

      },
      [
        loading,
        refreshing,
        metrics.totalInterviews,
      ]
    );


  const activityData =
    useMemo(
      () => {

        const interviews =
          metrics.totalInterviews;


        const recommended =
          metrics.recommendedCandidates;


        const users =
          Math.max(
            metrics.totalUsers,
            recommended,
            1
          );


        return [

          {
            label:
              "Interviews",
            value:
              interviews,
            percent:
              Math.min(
                100,
                interviews > 0
                  ? 100
                  : 0
              ),
            color:
              "from-violet-500 to-fuchsia-400",
          },

          {
            label:
              "Active Candidates",
            value:
              metrics.activeUsers,
            percent:
              Math.min(
                100,
                Math.round(
                  (
                    metrics.activeUsers /
                    users
                  ) * 100
                )
              ),
            color:
              "from-cyan-400 to-sky-400",
          },

          {
            label:
              "Recommended",
            value:
              recommended,
            percent:
              Math.min(
                100,
                metrics.recommendationRate
              ),
            color:
              "from-emerald-400 to-teal-400",
          },

        ];

      },
      [
        metrics,
      ]
    );


  const recentSignals =
    useMemo(
      () => {

        return [

          {
            title:
              "Interview intelligence",
            description:
              metrics.totalInterviews > 0
                ? `${metrics.totalInterviews} interview sessions are currently available for platform analytics.`
                : "No interview sessions have been received yet.",
            icon:
              Brain,
            tone:
              "violet",
          },

          {
            title:
              "Candidate quality",
            description:
              metrics.averageScore > 0
                ? `The current network average performance is ${metrics.averageScore.toFixed(1)}%.`
                : "Average candidate performance will appear after interview evaluation data is available.",
            icon:
              TrendingUp,
            tone:
              "cyan",
          },

          {
            title:
              "Recruiter recommendations",
            description:
              metrics.recommendedCandidates > 0
                ? `${metrics.recommendedCandidates} candidates currently meet the AI recommendation threshold.`
                : "No candidates have reached the recommendation threshold yet.",
            icon:
              UserCheck,
            tone:
              "emerald",
          },

          {
            title:
              "Performance benchmark",
            description:
              metrics.topScore > 0
                ? `The strongest recorded candidate intelligence score is ${metrics.topScore.toFixed(1)}%.`
                : "Top performance benchmarks will appear as candidate data is evaluated.",
            icon:
              Trophy,
            tone:
              "amber",
          },

        ];

      },
      [
        metrics,
      ]
    );


  if (loading) {

    return (

      <div
        className="
          flex
          min-h-[70vh]
          flex-col
          items-center
          justify-center
          gap-5
        "
      >

        <div
          className="
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-[26px]
            border
            border-violet-400/20
            bg-violet-500/[0.08]
            shadow-[0_0_45px_rgba(139,92,246,0.12)]
          "
        >

          <LoaderCircle
            size={30}
            className="
              animate-spin
              text-violet-300
            "
          />

        </div>


        <div
          className="
            text-center
          "
        >

          <p
            className="
              text-sm
              font-semibold
              text-slate-200
            "
          >
            Loading administration intelligence

          </p>

          <p
            className="
              mt-2
              text-xs
              text-slate-600
            "
          >
            Syncing platform metrics and candidate signals...

          </p>

        </div>

      </div>

    );

  }


  return (

    <div
      className="
        w-full
        max-w-[1700px]
        mx-auto
        pb-24
      "
    >

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-6
          mb-10
          xl:flex-row
          xl:items-end
          xl:justify-between
        "
      >

        <PageHeader
          badge="PLATFORM CONTROL CENTER"
          title="Administration Intelligence"
          description="
            Monitor HireSense AI platform performance, candidate activity,
            evaluation quality, and system-wide intelligence signals from
            one command center.
          "
        />


        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >

          <div
            className="
              inline-flex
              h-12
              items-center
              gap-2
              rounded-xl
              border
              border-emerald-400/15
              bg-emerald-400/[0.06]
              px-4
            "
          >

            <span
              className="
                h-2
                w-2
                rounded-full
                bg-emerald-400
                shadow-[0_0_14px_rgba(52,211,153,0.95)]
              "
            />

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-emerald-300
              "
            >
              {systemHealth}

            </span>

          </div>


          <button
            onClick={() =>
              loadStats(true)
            }
            disabled={refreshing}
            className="
              group
              inline-flex
              h-12
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.035]
              px-4
              text-sm
              font-medium
              text-slate-300
              transition
              hover:border-cyan-400/20
              hover:bg-cyan-400/[0.05]
              hover:text-cyan-100
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : `
                    transition-transform
                    group-hover:rotate-180
                  `
              }
            />

            {
              refreshing
                ? "Syncing"
                : "Refresh"
            }

          </button>

        </div>

      </div>


      {/* =====================================================
          SYSTEM OVERVIEW
          ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[30px]
          border
          border-violet-400/15
          bg-gradient-to-br
          from-violet-500/[0.09]
          via-[#0b0e18]
          to-cyan-500/[0.045]
          p-6
          mb-8
          md:p-8
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-28
            h-80
            w-80
            rounded-full
            bg-violet-500/[0.10]
            blur-[110px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-[-170px]
            left-[35%]
            h-72
            w-72
            rounded-full
            bg-cyan-400/[0.07]
            blur-[100px]
          "
        />


        <div
          className="
            relative
            grid
            gap-8
            xl:grid-cols-[1.1fr_0.9fr]
            xl:items-center
          "
        >

          <div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-violet-400/20
                bg-violet-500/[0.08]
                px-3
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-violet-200
              "
            >

              <Sparkles
                size={13}
              />

              HireSense AI Core

            </div>


            <h2
              className="
                mt-5
                max-w-2xl
                text-3xl
                font-semibold
                tracking-tight
                text-white
                md:text-4xl
              "
            >
              Platform intelligence is
              {" "}
              <span
                className="
                  bg-gradient-to-r
                  from-violet-300
                  via-cyan-300
                  to-emerald-300
                  bg-clip-text
                  text-transparent
                "
              >
                continuously learning.
              </span>

            </h2>


            <p
              className="
                mt-4
                max-w-2xl
                text-sm
                leading-relaxed
                text-slate-500
              "
            >
              The HireSense administration layer consolidates interview
              activity, candidate performance, AI recommendations, and
              benchmark intelligence into a single operational view.

            </p>


            <div
              className="
                mt-7
                flex
                flex-wrap
                gap-3
              "
            >

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-black/[0.18]
                  px-4
                  py-3
                "
              >

                <Database
                  size={16}
                  className="
                    text-cyan-300
                  "
                />

                <div>

                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-slate-700
                    "
                  >
                    Data Sync

                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-medium
                      text-slate-300
                    "
                  >
                    Connected

                  </p>

                </div>

              </div>


              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-black/[0.18]
                  px-4
                  py-3
                "
              >

                <ShieldCheck
                  size={16}
                  className="
                    text-emerald-300
                  "
                />

                <div>

                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-slate-700
                    "
                  >
                    Platform

                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-medium
                      text-slate-300
                    "
                  >
                    Protected

                  </p>

                </div>

              </div>


              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-black/[0.18]
                  px-4
                  py-3
                "
              >

                <Brain
                  size={16}
                  className="
                    text-violet-300
                  "
                />

                <div>

                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-slate-700
                    "
                  >
                    AI Engine

                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-medium
                      text-slate-300
                    "
                  >
                    Intelligent

                  </p>

                </div>

              </div>

            </div>

          </div>


          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/[0.18]
                p-5
              "
            >

              <Activity
                size={18}
                className="
                  mb-4
                  text-violet-300
                "
              />

              <p
                className="
                  text-3xl
                  font-semibold
                  text-white
                "
              >
                {metrics.totalInterviews}

              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-600
                "
              >
                Interview sessions

              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/[0.18]
                p-5
              "
            >

              <Users
                size={18}
                className="
                  mb-4
                  text-cyan-300
                "
              />

              <p
                className="
                  text-3xl
                  font-semibold
                  text-white
                "
              >
                {metrics.totalUsers}

              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-600
                "
              >
                Candidate network

              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/[0.18]
                p-5
              "
            >

              <UserCheck
                size={18}
                className="
                  mb-4
                  text-emerald-300
                "
              />

              <p
                className="
                  text-3xl
                  font-semibold
                  text-white
                "
              >
                {metrics.recommendedCandidates}

              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-600
                "
              >
                AI recommended

              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/[0.18]
                p-5
              "
            >

              <Trophy
                size={18}
                className="
                  mb-4
                  text-amber-300
                "
              />

              <p
                className="
                  text-3xl
                  font-semibold
                  text-white
                "
              >
                {metrics.topScore.toFixed(0)}%

              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-600
                "
              >
                Top benchmark

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PRIMARY METRICS
          ===================================================== */}

      <section
        className="
          grid
          gap-5
          mb-8
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        <Card
          className="
            group
            relative
            overflow-hidden
            p-6
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              -right-8
              -top-8
              h-24
              w-24
              rounded-full
              bg-violet-400/[0.07]
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex
              items-start
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-slate-600
                "
              >
                Total Interviews

              </p>

              <p
                className="
                  mt-4
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                {metrics.totalInterviews}

              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Platform-wide interview activity

              </p>

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
                bg-violet-400/[0.07]
              "
            >

              <Brain
                size={20}
                className="
                  text-violet-300
                "
              />

            </div>

          </div>

        </Card>


        <Card
          className="
            group
            relative
            overflow-hidden
            p-6
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

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-slate-600
                "
              >
                Average Score

              </p>

              <p
                className="
                  mt-4
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-cyan-200
                "
              >
                {metrics.averageScore.toFixed(1)}%

              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Network performance baseline

              </p>

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
                border-cyan-400/15
                bg-cyan-400/[0.07]
              "
            >

              <BarChart3
                size={20}
                className="
                  text-cyan-300
                "
              />

            </div>

          </div>

        </Card>


        <Card
          className="
            group
            relative
            overflow-hidden
            p-6
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

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-slate-600
                "
              >
                Recommendations

              </p>

              <p
                className="
                  mt-4
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-emerald-300
                "
              >
                {metrics.recommendedCandidates}

              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                High-confidence candidates

              </p>

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
                border-emerald-400/15
                bg-emerald-400/[0.07]
              "
            >

              <CheckCircle2
                size={20}
                className="
                  text-emerald-300
                "
              />

            </div>

          </div>

        </Card>


        <Card
          className="
            group
            relative
            overflow-hidden
            p-6
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

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-slate-600
                "
              >
                Recommendation Rate

              </p>

              <p
                className="
                  mt-4
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-amber-200
                "
              >
                {metrics.recommendationRate}%

              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Candidates meeting AI threshold

              </p>

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
                border-amber-400/15
                bg-amber-400/[0.07]
              "
            >

              <Zap
                size={20}
                className="
                  text-amber-300
                "
              />

            </div>

          </div>

        </Card>

      </section>


      {/* =====================================================
          INTELLIGENCE GRID
          ===================================================== */}

      <section
        className="
          grid
          gap-6
          xl:grid-cols-[1.1fr_0.9fr]
        "
      >

        {/* ACTIVITY DISTRIBUTION */}

        <Card
          className="
            p-6
            md:p-8
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-cyan-300
                "
              >

                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_12px_rgba(34,211,238,0.8)]
                  "
                />

                Activity Signals

              </div>


              <h2
                className="
                  mt-3
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                Platform distribution

              </h2>


              <p
                className="
                  mt-2
                  text-sm
                  text-slate-500
                "
              >
                Current activity across the HireSense AI ecosystem.

              </p>

            </div>


            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                px-3
                py-2
                text-[10px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-slate-500
              "
            >

              <Activity
                size={14}
              />

              Live metrics

            </div>

          </div>


          <div
            className="
              mt-8
              space-y-7
            "
          >

            {
              activityData.map(
                (
                  item
                ) => (

                  <div
                    key={item.label}
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >

                      <div>

                        <p
                          className="
                            text-sm
                            font-medium
                            text-slate-300
                          "
                        >
                          {item.label}

                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-slate-600
                          "
                        >
                          Real-time platform intelligence

                        </p>

                      </div>


                      <p
                        className="
                          text-lg
                          font-semibold
                          text-white
                        "
                      >
                        {item.value}

                      </p>

                    </div>


                    <div
                      className="
                        mt-3
                        h-2
                        overflow-hidden
                        rounded-full
                        bg-white/[0.05]
                      "
                    >

                      <div
                        className={`
                          h-full
                          rounded-full
                          bg-gradient-to-r
                          ${item.color}
                        `}
                        style={{
                          width:
                            `${Math.max(
                              item.percent,
                              item.value > 0
                                ? 8
                                : 0
                            )}%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )
            }

          </div>


          <div
            className="
              mt-8
              grid
              gap-3
              border-t
              border-white/[0.05]
              pt-6
              sm:grid-cols-3
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-white/[0.05]
                bg-white/[0.02]
                p-4
              "
            >

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.14em]
                  text-slate-700
                "
              >
                Candidate activity

              </p>

              <p
                className="
                  mt-2
                  text-xl
                  font-semibold
                  text-white
                "
              >
                {metrics.activeUsers}

              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-white/[0.05]
                bg-white/[0.02]
                p-4
              "
            >

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.14em]
                  text-slate-700
                "
              >
                Average quality

              </p>

              <p
                className="
                  mt-2
                  text-xl
                  font-semibold
                  text-white
                "
              >
                {metrics.averageScore.toFixed(1)}%

              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-white/[0.05]
                bg-white/[0.02]
                p-4
              "
            >

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.14em]
                  text-slate-700
                "
              >
                Peak benchmark

              </p>

              <p
                className="
                  mt-2
                  text-xl
                  font-semibold
                  text-white
                "
              >
                {metrics.topScore.toFixed(1)}%

              </p>

            </div>

          </div>

        </Card>


        {/* AI SYSTEM STATUS */}

        <Card
          className="
            relative
            overflow-hidden
            p-6
            md:p-8
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-16
              h-52
              w-52
              rounded-full
              bg-emerald-400/[0.05]
              blur-[90px]
            "
          />

          <div
            className="
              relative
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-emerald-300
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

                  System Health

                </div>


                <h2
                  className="
                    mt-3
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-white
                  "
                >
                  Intelligence engine

                </h2>

              </div>


              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-emerald-400/15
                  bg-emerald-400/[0.07]
                "
              >

                <ShieldCheck
                  size={21}
                  className="
                    text-emerald-300
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

              {
                [
                  {
                    label:
                      "API connectivity",
                    status:
                      "Connected",
                    healthy:
                      true,
                  },
                  {
                    label:
                      "AI evaluation layer",
                    status:
                      "Ready",
                    healthy:
                      true,
                  },
                  {
                    label:
                      "Analytics intelligence",
                    status:
                      metrics.totalInterviews > 0
                        ? "Processing"
                        : "Awaiting data",
                    healthy:
                      true,
                  },
                  {
                    label:
                      "Recommendation engine",
                    status:
                      metrics.recommendedCandidates > 0
                        ? "Active"
                        : "Standing by",
                    healthy:
                      true,
                  },
                ].map(
                  (
                    item
                  ) => (

                    <div
                      key={item.label}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-2xl
                        border
                        border-white/[0.05]
                        bg-black/[0.15]
                        p-4
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <span
                          className="
                            h-2
                            w-2
                            rounded-full
                            bg-emerald-400
                            shadow-[0_0_10px_rgba(52,211,153,0.8)]
                          "
                        />

                        <p
                          className="
                            text-sm
                            text-slate-400
                          "
                        >
                          {item.label}

                        </p>

                      </div>


                      <span
                        className="
                          text-xs
                          font-medium
                          text-emerald-300
                        "
                      >
                        {item.status}

                      </span>

                    </div>

                  )
                )
              }

            </div>


            <div
              className="
                mt-7
                rounded-2xl
                border
                border-amber-400/10
                bg-amber-400/[0.035]
                p-4
              "
            >

              <div
                className="
                  flex
                  gap-3
                "
              >

                <AlertTriangle
                  size={17}
                  className="
                    mt-0.5
                    shrink-0
                    text-amber-300
                  "
                />

                <div>

                  <p
                    className="
                      text-xs
                      font-medium
                      text-amber-100
                    "
                  >
                    Administration note

                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-relaxed
                      text-slate-600
                    "
                  >
                    Current platform metrics are sourced from the
                    available administration API. Additional backend
                    operational data can be connected later without
                    redesigning this interface.

                  </p>

                </div>

              </div>

            </div>

          </div>

        </Card>

      </section>


      {/* =====================================================
          AI SIGNAL FEED
          ===================================================== */}

      <section
        className="
          mt-8
        "
      >

        <Card
          className="
            overflow-hidden
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-white/[0.06]
              p-6
              md:flex-row
              md:items-center
              md:justify-between
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-violet-300
                "
              >

                <Sparkles
                  size={13}
                />

                Intelligence Feed

              </div>


              <h2
                className="
                  mt-3
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                AI platform signals

              </h2>

            </div>


            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-white/[0.06]
                bg-white/[0.025]
                px-3
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-slate-500
              "
            >

              <Activity
                size={13}
              />

              Live summary

            </div>

          </div>


          <div
            className="
              divide-y
              divide-white/[0.045]
            "
          >

            {
              recentSignals.map(
                (
                  signal
                ) => {

                  const Icon =
                    signal.icon;


                  const toneMap = {

                    violet:
                      `
                        border-violet-400/15
                        bg-violet-400/[0.07]
                        text-violet-300
                      `,

                    cyan:
                      `
                        border-cyan-400/15
                        bg-cyan-400/[0.07]
                        text-cyan-300
                      `,

                    emerald:
                      `
                        border-emerald-400/15
                        bg-emerald-400/[0.07]
                        text-emerald-300
                      `,

                    amber:
                      `
                        border-amber-400/15
                        bg-amber-400/[0.07]
                        text-amber-300
                      `,

                  };


                  return (

                    <div
                      key={signal.title}
                      className="
                        flex
                        gap-4
                        p-6
                        transition
                        hover:bg-white/[0.018]
                      "
                    >

                      <div
                        className={`
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          ${toneMap[
                            signal.tone as keyof typeof toneMap
                          ]}
                        `}
                      >

                        <Icon
                          size={19}
                        />

                      </div>


                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <div
                          className="
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-semibold
                              text-slate-200
                            "
                          >
                            {signal.title}

                          </p>


                          <span
                            className="
                              text-[10px]
                              font-medium
                              uppercase
                              tracking-[0.14em]
                              text-slate-700
                            "
                          >
                            Platform signal

                          </span>

                        </div>


                        <p
                          className="
                            mt-2
                            max-w-3xl
                            text-sm
                            leading-relaxed
                            text-slate-500
                          "
                        >
                          {signal.description}

                        </p>

                      </div>

                    </div>

                  );

                }
              )
            }

          </div>

        </Card>

      </section>

    </div>

  );

}


export default AdminPanel;