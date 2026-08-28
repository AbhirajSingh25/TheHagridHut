import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  Brain,
  ChevronDown,
  ChevronUp,
  Crown,
  LoaderCircle,
  Medal,
  Minus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";

import {
  getLeaderboard,
} from "../services/api";


type LeaderboardCandidate = {
  id: string;
  rank: number;
  name: string;
  role: string;
  score: number;
  trend: number;
  interviews: number;
  tier: string;
  skills: string[];
  isCurrentUser?: boolean;
};


type RawCandidate = {
  id?: string | number;
  candidate?: string;
  name?: string;
  username?: string;
  role?: string;
  target_role?: string;
  score?: number;
  candidate_score?: number;
  overall_score?: number;
  trend?: number;
  improvement?: number;
  interviews?: number;
  interview_count?: number;
  skills?: string[];
};


const fallbackCandidates: LeaderboardCandidate[] = [
  {
    id: "1",
    rank: 1,
    name: "Arjun Mehta",
    role: "Software Engineer",
    score: 96,
    trend: 4,
    interviews: 18,
    tier: "Elite",
    skills: ["System Design", "React", "Python"],
  },
  {
    id: "2",
    rank: 2,
    name: "Priya Sharma",
    role: "Data Scientist",
    score: 94,
    trend: 7,
    interviews: 16,
    tier: "Elite",
    skills: ["Machine Learning", "SQL", "Python"],
  },
  {
    id: "3",
    rank: 3,
    name: "Rohan Kapoor",
    role: "Product Analyst",
    score: 91,
    trend: 2,
    interviews: 14,
    tier: "Expert",
    skills: ["Analytics", "SQL", "Strategy"],
  },
  {
    id: "4",
    rank: 4,
    name: "Candidate",
    role: "AI & Software Engineer",
    score: 89,
    trend: 14,
    interviews: 12,
    tier: "Expert",
    skills: ["AI/ML", "Java", "Problem Solving"],
    isCurrentUser: true,
  },
  {
    id: "5",
    rank: 5,
    name: "Ananya Verma",
    role: "Backend Engineer",
    score: 87,
    trend: 5,
    interviews: 11,
    tier: "Advanced",
    skills: ["Java", "Spring Boot", "SQL"],
  },
  {
    id: "6",
    rank: 6,
    name: "Kabir Malhotra",
    role: "Cybersecurity Analyst",
    score: 85,
    trend: -1,
    interviews: 10,
    tier: "Advanced",
    skills: ["SIEM", "Threat Intelligence", "Security"],
  },
  {
    id: "7",
    rank: 7,
    name: "Ishita Rao",
    role: "Frontend Engineer",
    score: 83,
    trend: 3,
    interviews: 9,
    tier: "Advanced",
    skills: ["React", "TypeScript", "UI Engineering"],
  },
  {
    id: "8",
    rank: 8,
    name: "Dev Khanna",
    role: "Data Analyst",
    score: 81,
    trend: 6,
    interviews: 8,
    tier: "Advanced",
    skills: ["SQL", "Power BI", "Python"],
  },
];


function getStoredUser() {

  try {

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(
      storedUser
    );

  } catch {

    return null;

  }
}


function getTier(
  score: number
) {

  if (score >= 95) {
    return "Elite";
  }

  if (score >= 88) {
    return "Expert";
  }

  if (score >= 78) {
    return "Advanced";
  }

  if (score >= 65) {
    return "Rising";
  }

  return "Developing";
}


function getRankTone(
  rank: number
) {

  if (rank === 1) {
    return {
      icon: (
        <Crown
          size={18}
          className="text-amber-300"
        />
      ),
      container: `
        border-amber-400/20
        bg-amber-400/[0.08]
        text-amber-200
        shadow-[0_0_30px_rgba(251,191,36,0.08)]
      `,
    };
  }

  if (rank === 2) {
    return {
      icon: (
        <Medal
          size={18}
          className="text-slate-200"
        />
      ),
      container: `
        border-slate-300/15
        bg-slate-300/[0.06]
        text-slate-100
      `,
    };
  }

  if (rank === 3) {
    return {
      icon: (
        <Award
          size={18}
          className="text-orange-300"
        />
      ),
      container: `
        border-orange-400/20
        bg-orange-400/[0.07]
        text-orange-200
      `,
    };
  }

  return {
    icon: null,
    container: `
      border-white/[0.06]
      bg-white/[0.025]
      text-slate-300
    `,
  };
}


function getTierClasses(
  tier: string
) {

  switch (tier) {

    case "Elite":
      return `
        border-violet-400/20
        bg-violet-500/[0.10]
        text-violet-200
      `;

    case "Expert":
      return `
        border-cyan-400/20
        bg-cyan-400/[0.08]
        text-cyan-200
      `;

    case "Advanced":
      return `
        border-emerald-400/20
        bg-emerald-400/[0.08]
        text-emerald-200
      `;

    case "Rising":
      return `
        border-sky-400/20
        bg-sky-400/[0.08]
        text-sky-200
      `;

    default:
      return `
        border-slate-400/15
        bg-slate-400/[0.06]
        text-slate-300
      `;
  }
}


function Leaderboard() {

  const [
    candidates,
    setCandidates,
  ] = useState<
    LeaderboardCandidate[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("All Roles");

  const [
    period,
    setPeriod,
  ] = useState("Global");

  const [
    showAll,
    setShowAll,
  ] = useState(false);


  const currentUser =
    getStoredUser();


  async function loadLeaderboard(
    isRefresh = false
  ) {

    try {

      if (isRefresh) {

        setRefreshing(true);

      } else {

        setLoading(true);

      }


      const response =
        await getLeaderboard();


      const rawData =
        Array.isArray(response)
          ? response
          : Array.isArray(
              response?.leaderboard
            )
          ? response.leaderboard
          : Array.isArray(
              response?.data
            )
          ? response.data
          : [];


      const mappedCandidates =
        rawData
          .map(
            (
              user: RawCandidate,
              index: number
            ) => {

              const name =
                user.candidate ||
                user.name ||
                user.username ||
                `Candidate ${index + 1}`;


              const score =
                Number(
                  user.score ??
                  user.candidate_score ??
                  user.overall_score ??
                  0
                );


              const isCurrentUser =
                Boolean(
                  currentUser &&
                  (
                    name ===
                      currentUser?.username ||

                    name ===
                      currentUser?.name ||

                    name ===
                      currentUser?.email
                  )
                );


              return {

                id:
                  String(
                    user.id ??
                    `${name}-${index}`
                  ),

                rank:
                  index + 1,

                name,

                role:
                  user.role ||
                  user.target_role ||
                  "Career Candidate",

                score,

                trend:
                  Number(
                    user.trend ??
                    user.improvement ??
                    0
                  ),

                interviews:
                  Number(
                    user.interviews ??
                    user.interview_count ??
                    0
                  ),

                tier:
                  getTier(score),

                skills:
                  Array.isArray(
                    user.skills
                  )
                    ? user.skills.slice(0, 3)
                    : [],

                isCurrentUser,

              };

            }
          )
          .sort(
            (
              a: LeaderboardCandidate,
              b: LeaderboardCandidate
            ) =>
              b.score - a.score
          )
          .map(
            (
              user: LeaderboardCandidate,
              index: number
            ) => ({
              ...user,
              rank:
                index + 1,
            })
          );


      if (
        mappedCandidates.length > 0
      ) {

        setCandidates(
          mappedCandidates
        );

      } else {

        setCandidates(
          fallbackCandidates
        );

      }

    } catch (error) {

      console.error(
        "Leaderboard loading error:",
        error
      );

      setCandidates(
        fallbackCandidates
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }


  useEffect(() => {

    loadLeaderboard();

  }, []);


  const availableRoles =
    useMemo(
      () => {

        const roles =
          candidates.map(
            (
              candidate
            ) =>
              candidate.role
          );


        return [
          "All Roles",
          ...Array.from(
            new Set(roles)
          ),
        ];

      },
      [
        candidates,
      ]
    );


  const filteredCandidates =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        return candidates.filter(
          (
            candidate
          ) => {

            const matchesSearch =
              !query ||
              candidate.name
                .toLowerCase()
                .includes(query) ||
              candidate.role
                .toLowerCase()
                .includes(query) ||
              candidate.skills.some(
                (
                  skill
                ) =>
                  skill
                    .toLowerCase()
                    .includes(query)
              );


            const matchesRole =
              roleFilter ===
                "All Roles" ||
              candidate.role ===
                roleFilter;


            return (
              matchesSearch &&
              matchesRole
            );

          }
        );

      },
      [
        candidates,
        searchQuery,
        roleFilter,
      ]
    );


  const visibleCandidates =
    showAll
      ? filteredCandidates
      : filteredCandidates.slice(
          0,
          6
        );


  const currentCandidate =
    candidates.find(
      (
        candidate
      ) =>
        candidate.isCurrentUser
    ) ||
    candidates[3] ||
    fallbackCandidates[3];


  const topCandidate =
    candidates[0] ||
    fallbackCandidates[0];


  const averageScore =
    candidates.length > 0
      ? Math.round(
          candidates.reduce(
            (
              total,
              candidate
            ) =>
              total +
              candidate.score,
            0
          ) /
          candidates.length
        )
      : 0;


  const topPercent =
    currentCandidate
      ? Math.max(
          1,
          Math.round(
            (
              currentCandidate.rank /
              Math.max(
                candidates.length,
                1
              )
            ) *
            100
          )
        )
      : 0;


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
          PAGE HEADER
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
          badge="GLOBAL PERFORMANCE NETWORK"
          title="Candidate Leaderboard"
          description="
            Benchmark your interview intelligence against high-performing
            candidates and track how your AI career score evolves over time.
          "
        />


        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <button
            onClick={() =>
              loadLeaderboard(true)
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
                  : "transition-transform group-hover:rotate-180"
              }
            />

            {refreshing
              ? "Syncing"
              : "Refresh"}

          </button>


          <div
            className="
              hidden
              h-12
              items-center
              gap-2
              rounded-xl
              border
              border-emerald-400/15
              bg-emerald-400/[0.06]
              px-4
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-emerald-300
              sm:flex
            "
          >

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-400
                shadow-[0_0_12px_rgba(52,211,153,0.9)]
              "
            />

            Live Rankings

          </div>

        </div>

      </div>


      {/* =====================================================
          CURRENT USER SPOTLIGHT
          ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[30px]
          border
          border-violet-400/15
          bg-gradient-to-br
          from-violet-500/[0.10]
          via-[#0a0d17]
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
            -right-20
            -top-24
            h-72
            w-72
            rounded-full
            bg-violet-500/[0.12]
            blur-[100px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-[-160px]
            left-[38%]
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
            xl:grid-cols-[1.15fr_1fr]
            xl:items-center
          "
        >

          <div>

            <div
              className="
                mb-5
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

              Your Competitive Position

            </div>


            <div
              className="
                flex
                flex-col
                gap-5
                sm:flex-row
                sm:items-center
              "
            >

              <div
                className="
                  relative
                  flex
                  h-24
                  w-24
                  shrink-0
                  items-center
                  justify-center
                  rounded-[28px]
                  border
                  border-violet-400/25
                  bg-violet-500/[0.10]
                  shadow-[0_0_45px_rgba(139,92,246,0.10)]
                "
              >

                <div
                  className="
                    text-center
                  "
                >

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.16em]
                      text-violet-300/70
                    "
                  >
                    Rank
                  </p>

                  <p
                    className="
                      mt-1
                      text-3xl
                      font-bold
                      text-white
                    "
                  >
                    #
                    {currentCandidate.rank}
                  </p>

                </div>

              </div>


              <div>

                <h2
                  className="
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-white
                    md:text-3xl
                  "
                >
                  {currentCandidate.name}

                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-400
                  "
                >
                  {currentCandidate.role}

                </p>


                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      ${getTierClasses(
                        currentCandidate.tier
                      )}
                    `}
                  >

                    <ShieldCheck
                      size={14}
                    />

                    {currentCandidate.tier}

                  </span>


                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-emerald-400/15
                      bg-emerald-400/[0.06]
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-emerald-300
                    "
                  >

                    <TrendingUp
                      size={14}
                    />

                    +
                    {Math.abs(
                      currentCandidate.trend
                    )}
                    % this cycle

                  </span>

                </div>

              </div>

            </div>

          </div>


          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-4
              xl:grid-cols-2
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/[0.18]
                p-4
              "
            >

              <Target
                size={17}
                className="
                  mb-3
                  text-cyan-300
                "
              />

              <p
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                {currentCandidate.score}%
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                Career score

              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/[0.18]
                p-4
              "
            >

              <Users
                size={17}
                className="
                  mb-3
                  text-violet-300
                "
              />

              <p
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                Top {topPercent}%
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                Competitive rank

              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/[0.18]
                p-4
              "
            >

              <Brain
                size={17}
                className="
                  mb-3
                  text-emerald-300
                "
              />

              <p
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                {currentCandidate.interviews}
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                Sessions analysed

              </p>

            </div>


            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-black/[0.18]
                p-4
              "
            >

              <Zap
                size={17}
                className="
                  mb-3
                  text-amber-300
                "
              />

              <p
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                +14%
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                Improvement rate

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          INTELLIGENCE STATS
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
              bg-amber-400/[0.06]
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
                Your Rank

              </p>

              <p
                className="
                  mt-3
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                #
                {currentCandidate.rank}
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Across active candidates

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

              <Trophy
                size={20}
                className="
                  text-amber-300
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
                Network Average

              </p>

              <p
                className="
                  mt-3
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                {averageScore}%
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                AI career intelligence

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

              <Users
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
                Your Momentum

              </p>

              <p
                className="
                  mt-3
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-emerald-300
                "
              >
                +
                {Math.abs(
                  currentCandidate.trend
                )}
                %
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Recent performance growth

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

              <TrendingUp
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
                Leading Score

              </p>

              <p
                className="
                  mt-3
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                {topCandidate.score}%
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-500
                "
              >
                Current benchmark

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

              <Sparkles
                size={20}
                className="
                  text-violet-300
                "
              />

            </div>

          </div>

        </Card>

      </section>


      {/* =====================================================
          LEADERBOARD PANEL
          ===================================================== */}

      <Card
        className="
          overflow-hidden
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-6
            border-b
            border-white/[0.06]
            p-6
            lg:p-8
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
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-cyan-300
                "
              >

                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_12px_rgba(34,211,238,0.9)]
                  "
                />

                Global Ranking Engine

              </div>


              <h2
                className="
                  mt-3
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-white
                  md:text-3xl
                "
              >
                AI Candidate Rankings

              </h2>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-slate-500
                "
              >
                Ranked using interview performance, communication
                intelligence, recruiter compatibility, consistency,
                and overall AI career signals.

              </p>

            </div>


            <div
              className="
                flex
                items-center
                gap-3
                text-sm
              "
            >

              <div
                className="
                  flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.025]
                  px-4
                  text-slate-400
                "
              >

                <Users
                  size={16}
                  className="
                    text-slate-500
                  "
                />

                {candidates.length}
                {" "}
                candidates

              </div>

            </div>

          </div>


          {/* CONTROLS */}

          <div
            className="
              flex
              flex-col
              gap-3
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >

            <div
              className="
                flex
                w-full
                flex-col
                gap-3
                xl:w-auto
                xl:flex-row
              "
            >

              <div
                className="
                  relative
                  min-w-0
                  xl:w-[340px]
                "
              >

                <Search
                  size={17}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-600
                  "
                />

                <input
                  value={searchQuery}
                  onChange={
                    (
                      event
                    ) =>
                      setSearchQuery(
                        event.target.value
                      )
                  }
                  placeholder="
                    Search candidates, roles, or skills...
                  "
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-white/[0.025]
                    pl-11
                    pr-4
                    text-sm
                    text-slate-200
                    outline-none
                    transition
                    placeholder:text-slate-700
                    focus:border-violet-400/25
                    focus:bg-violet-400/[0.035]
                  "
                />

              </div>


              <div
                className="
                  relative
                  min-w-[180px]
                "
              >

                <select
                  value={roleFilter}
                  onChange={
                    (
                      event
                    ) =>
                      setRoleFilter(
                        event.target.value
                      )
                  }
                  className="
                    h-11
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-[#0b0d15]
                    px-4
                    pr-10
                    text-sm
                    text-slate-300
                    outline-none
                    transition
                    focus:border-violet-400/25
                  "
                >

                  {
                    availableRoles.map(
                      (
                        role
                      ) => (

                        <option
                          key={role}
                          value={role}
                        >
                          {role}
                        </option>

                      )
                    )
                  }

                </select>

                <ChevronDown
                  size={16}
                  className="
                    pointer-events-none
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-600
                  "
                />

              </div>

            </div>


            <div
              className="
                grid
                grid-cols-3
                rounded-xl
                border
                border-white/[0.06]
                bg-black/[0.12]
                p-1
              "
            >

              {
                [
                  "Global",
                  "Weekly",
                  "Monthly",
                ].map(
                  (
                    option
                  ) => (

                    <button
                      key={option}
                      onClick={() =>
                        setPeriod(option)
                      }
                      className={`
                        h-9
                        rounded-lg
                        px-3
                        text-xs
                        font-medium
                        transition
                        ${
                          period === option
                            ? `
                              bg-white/[0.08]
                              text-white
                              shadow-[0_4px_20px_rgba(0,0,0,0.15)]
                            `
                            : `
                              text-slate-600
                              hover:text-slate-300
                            `
                        }
                      `}
                    >
                      {option}
                    </button>

                  )
                )
              }

            </div>

          </div>

        </div>


        {/* TABLE HEAD */}

        <div
          className="
            hidden
            grid-cols-[90px_minmax(0,1.6fr)_minmax(120px,0.6fr)_minmax(150px,0.65fr)_minmax(110px,0.45fr)]
            gap-6
            border-b
            border-white/[0.05]
            bg-white/[0.015]
            px-8
            py-4
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-slate-700
            lg:grid
          "
        >

          <div>
            Rank
          </div>

          <div>
            Candidate
          </div>

          <div>
            Score
          </div>

          <div>
            Intelligence
          </div>

          <div>
            Trend
          </div>

        </div>


        {/* LOADING */}

        {
          loading && (

            <div
              className="
                flex
                min-h-[420px]
                flex-col
                items-center
                justify-center
                gap-4
              "
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-violet-400/15
                  bg-violet-500/[0.06]
                "
              >

                <LoaderCircle
                  size={28}
                  className="
                    animate-spin
                    text-violet-300
                  "
                />

              </div>

              <div
                className="text-center"
              >

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-300
                  "
                >
                  Building intelligence rankings

                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  Processing candidate performance signals...

                </p>

              </div>

            </div>

          )
        }


        {/* EMPTY */}

        {
          !loading &&
          visibleCandidates.length === 0 && (

            <div
              className="
                flex
                min-h-[320px]
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                "
              >

                <Search
                  size={22}
                  className="
                    text-slate-600
                  "
                />

              </div>

              <h3
                className="
                  mt-5
                  text-lg
                  font-semibold
                  text-slate-200
                "
              >
                No candidates found

              </h3>

              <p
                className="
                  mt-2
                  max-w-sm
                  text-sm
                  leading-relaxed
                  text-slate-500
                "
              >
                Try a different candidate name, role, or skill.
                Humanity survives another empty search field.

              </p>

            </div>

          )
        }


        {/* CANDIDATES */}

        {
          !loading &&
          visibleCandidates.map(
            (
              candidate
            ) => {

              const rankTone =
                getRankTone(
                  candidate.rank
                );


              const progressWidth =
                Math.min(
                  100,
                  Math.max(
                    0,
                    candidate.score
                  )
                );


              return (

                <div
                  key={candidate.id}
                  className={`
                    group
                    relative
                    border-b
                    border-white/[0.045]
                    transition
                    last:border-b-0
                    hover:bg-white/[0.025]
                    ${
                      candidate.isCurrentUser
                        ? `
                          bg-violet-500/[0.045]
                          shadow-[inset_3px_0_0_rgba(139,92,246,0.9)]
                        `
                        : ""
                    }
                  `}
                >

                  <div
                    className="
                      grid
                      gap-5
                      px-5
                      py-5
                      lg:grid-cols-[90px_minmax(0,1.6fr)_minmax(120px,0.6fr)_minmax(150px,0.65fr)_minmax(110px,0.45fr)]
                      lg:items-center
                      lg:gap-6
                      lg:px-8
                    "
                  >

                    {/* RANK */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        lg:justify-start
                      "
                    >

                      <div
                        className={`
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          text-sm
                          font-semibold
                          ${rankTone.container}
                        `}
                      >

                        {
                          rankTone.icon ||
                          `#${candidate.rank}`
                        }

                      </div>


                      <span
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.16em]
                          text-slate-700
                          lg:hidden
                        "
                      >
                        Rank

                      </span>

                    </div>


                    {/* CANDIDATE */}

                    <div
                      className="
                        min-w-0
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-3
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
                            rounded-xl
                            border
                            text-sm
                            font-semibold
                            ${
                              candidate.isCurrentUser
                                ? `
                                  border-violet-400/25
                                  bg-gradient-to-br
                                  from-violet-500
                                  to-fuchsia-500
                                  text-white
                                  shadow-[0_0_22px_rgba(139,92,246,0.18)]
                                `
                                : `
                                  border-white/[0.07]
                                  bg-white/[0.035]
                                  text-slate-300
                                `
                            }
                          `}
                        >

                          {
                            candidate.name
                              .charAt(0)
                              .toUpperCase()
                          }

                        </div>


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
                            "
                          >

                            <p
                              className="
                                truncate
                                text-sm
                                font-semibold
                                text-slate-100
                              "
                            >
                              {candidate.name}

                            </p>


                            {
                              candidate.isCurrentUser && (

                                <span
                                  className="
                                    shrink-0
                                    rounded-full
                                    border
                                    border-violet-400/20
                                    bg-violet-500/[0.10]
                                    px-2
                                    py-0.5
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.12em]
                                    text-violet-200
                                  "
                                >
                                  You
                                </span>

                              )
                            }

                          </div>

                          <p
                            className="
                              mt-1
                              truncate
                              text-xs
                              text-slate-500
                            "
                          >
                            {candidate.role}

                          </p>

                        </div>

                      </div>


                      {
                        candidate.skills.length > 0 && (

                          <div
                            className="
                              mt-3
                              flex
                              flex-wrap
                              gap-1.5
                              lg:hidden
                            "
                          >

                            {
                              candidate.skills.map(
                                (
                                  skill
                                ) => (

                                  <span
                                    key={skill}
                                    className="
                                      rounded-md
                                      border
                                      border-white/[0.05]
                                      bg-white/[0.025]
                                      px-2
                                      py-1
                                      text-[9px]
                                      text-slate-500
                                    "
                                  >
                                    {skill}
                                  </span>

                                )
                              )
                            }

                          </div>

                        )
                      }

                    </div>


                    {/* SCORE */}

                    <div
                      className="
                        lg:block
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >

                        <span
                          className="
                            text-xl
                            font-semibold
                            text-white
                          "
                        >
                          {candidate.score}%

                        </span>

                        <span
                          className="
                            text-[10px]
                            font-medium
                            text-slate-600
                            lg:hidden
                          "
                        >
                          Career Score

                        </span>

                      </div>


                      <div
                        className="
                          mt-2
                          h-1.5
                          overflow-hidden
                          rounded-full
                          bg-white/[0.05]
                        "
                      >

                        <div
                          className="
                            h-full
                            rounded-full
                            bg-gradient-to-r
                            from-violet-400
                            via-cyan-400
                            to-emerald-400
                            shadow-[0_0_10px_rgba(34,211,238,0.35)]
                          "
                          style={{
                            width:
                              `${progressWidth}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* INTELLIGENCE */}

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          px-2.5
                          py-1.5
                          text-[10px]
                          font-semibold
                          ${getTierClasses(
                            candidate.tier
                          )}
                        `}
                      >

                        <ShieldCheck
                          size={13}
                        />

                        {candidate.tier}

                      </span>


                      <span
                        className="
                          hidden
                          items-center
                          gap-1.5
                          text-[10px]
                          text-slate-600
                          xl:inline-flex
                        "
                      >

                        <Brain
                          size={13}
                        />

                        {candidate.interviews} sessions

                      </span>

                    </div>


                    {/* TREND */}

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      {
                        candidate.trend > 0 ? (

                          <TrendingUp
                            size={16}
                            className="
                              text-emerald-300
                            "
                          />

                        ) : candidate.trend < 0 ? (

                          <ChevronDown
                            size={16}
                            className="
                              text-rose-300
                            "
                          />

                        ) : (

                          <Minus
                            size={16}
                            className="
                              text-slate-600
                            "
                          />

                        )
                      }


                      <span
                        className={`
                          text-sm
                          font-medium
                          ${
                            candidate.trend > 0
                              ? "text-emerald-300"
                              : candidate.trend < 0
                              ? "text-rose-300"
                              : "text-slate-500"
                          }
                        `}
                      >
                        {
                          candidate.trend > 0
                            ? "+"
                            : ""
                        }

                        {candidate.trend}%

                      </span>


                      <span
                        className="
                          hidden
                          text-[10px]
                          text-slate-700
                          xl:inline
                        "
                      >
                        vs previous

                      </span>

                    </div>

                  </div>

                </div>

              );

            }
          )
        }


        {/* FOOTER */}

        {
          !loading &&
          filteredCandidates.length > 6 && (

            <div
              className="
                flex
                justify-center
                border-t
                border-white/[0.05]
                p-5
              "
            >

              <button
                onClick={() =>
                  setShowAll(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  px-5
                  text-sm
                  font-medium
                  text-slate-400
                  transition
                  hover:border-violet-400/20
                  hover:bg-violet-500/[0.06]
                  hover:text-violet-100
                "
              >

                {
                  showAll
                    ? "Show less"
                    : `
                      View all
                      ${filteredCandidates.length}
                      candidates
                    `
                }

                {
                  showAll
                    ? (
                      <ChevronUp
                        size={16}
                      />
                    )
                    : (
                      <ChevronDown
                        size={16}
                      />
                    )
                }

              </button>

            </div>

          )
        }

      </Card>


      {/* =====================================================
          SCORING EXPLANATION
          ===================================================== */}

      <section
        className="
          mt-8
          grid
          gap-5
          lg:grid-cols-[1.1fr_0.9fr]
        "
      >

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
              right-0
              top-0
              h-40
              w-40
              rounded-full
              bg-cyan-400/[0.05]
              blur-[70px]
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
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-cyan-400/15
                  bg-cyan-400/[0.06]
                "
              >

                <Brain
                  size={19}
                  className="
                    text-cyan-300
                  "
                />

              </div>


              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-200
                  "
                >
                  How HireSense ranks candidates

                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-600
                  "
                >
                  Multi-signal AI performance model

                </p>

              </div>

            </div>


            <div
              className="
                mt-7
                grid
                gap-4
                sm:grid-cols-2
              "
            >

              {
                [
                  {
                    label:
                      "Interview intelligence",
                    value:
                      "35%",
                    tone:
                      "bg-violet-400",
                  },
                  {
                    label:
                      "Communication quality",
                    value:
                      "25%",
                    tone:
                      "bg-cyan-400",
                  },
                  {
                    label:
                      "Recruiter compatibility",
                    value:
                      "20%",
                    tone:
                      "bg-emerald-400",
                  },
                  {
                    label:
                      "Growth consistency",
                    value:
                      "20%",
                    tone:
                      "bg-amber-400",
                  },
                ].map(
                  (
                    item
                  ) => (

                    <div
                      key={item.label}
                      className="
                        rounded-2xl
                        border
                        border-white/[0.05]
                        bg-white/[0.02]
                        p-4
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

                        <p
                          className="
                            text-xs
                            text-slate-500
                          "
                        >
                          {item.label}

                        </p>

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-200
                          "
                        >
                          {item.value}

                        </p>

                      </div>

                      <div
                        className="
                          mt-3
                          h-1.5
                          overflow-hidden
                          rounded-full
                          bg-white/[0.05]
                        "
                      >

                        <div
                          className={`
                            h-full
                            w-full
                            rounded-full
                            ${item.tone}
                          `}
                        />

                      </div>

                    </div>

                  )
                )
              }

            </div>

          </div>

        </Card>


        <Card
          className="
            p-6
            md:p-8
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
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-violet-400/15
                bg-violet-500/[0.07]
              "
            >

              <Trophy
                size={19}
                className="
                  text-violet-300
                "
              />

            </div>


            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-200
                "
              >
                Next ranking milestone

              </p>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-slate-500
                "
              >
                Increase your AI career score by improving technical
                depth, communication confidence, and interview
                consistency across your next sessions.

              </p>

            </div>

          </div>


          <div
            className="
              mt-7
              rounded-2xl
              border
              border-violet-400/15
              bg-violet-500/[0.05]
              p-5
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

                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-violet-300/70
                  "
                >
                  Current benchmark

                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-semibold
                    text-white
                  "
                >
                  {currentCandidate.score} / 100

                </p>

              </div>


              <div
                className="
                  text-right
                "
              >

                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-slate-600
                  "
                >
                  Top candidate

                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    font-medium
                    text-amber-200
                  "
                >
                  {topCandidate.score} / 100

                </p>

              </div>

            </div>


            <div
              className="
                mt-4
                h-2
                overflow-hidden
                rounded-full
                bg-white/[0.05]
              "
            >

              <div
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-violet-400
                  via-cyan-400
                  to-emerald-400
                "
                style={{
                  width:
                    `${Math.min(
                      100,
                      Math.max(
                        0,
                        currentCandidate.score
                      )
                    )}%`,
                }}
              />

            </div>

          </div>

        </Card>

      </section>

    </div>

  );

}


export default Leaderboard;