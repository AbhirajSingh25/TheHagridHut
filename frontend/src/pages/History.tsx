import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  AlertCircle,
  ArrowRight,
  Brain,
  CalendarDays,
  ChevronDown,
  Clock3,
  FileSearch,
  Filter,
  History as HistoryIcon,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";

import {
  getInterviewHistory,
  getInterviewSessions,
} from "../services/api";


/* =========================================================
   TYPES
   ========================================================= */

type InterviewSession = {
  id: string | number;

  role: string;

  level: string;

  overall_score: number;

  created_at?: string;

  duration?: number | string;

  questions?: unknown;

  answers?: unknown;

  evaluations?: unknown;

  final_report?: unknown;

  technical_score?: number;

  communication_score?: number;

  confidence_score?: number;
};


type NormalizedSession = {
  id: string;

  role: string;

  level: string;

  score: number;

  date: string;

  duration: string;

  questionsCount: number;

  technical: number;

  communication: number;

  confidence: number;

  raw: any;
};


type SortOption =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";


/* =========================================================
   CONSTANTS
   ========================================================= */

const LEVELS = [
  "All levels",
  "Beginner",
  "Intermediate",
  "Advanced",
];


const SCORE_FILTERS = [
  "All scores",
  "90+",
  "75-89",
  "60-74",
  "Below 60",
];


/* =========================================================
   HELPERS
   ========================================================= */

function getNumber(
  ...values: unknown[]
): number {
  for (const value of values) {

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {

      const parsed =
        Number(value);

      if (
        Number.isFinite(parsed)
      ) {
        return parsed;
      }
    }
  }

  return 0;
}


function getArray(
  value: unknown
): unknown[] {

  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {

    try {

      const parsed =
        JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];

    } catch {

      return [];
    }
  }

  return [];
}


function formatDate(
  value?: string
): string {

  if (!value) {
    return "Recently";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}


function formatDuration(
  value?: string | number
): string {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    typeof value === "number"
  ) {

    if (
      value < 60
    ) {
      return `${value}s`;
    }

    const minutes =
      Math.floor(
        value / 60
      );

    const seconds =
      value % 60;

    return `${minutes}m ${
      seconds
        .toString()
        .padStart(2, "0")
    }s`;
  }

  return "—";
}


function normalizeSession(
  item: any,
  index: number
): NormalizedSession {

  const evaluations =
    getArray(
      item?.evaluations
    );

  const finalReport =
    typeof item?.final_report ===
    "string"
      ? (() => {

          try {

            return JSON.parse(
              item.final_report
            );

          } catch {

            return {};
          }

        })()
      : (
        item?.final_report ||
        {}
      );


  const calculatedScore =
    evaluations.length > 0
      ? evaluations.reduce<number>(
          (
            total,
            evaluation: any
          ) =>
            total +
            getNumber(
              evaluation?.score,
              evaluation?.overall_score
            ),
          0
        ) /
        evaluations.length
      : 0;


  const score =
    Math.round(
      getNumber(
        item?.overall_score,
        item?.score,
        finalReport?.overall_score,
        finalReport?.score,
        calculatedScore
      )
    );


  const technical =
    Math.round(
      getNumber(
        item?.technical_score,
        item?.technical,
        finalReport?.technical_score,
        finalReport?.technical
      )
    );


  const communication =
    Math.round(
      getNumber(
        item?.communication_score,
        item?.communication,
        finalReport?.communication_score,
        finalReport?.communication
      )
    );


  const confidence =
    Math.round(
      getNumber(
        item?.confidence_score,
        item?.confidence,
        finalReport?.confidence_score,
        finalReport?.confidence
      )
    );


  const questions =
    getArray(
      item?.questions
    );


  return {

    id:
      String(
        item?.id ??
        item?.session_id ??
        index
      ),

    role:
      item?.role ||
      item?.target_role ||
      "Interview Session",

    level:
      item?.level ||
      item?.experience_level ||
      "General",

    score,

    date:
      formatDate(
        item?.created_at ||
        item?.date
      ),

    duration:
      formatDuration(
        item?.duration ||
        item?.duration_seconds ||
        item?.session_duration
      ),

    questionsCount:
      questions.length ||
      getNumber(
        item?.question_count
      ),

    technical,

    communication,

    confidence,

    raw: item,
  };
}


function getScoreTheme(
  score: number
) {

  if (
    score >= 85
  ) {
    return {
      label: "Excellent",
      text: "text-emerald-300",
      border: "border-emerald-400/20",
      background:
        "bg-emerald-500/[0.07]",
      glow:
        "shadow-[0_0_35px_rgba(16,185,129,0.08)]",
    };
  }

  if (
    score >= 70
  ) {
    return {
      label: "Strong",
      text: "text-cyan-300",
      border: "border-cyan-400/20",
      background:
        "bg-cyan-500/[0.07]",
      glow:
        "shadow-[0_0_35px_rgba(34,211,238,0.08)]",
    };
  }

  if (
    score >= 55
  ) {
    return {
      label: "Developing",
      text: "text-amber-300",
      border: "border-amber-400/20",
      background:
        "bg-amber-500/[0.07]",
      glow:
        "shadow-[0_0_35px_rgba(251,191,36,0.08)]",
    };
  }

  return {
    label: "Needs practice",
    text: "text-violet-300",
    border: "border-violet-400/20",
    background:
      "bg-violet-500/[0.07]",
    glow:
      "shadow-[0_0_35px_rgba(139,92,246,0.08)]",
  };
}


/* =========================================================
   COMPONENT
   ========================================================= */

function History() {

  const navigate =
    useNavigate();


  /* ===============================================
     STATE
     =============================================== */

  const [
    sessions,
    setSessions,
  ] =
    useState<NormalizedSession[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    levelFilter,
    setLevelFilter,
  ] =
    useState(
      "All levels"
    );


  const [
    scoreFilter,
    setScoreFilter,
  ] =
    useState(
      "All scores"
    );


  const [
    sortBy,
    setSortBy,
  ] =
    useState<SortOption>(
      "newest"
    );


  const [
    filtersOpen,
    setFiltersOpen,
  ] =
    useState(false);


  const [
    selectedSession,
    setSelectedSession,
  ] =
    useState<NormalizedSession | null>(
      null
    );


  /* ===============================================
     LOAD HISTORY
     =============================================== */

  async function loadHistory(
    showRefreshState = false
  ) {

    try {

      if (
        showRefreshState
      ) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }


      setError("");


      let response: any;


      try {

        response =
          await getInterviewHistory();

      } catch {

        response =
          await getInterviewSessions();
      }


      const rawSessions =
        Array.isArray(response)
          ? response
          : Array.isArray(
              response?.sessions
            )
          ? response.sessions
          : Array.isArray(
              response?.data
            )
          ? response.data
          : Array.isArray(
              response?.history
            )
          ? response.history
          : [];


      const normalized =
        rawSessions.map(
          normalizeSession
        );


      setSessions(
        normalized
      );

    } catch (err) {

      console.error(
        "History loading failed:",
        err
      );


      setError(
        "Interview history could not be loaded from the backend yet."
      );


      setSessions(
        []
      );

    } finally {

      setLoading(false);

      setRefreshing(false);
    }
  }


  /* ===============================================
     INITIAL LOAD
     =============================================== */

  useEffect(() => {

    loadHistory();

  }, []);


  /* ===============================================
     FILTERED SESSIONS
     =============================================== */

  const filteredSessions =
    useMemo(() => {

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();


      let result =
        [...sessions];


      if (
        normalizedSearch
      ) {

        result =
          result.filter(
            (session) =>
              session.role
                .toLowerCase()
                .includes(
                  normalizedSearch
                ) ||
              session.level
                .toLowerCase()
                .includes(
                  normalizedSearch
                )
          );
      }


      if (
        levelFilter !==
        "All levels"
      ) {

        result =
          result.filter(
            (session) =>
              session.level
                .toLowerCase()
                .includes(
                  levelFilter.toLowerCase()
                )
          );
      }


      if (
        scoreFilter !==
        "All scores"
      ) {

        result =
          result.filter(
            (session) => {

              if (
                scoreFilter ===
                "90+"
              ) {
                return (
                  session.score >= 90
                );
              }


              if (
                scoreFilter ===
                "75-89"
              ) {
                return (
                  session.score >= 75 &&
                  session.score <= 89
                );
              }


              if (
                scoreFilter ===
                "60-74"
              ) {
                return (
                  session.score >= 60 &&
                  session.score <= 74
                );
              }


              return (
                session.score < 60
              );
            }
          );
      }


      result.sort(
        (a, b) => {

          if (
            sortBy ===
            "highest"
          ) {
            return (
              b.score -
              a.score
            );
          }


          if (
            sortBy ===
            "lowest"
          ) {
            return (
              a.score -
              b.score
            );
          }


          if (
            sortBy ===
            "oldest"
          ) {
            return (
              a.id.localeCompare(
                b.id
              )
            );
          }


          return (
            b.id.localeCompare(
              a.id
            )
          );
        }
      );


      return result;

    }, [
      sessions,
      search,
      levelFilter,
      scoreFilter,
      sortBy,
    ]);


  /* ===============================================
     STATS
     =============================================== */

  const stats =
    useMemo(() => {

      const total =
        sessions.length;


      const average =
        total > 0
          ? Math.round(
              sessions.reduce(
                (
                  sum,
                  session
                ) =>
                  sum +
                  session.score,
                0
              ) / total
            )
          : 0;


      const best =
        total > 0
          ? Math.max(
              ...sessions.map(
                (session) =>
                  session.score
              )
            )
          : 0;


      const improvement =
        total >= 2
          ? Math.round(
              sessions[
                sessions.length - 1
              ].score -
              sessions[0].score
            )
          : 0;


      return {
        total,
        average,
        best,
        improvement,
      };

    }, [
      sessions,
    ]);


  /* ===============================================
     ACTIONS
     =============================================== */

  function clearFilters() {

    setSearch("");

    setLevelFilter(
      "All levels"
    );

    setScoreFilter(
      "All scores"
    );

    setSortBy(
      "newest"
    );
  }


  function startNewInterview() {

    navigate(
      "/mock-interview"
    );
  }


  function openPlayback(
    session: NormalizedSession
  ) {

    navigate(
      `/playback/${session.id}`
    );
  }


  /* ===============================================
     RENDER
     =============================================== */

  return (

    <div
      className="
        min-h-full
        px-5
        py-6
        md:px-8
        lg:px-10
        xl:px-12
        pb-16
      "
    >

      {/* =========================================
          HEADER
          ========================================= */}

      <motion.section
        initial={{
          opacity: 0,
          y: 12,
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
          border-white/[0.07]
          bg-[#0c0d14]/85
          px-6
          py-7
          md:px-8
          md:py-8
          shadow-[0_20px_80px_rgba(0,0,0,0.16)]
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-violet-500/[0.08]
            blur-[100px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/3
            h-40
            w-80
            rounded-full
            bg-cyan-500/[0.05]
            blur-[90px]
          "
        />


        <div
          className="
            relative
            flex
            flex-col
            gap-6
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >

          <div>

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-violet-300/80
              "
            >
              <HistoryIcon
                size={13}
              />

              Interview intelligence
            </div>


            <h1
              className="
                text-3xl
                font-semibold
                tracking-tight
                text-slate-100
                md:text-4xl
              "
            >
              Interview History
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
              Review every completed interview,
              revisit your performance,
              and track how your preparation
              evolves over time.
            </p>

          </div>


          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >

            <button
              onClick={() =>
                loadHistory(true)
              }
              disabled={
                refreshing
              }
              className="
                inline-flex
                h-11
                items-center
                gap-2
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                px-4
                text-sm
                font-medium
                text-slate-300
                transition
                hover:border-cyan-400/20
                hover:bg-cyan-500/[0.06]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>


            <button
              onClick={
                startNewInterview
              }
              className="
                group
                inline-flex
                h-11
                items-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-violet-600
                via-violet-500
                to-cyan-500
                px-5
                text-sm
                font-semibold
                text-white
                shadow-[0_12px_40px_rgba(124,58,237,0.24)]
                transition-all
                hover:-translate-y-0.5
                hover:shadow-[0_18px_50px_rgba(34,211,238,0.18)]
              "
            >
              <Play
                size={15}
                fill="currentColor"
              />

              Start interview

              <ArrowRight
                size={15}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </button>

          </div>

        </div>

      </motion.section>


      {/* =========================================
          ERROR STATE
          ========================================= */}

      <AnimatePresence>

        {error && (

          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            className="
              mt-4
              flex
              items-start
              justify-between
              gap-4
              rounded-2xl
              border
              border-amber-400/20
              bg-amber-500/[0.045]
              px-5
              py-4
            "
          >

            <div
              className="
                flex
                gap-3
              "
            >
              <AlertCircle
                size={18}
                className="
                  mt-0.5
                  shrink-0
                  text-amber-300
                "
              />

              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-amber-100
                  "
                >
                  History backend unavailable
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-amber-200/55
                  "
                >
                  {error}
                  The page UI is ready,
                  but no fake interview data
                  is being invented here.
                  Humanity has enough fabricated
                  metrics already.
                </p>

              </div>
            </div>


            <button
              onClick={() =>
                setError("")
              }
              className="
                text-amber-200/50
                transition
                hover:text-amber-200
              "
            >
              <X
                size={17}
              />
            </button>

          </motion.div>

        )}

      </AnimatePresence>


      {/* =========================================
          STATS
          ========================================= */}

      <section
        className="
          mt-6
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        <StatCard
          icon={
            <HistoryIcon
              size={18}
            />
          }
          label="Completed interviews"
          value={
            loading
              ? "—"
              : stats.total
          }
          description="Total recorded sessions"
          tone="violet"
        />


        <StatCard
          icon={
            <TrendingUp
              size={18}
            />
          }
          label="Average score"
          value={
            loading
              ? "—"
              : `${stats.average}%`
          }
          description="Across all interviews"
          tone="cyan"
        />


        <StatCard
          icon={
            <Trophy
              size={18}
            />
          }
          label="Best performance"
          value={
            loading
              ? "—"
              : `${stats.best}%`
          }
          description="Highest recorded score"
          tone="amber"
        />


        <StatCard
          icon={
            <Sparkles
              size={18}
            />
          }
          label="Progress trend"
          value={
            loading
              ? "—"
              : stats.improvement > 0
              ? `+${stats.improvement}%`
              : `${stats.improvement}%`
          }
          description="Recent performance movement"
          tone="emerald"
        />

      </section>


      {/* =========================================
          HISTORY WORKSPACE
          ========================================= */}

      <section
        className="
          mt-6
          overflow-hidden
          rounded-[26px]
          border
          border-white/[0.07]
          bg-[#0b0c13]/90
          shadow-[0_20px_70px_rgba(0,0,0,0.12)]
        "
      >

        {/* =======================================
            TOOLBAR
            ======================================= */}

        <div
          className="
            border-b
            border-white/[0.06]
            p-5
            md:p-6
          "
        >

          <div
            className="
              flex
              flex-col
              gap-5
              xl:flex-row
              xl:items-center
              xl:justify-between
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
                  tracking-[0.24em]
                  text-cyan-300/75
                "
              >
                <Brain
                  size={13}
                />

                Performance archive
              </div>


              <h2
                className="
                  mt-2
                  text-xl
                  font-semibold
                  text-slate-100
                "
              >
                Your interview sessions
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                {
                  filteredSessions.length
                }{" "}
                session
                {
                  filteredSessions.length === 1
                    ? ""
                    : "s"
                }{" "}
                matching your current view.
              </p>

            </div>


            <div
              className="
                flex
                flex-col
                gap-3
                md:flex-row
                md:items-center
              "
            >

              {/* SEARCH */}

              <div
                className="
                  relative
                  min-w-[240px]
                "
              >

                <Search
                  size={16}
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-500
                  "
                />

                <input
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="
                    Search role or level...
                  "
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-black/20
                    pl-10
                    pr-10
                    text-sm
                    text-slate-200
                    outline-none
                    transition
                    placeholder:text-slate-600
                    focus:border-cyan-400/30
                    focus:bg-cyan-500/[0.025]
                  "
                />

                {search && (

                  <button
                    onClick={() =>
                      setSearch("")
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-600
                      transition
                      hover:text-white
                    "
                  >
                    <X
                      size={15}
                    />
                  </button>

                )}

              </div>


              {/* FILTER BUTTON */}

              <button
                onClick={() =>
                  setFiltersOpen(
                    !filtersOpen
                  )
                }
                className={`
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  px-4
                  text-sm
                  font-medium
                  transition
                  ${
                    filtersOpen
                      ? `
                        border-violet-400/30
                        bg-violet-500/[0.08]
                        text-violet-200
                      `
                      : `
                        border-white/[0.07]
                        bg-white/[0.02]
                        text-slate-400
                        hover:text-white
                        hover:border-white/[0.12]
                      `
                  }
                `}
              >
                <Filter
                  size={16}
                />

                Filters

                <ChevronDown
                  size={15}
                  className={`
                    transition-transform
                    ${
                      filtersOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

            </div>

          </div>


          {/* FILTER PANEL */}

          <AnimatePresence>

            {filtersOpen && (

              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.22,
                }}
                className="
                  overflow-hidden
                "
              >

                <div
                  className="
                    mt-5
                    grid
                    grid-cols-1
                    gap-4
                    border-t
                    border-white/[0.05]
                    pt-5
                    md:grid-cols-3
                  "
                >

                  <FilterSelect
                    label="Experience level"
                    value={
                      levelFilter
                    }
                    onChange={
                      setLevelFilter
                    }
                    options={
                      LEVELS
                    }
                  />


                  <FilterSelect
                    label="Performance"
                    value={
                      scoreFilter
                    }
                    onChange={
                      setScoreFilter
                    }
                    options={
                      SCORE_FILTERS
                    }
                  />


                  <FilterSelect
                    label="Sort sessions"
                    value={
                      sortBy
                    }
                    onChange={(
                      value
                    ) =>
                      setSortBy(
                        value as SortOption
                      )
                    }
                    options={[
                      "newest",
                      "oldest",
                      "highest",
                      "lowest",
                    ]}
                    displayValue={(
                      value
                    ) => {

                      const labels:
                        Record<
                          SortOption,
                          string
                        > = {
                          newest:
                            "Newest first",
                          oldest:
                            "Oldest first",
                          highest:
                            "Highest score",
                          lowest:
                            "Lowest score",
                        };

                      return labels[
                        value as SortOption
                      ];
                    }}
                  />

                </div>


                <div
                  className="
                    mt-4
                    flex
                    justify-end
                  "
                >

                  <button
                    onClick={
                      clearFilters
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-medium
                      text-slate-500
                      transition
                      hover:text-cyan-300
                    "
                  >
                    <RotateCcw
                      size={13}
                    />

                    Reset filters
                  </button>

                </div>

              </motion.div>

            )}

          </AnimatePresence>

        </div>


        {/* =======================================
            LOADING
            ======================================= */}

        {loading ? (

          <div
            className="
              grid
              grid-cols-1
              gap-4
              p-5
              lg:grid-cols-2
              xl:grid-cols-3
              md:p-6
            "
          >

            {[
              1,
              2,
              3,
              4,
              5,
              6,
            ].map(
              (item) => (

                <div
                  key={item}
                  className="
                    h-[260px]
                    animate-pulse
                    rounded-3xl
                    border
                    border-white/[0.05]
                    bg-white/[0.015]
                  "
                />

              )
            )}

          </div>

        ) : filteredSessions.length > 0 ? (

          <div
            className="
              grid
              grid-cols-1
              gap-4
              p-5
              lg:grid-cols-2
              xl:grid-cols-3
              md:p-6
            "
          >

            {filteredSessions.map(
              (
                session,
                index
              ) => (

                <SessionCard
                  key={
                    session.id
                  }
                  session={
                    session
                  }
                  index={
                    index
                  }
                  onOpen={() =>
                    setSelectedSession(
                      session
                    )
                  }
                  onPlayback={() =>
                    openPlayback(
                      session
                    )
                  }
                />

              )
            )}

          </div>

        ) : (

          <EmptyHistory
            hasFilters={
              Boolean(
                search
              ) ||
              levelFilter !==
                "All levels" ||
              scoreFilter !==
                "All scores"
            }
            onReset={
              clearFilters
            }
            onStart={
              startNewInterview
            }
          />

        )}

      </section>


      {/* =========================================
          SESSION MODAL
          ========================================= */}

      <AnimatePresence>

        {selectedSession && (

          <SessionModal
            session={
              selectedSession
            }
            onClose={() =>
              setSelectedSession(
                null
              )
            }
            onPlayback={() =>
              openPlayback(
                selectedSession
              )
            }
          />

        )}

      </AnimatePresence>

    </div>
  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  tone:
    | "violet"
    | "cyan"
    | "amber"
    | "emerald";
}) {

  const toneClasses = {
    violet:
      "border-violet-400/15 bg-violet-500/[0.06] text-violet-300",

    cyan:
      "border-cyan-400/15 bg-cyan-500/[0.06] text-cyan-300",

    amber:
      "border-amber-400/15 bg-amber-500/[0.06] text-amber-300",

    emerald:
      "border-emerald-400/15 bg-emerald-500/[0.06] text-emerald-300",
  };


  return (

    <motion.div
      whileHover={{
        y: -2,
      }}
      className="
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#0b0c13]/80
        p-5
        transition
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
            ${
              toneClasses[
                tone
              ]
            }
          `}
        >
          {icon}
        </div>


        <TrendingUp
          size={14}
          className="
            text-slate-700
          "
        />

      </div>


      <p
        className="
          mt-5
          text-[11px]
          font-medium
          text-slate-500
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1
          text-3xl
          font-semibold
          tracking-tight
          text-slate-100
        "
      >
        {value}
      </p>


      <p
        className="
          mt-2
          text-xs
          text-slate-600
        "
      >
        {description}
      </p>

    </motion.div>
  );
}


/* =========================================================
   FILTER SELECT
   ========================================================= */

function FilterSelect({
  label,
  value,
  onChange,
  options,
  displayValue,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: string[];
  displayValue?: (
    value: string
  ) => string;
}) {

  return (

    <div>

      <label
        className="
          mb-2
          block
          text-[10px]
          font-bold
          uppercase
          tracking-[0.18em]
          text-slate-600
        "
      >
        {label}
      </label>


      <select
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="
          h-11
          w-full
          cursor-pointer
          appearance-none
          rounded-xl
          border
          border-white/[0.07]
          bg-[#0d0f17]
          px-4
          text-sm
          text-slate-300
          outline-none
          transition
          focus:border-cyan-400/25
        "
      >
        {options.map(
          (option) => (

            <option
              key={option}
              value={option}
            >
              {
                displayValue
                  ? displayValue(
                      option
                    )
                  : option
              }
            </option>

          )
        )}
      </select>

    </div>
  );
}


/* =========================================================
   SESSION CARD
   ========================================================= */

function SessionCard({
  session,
  index,
  onOpen,
  onPlayback,
}: {
  session: NormalizedSession;
  index: number;
  onOpen: () => void;
  onPlayback: () => void;
}) {

  const theme =
    getScoreTheme(
      session.score
    );


  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay:
          Math.min(
            index * 0.04,
            0.3
          ),
      }}
      whileHover={{
        y: -3,
      }}
      className={`
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/[0.07]
        bg-[#0d0f17]/75
        p-5
        transition-all
        hover:border-white/[0.12]
        ${theme.glow}
      `}
    >

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-44
          w-44
          rounded-full
          bg-violet-500/[0.05]
          blur-[60px]
          transition-opacity
          duration-500
          group-hover:opacity-100
        "
      />


      <div
        className="
          relative
          flex
          items-start
          justify-between
          gap-4
        "
      >

        <div
          className="
            min-w-0
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-cyan-300/60
            "
          >
            <CalendarDays
              size={12}
            />

            {session.date}
          </div>


          <h3
            className="
              mt-3
              truncate
              text-lg
              font-semibold
              text-slate-100
            "
          >
            {session.role}
          </h3>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            {session.level}
          </p>

        </div>


        <div
          className={`
            flex
            h-14
            w-14
            shrink-0
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            ${theme.border}
            ${theme.background}
          `}
        >

          <span
            className={`
              text-lg
              font-bold
              ${theme.text}
            `}
          >
            {session.score}%
          </span>

        </div>

      </div>


      <div
        className="
          relative
          mt-5
          grid
          grid-cols-3
          gap-2
        "
      >

        <Metric
          label="Technical"
          value={
            session.technical
          }
        />

        <Metric
          label="Communication"
          value={
            session.communication
          }
        />

        <Metric
          label="Confidence"
          value={
            session.confidence
          }
        />

      </div>


      <div
        className="
          relative
          mt-5
          flex
          items-center
          justify-between
          gap-3
          border-t
          border-white/[0.06]
          pt-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-4
            text-xs
            text-slate-600
          "
        >

          <span
            className="
              inline-flex
              items-center
              gap-1.5
            "
          >
            <Clock3
              size={13}
            />

            {session.duration}
          </span>


          <span
            className="
              inline-flex
              items-center
              gap-1.5
            "
          >
            <FileSearch
              size={13}
            />

            {
              session.questionsCount ||
              "—"
            }{" "}
            Q
          </span>

        </div>


        <span
          className={`
            text-xs
            font-medium
            ${theme.text}
          `}
        >
          {theme.label}
        </span>

      </div>


      <div
        className="
          relative
          mt-5
          grid
          grid-cols-2
          gap-3
        "
      >

        <button
          onClick={
            onOpen
          }
          className="
            h-10
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.02]
            text-sm
            font-medium
            text-slate-400
            transition
            hover:border-white/[0.12]
            hover:text-white
          "
        >
          View details
        </button>


        <button
          onClick={
            onPlayback
          }
          className="
            group/button
            flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-violet-600
            to-cyan-500
            text-sm
            font-semibold
            text-white
            transition
            hover:brightness-110
          "
        >
          <Play
            size={14}
            fill="currentColor"
          />

          Playback

        </button>

      </div>

    </motion.div>
  );
}


/* =========================================================
   METRIC
   ========================================================= */

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (

    <div
      className="
        rounded-xl
        border
        border-white/[0.05]
        bg-black/15
        px-3
        py-3
      "
    >

      <p
        className="
          truncate
          text-[10px]
          text-slate-600
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1
          text-sm
          font-semibold
          text-slate-300
        "
      >
        {
          value > 0
            ? `${value}%`
            : "—"
        }
      </p>

    </div>
  );
}


/* =========================================================
   EMPTY HISTORY
   ========================================================= */

function EmptyHistory({
  hasFilters,
  onReset,
  onStart,
}: {
  hasFilters: boolean;
  onReset: () => void;
  onStart: () => void;
}) {

  return (

    <div
      className="
        flex
        min-h-[420px]
        flex-col
        items-center
        justify-center
        px-6
        py-16
        text-center
      "
    >

      <div
        className="
          relative
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-3xl
          border
          border-violet-400/15
          bg-violet-500/[0.06]
          text-violet-300
        "
      >

        <div
          className="
            absolute
            inset-0
            animate-ping
            rounded-3xl
            border
            border-violet-400/10
          "
        />

        <HistoryIcon
          size={30}
        />

      </div>


      <h3
        className="
          mt-7
          text-xl
          font-semibold
          text-slate-100
        "
      >
        {
          hasFilters
            ? "No sessions match these filters"
            : "Your interview archive is waiting"
        }
      </h3>


      <p
        className="
          mt-3
          max-w-md
          text-sm
          leading-6
          text-slate-500
        "
      >
        {
          hasFilters
            ? "Adjust your search or reset the filters to view other interview sessions."
            : "Complete your first AI interview and your performance history will appear here."
        }
      </p>


      <div
        className="
          mt-7
          flex
          flex-wrap
          justify-center
          gap-3
        "
      >

        {hasFilters ? (

          <button
            onClick={
              onReset
            }
            className="
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.08]
              px-5
              text-sm
              font-medium
              text-slate-300
              transition
              hover:text-white
            "
          >
            <RotateCcw
              size={15}
            />

            Reset filters
          </button>

        ) : (

          <button
            onClick={
              onStart
            }
            className="
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              px-5
              text-sm
              font-semibold
              text-white
              shadow-[0_12px_40px_rgba(124,58,237,0.2)]
            "
          >
            <Play
              size={15}
              fill="currentColor"
            />

            Start your first interview
          </button>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   SESSION MODAL
   ========================================================= */

function SessionModal({
  session,
  onClose,
  onPlayback,
}: {
  session: NormalizedSession;
  onClose: () => void;
  onPlayback: () => void;
}) {

  const theme =
    getScoreTheme(
      session.score
    );


  return (

    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/70
        p-4
        backdrop-blur-md
      "
      onMouseDown={(
        event
      ) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 16,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 16,
        }}
        transition={{
          type: "spring",
          damping: 24,
          stiffness: 240,
        }}
        className="
          w-full
          max-w-2xl
          overflow-hidden
          rounded-[30px]
          border
          border-white/[0.09]
          bg-[#0b0d14]
          shadow-[0_40px_140px_rgba(0,0,0,0.55)]
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-white/[0.06]
            px-6
            py-6
          "
        >

          <div>

            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.24em]
                text-cyan-300/70
              "
            >
              Session intelligence
            </div>


            <h2
              className="
                mt-2
                text-2xl
                font-semibold
                text-slate-100
              "
            >
              {session.role}
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {session.level} ·{" "}
              {session.date}
            </p>

          </div>


          <button
            onClick={
              onClose
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.07]
              text-slate-500
              transition
              hover:bg-white/[0.04]
              hover:text-white
            "
          >
            <X
              size={18}
            />
          </button>

        </div>


        <div
          className="
            p-6
          "
        >

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-[160px_1fr]
            "
          >

            <div
              className={`
                flex
                min-h-[160px]
                flex-col
                items-center
                justify-center
                rounded-3xl
                border
                ${theme.border}
                ${theme.background}
              `}
            >

              <p
                className={`
                  text-4xl
                  font-bold
                  ${theme.text}
                `}
              >
                {session.score}%
              </p>


              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Overall score
              </p>

            </div>


            <div
              className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-3
              "
            >

              <DetailMetric
                label="Technical"
                value={
                  session.technical
                }
                icon={
                  <Brain
                    size={16}
                  />
                }
              />

              <DetailMetric
                label="Communication"
                value={
                  session.communication
                }
                icon={
                  <TrendingUp
                    size={16}
                  />
                }
              />

              <DetailMetric
                label="Confidence"
                value={
                  session.confidence
                }
                icon={
                  <Target
                    size={16}
                  />
                }
              />

            </div>

          </div>


          <div
            className="
              mt-5
              grid
              grid-cols-2
              gap-3
            "
          >

            <InfoTile
              label="Session duration"
              value={
                session.duration
              }
              icon={
                <Clock3
                  size={16}
                />
              }
            />

            <InfoTile
              label="Questions completed"
              value={
                session.questionsCount > 0
                  ? String(
                      session.questionsCount
                    )
                  : "—"
              }
              icon={
                <FileSearch
                  size={16}
                />
              }
            />

          </div>


          <div
            className="
              mt-6
              rounded-2xl
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
                gap-2
              "
            >

              <Sparkles
                size={16}
                className="
                  text-violet-300
                "
              />

              <h3
                className="
                  text-sm
                  font-semibold
                  text-slate-200
                "
              >
                Performance snapshot
              </h3>

            </div>


            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500
              "
            >
              This session can be replayed
              to review the interview flow,
              responses, and recorded
              performance data.
              Full AI-generated insights
              will become richer once the
              backend history and report
              pipeline are fully connected.
            </p>

          </div>

        </div>


        <div
          className="
            flex
            flex-col-reverse
            gap-3
            border-t
            border-white/[0.06]
            px-6
            py-5
            sm:flex-row
            sm:justify-end
          "
        >

          <button
            onClick={
              onClose
            }
            className="
              h-11
              rounded-xl
              border
              border-white/[0.07]
              px-5
              text-sm
              font-medium
              text-slate-400
              transition
              hover:text-white
            "
          >
            Close
          </button>


          <button
            onClick={
              onPlayback
            }
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              px-5
              text-sm
              font-semibold
              text-white
              shadow-[0_12px_40px_rgba(124,58,237,0.22)]
            "
          >
            <Play
              size={15}
              fill="currentColor"
            />

            Open playback
          </button>

        </div>

      </motion.div>

    </motion.div>
  );
}


/* =========================================================
   DETAIL METRIC
   ========================================================= */

function DetailMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-black/15
        p-4
      "
    >

      <div
        className="
          text-cyan-300/70
        "
      >
        {icon}
      </div>


      <p
        className="
          mt-4
          text-[11px]
          text-slate-600
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1
          text-xl
          font-semibold
          text-slate-200
        "
      >
        {
          value > 0
            ? `${value}%`
            : "—"
        }
      </p>

    </div>
  );
}


/* =========================================================
   INFO TILE
   ========================================================= */

function InfoTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.015]
        p-4
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
          text-slate-600
        "
      >
        {icon}

        <span
          className="
            text-[11px]
          "
        >
          {label}
        </span>

      </div>


      <p
        className="
          mt-3
          text-lg
          font-semibold
          text-slate-200
        "
      >
        {value}
      </p>

    </div>
  );
}


export default History;