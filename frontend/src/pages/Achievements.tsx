import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  BadgeCheck,
  Brain,
  CheckCircle2,
  CircleGauge,
  Crown,
  Flame,
  LoaderCircle,
  LockKeyhole,
  Medal,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import {
  getAchievements,
} from "../services/api";


type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  progressText: string;
  category: string;
  icon: typeof Trophy;
  tone:
    | "violet"
    | "cyan"
    | "emerald"
    | "amber"
    | "rose";
};


type AchievementState = AchievementDefinition & {
  unlocked: boolean;
  raw?: Record<string, unknown>;
};


const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    id: "first-interview",
    title: "First Interview",
    description:
      "Complete your first Hagrid's Hut interview session and receive a full performance evaluation.",
    progressText:
      "Complete 1 interview",
    category:
      "Foundation",
    icon:
      Trophy,
    tone:
      "violet",
  },
  {
    id: "practice-warrior",
    title: "Practice Warrior",
    description:
      "Build consistent preparation momentum through repeated AI interview practice.",
    progressText:
      "Complete multiple practice sessions",
    category:
      "Consistency",
    icon:
      Flame,
    tone:
      "amber",
  },
  {
    id: "strong-candidate",
    title: "Strong Candidate",
    description:
      "Demonstrate strong interview performance across technical, communication, and confidence signals.",
    progressText:
      "Reach the strong candidate threshold",
    category:
      "Performance",
    icon:
      Target,
    tone:
      "cyan",
  },
  {
    id: "interview-master",
    title: "Interview Master",
    description:
      "Achieve consistently high performance and show mastery across the Hagrid's Hut interview intelligence system.",
    progressText:
      "Reach the mastery benchmark",
    category:
      "Mastery",
    icon:
      Crown,
    tone:
      "rose",
  },
  {
    id: "high-potential",
    title: "High Potential",
    description:
      "Earn a high-confidence recommendation from the Hagrid's Hut candidate intelligence engine.",
    progressText:
      "Receive an AI recommendation",
    category:
      "Intelligence",
    icon:
      Brain,
    tone:
      "violet",
  },
  {
    id: "precision-communicator",
    title: "Precision Communicator",
    description:
      "Maintain clear, structured, and confident communication throughout a complete interview.",
    progressText:
      "Improve communication quality",
    category:
      "Communication",
    icon:
      BadgeCheck,
    tone:
      "emerald",
  },
  {
    id: "elite-score",
    title: "Elite Score",
    description:
      "Reach an exceptional interview score and establish a new personal performance benchmark.",
    progressText:
      "Reach the elite score threshold",
    category:
      "Performance",
    icon:
      CircleGauge,
    tone:
      "cyan",
  },
  {
    id: "career-ready",
    title: "Career Ready",
    description:
      "Complete the core Hagrid's Hut preparation journey and demonstrate readiness for professional interviews.",
    progressText:
      "Complete the career readiness journey",
    category:
      "Milestone",
    icon:
      ShieldCheck,
    tone:
      "emerald",
  },
];


function normalizeTitle(
  value: unknown
) {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

}


function AchievementCard({
  achievement,
  index,
}: {
  achievement: AchievementState;
  index: number;
}) {

  const Icon =
    achievement.icon;


  const toneMap = {
    violet: {
      icon:
        "border-violet-400/20 bg-violet-500/[0.10] text-violet-300",
      glow:
        "bg-violet-500/[0.10]",
      label:
        "text-violet-300",
      border:
        "border-violet-400/15",
    },
    cyan: {
      icon:
        "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300",
      glow:
        "bg-cyan-400/[0.09]",
      label:
        "text-cyan-300",
      border:
        "border-cyan-400/15",
    },
    emerald: {
      icon:
        "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
      glow:
        "bg-emerald-400/[0.09]",
      label:
        "text-emerald-300",
      border:
        "border-emerald-400/15",
    },
    amber: {
      icon:
        "border-amber-400/20 bg-amber-400/[0.08] text-amber-300",
      glow:
        "bg-amber-400/[0.09]",
      label:
        "text-amber-300",
      border:
        "border-amber-400/15",
    },
    rose: {
      icon:
        "border-fuchsia-400/20 bg-fuchsia-400/[0.08] text-fuchsia-300",
      glow:
        "bg-fuchsia-400/[0.09]",
      label:
        "text-fuchsia-300",
      border:
        "border-fuchsia-400/15",
    },
  };


  const tone =
    toneMap[
      achievement.tone
    ];


  return (

    <article
      className={`
        group
        relative
        overflow-hidden
        rounded-[24px]
        border
        ${achievement.unlocked
          ? `${tone.border} bg-white/[0.028]`
          : "border-white/[0.055] bg-white/[0.015]"
        }
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-white/[0.10]
        hover:bg-white/[0.04]
      `}
    >

      <div
        className={`
          pointer-events-none
          absolute
          -right-10
          -top-12
          h-32
          w-32
          rounded-full
          blur-3xl
          ${achievement.unlocked
            ? tone.glow
            : "bg-white/[0.025]"
          }
        `}
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
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            ${
              achievement.unlocked
                ? tone.icon
                : `
                  border-white/[0.06]
                  bg-white/[0.025]
                  text-slate-700
                `
            }
          `}
        >

          {achievement.unlocked ? (

            <Icon
              size={22}
            />

          ) : (

            <LockKeyhole
              size={20}
            />

          )}

        </div>


        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className="
              hidden
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-700
              sm:inline
            "
          >
            #{String(index + 1).padStart(2, "0")}

          </span>


          {achievement.unlocked ? (

            <span
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                ${tone.border}
                bg-white/[0.025]
                px-2.5
                py-1
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.12em]
                ${tone.label}
              `}
            >

              <CheckCircle2
                size={11}
              />

              Unlocked

            </span>

          ) : (

            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-white/[0.055]
                bg-white/[0.02]
                px-2.5
                py-1
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-slate-600
              "
            >

              <LockKeyhole
                size={10}
              />

              Locked

            </span>

          )}

        </div>

      </div>


      <div
        className="
          relative
          mt-7
        "
      >

        <span
          className={`
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.16em]
            ${
              achievement.unlocked
                ? tone.label
                : "text-slate-700"
            }
          `}
        >
          {achievement.category}

        </span>


        <h2
          className={`
            mt-3
            text-xl
            font-semibold
            tracking-tight
            ${
              achievement.unlocked
                ? "text-white"
                : "text-slate-500"
            }
          `}
        >
          {achievement.title}

        </h2>


        <p
          className={`
            mt-2
            min-h-[60px]
            text-sm
            leading-6
            ${
              achievement.unlocked
                ? "text-slate-500"
                : "text-slate-700"
            }
          `}
        >
          {achievement.description}

        </p>

      </div>


      <div
        className="
          relative
          mt-6
          flex
          items-center
          justify-between
          gap-4
          border-t
          border-white/[0.05]
          pt-4
        "
      >

        <span
          className="
            text-[10px]
            text-slate-600
          "
        >
          {achievement.unlocked
            ? "Milestone verified"
            : achievement.progressText
          }

        </span>


        {achievement.unlocked ? (

          <Sparkles
            size={15}
            className={tone.label}
          />

        ) : (

          <Star
            size={14}
            className="
              text-slate-800
            "
          />

        )}

      </div>

    </article>

  );

}


function Achievements() {

  const [
    rawAchievements,
    setRawAchievements,
  ] = useState<unknown[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  async function loadAchievements(
    isRefresh = false
  ) {

    try {

      setError("");

      if (isRefresh) {

        setRefreshing(true);

      } else {

        setLoading(true);

      }


      const data =
        await getAchievements();


      if (
        Array.isArray(data)
      ) {

        setRawAchievements(
          data
        );

      } else if (
        Array.isArray(
          (
            data as Record<string, unknown>
          )?.achievements
        )
      ) {

        setRawAchievements(
          (
            data as Record<string, unknown>
          ).achievements as unknown[]
        );

      } else {

        setRawAchievements(
          []
        );

      }

    } catch (requestError) {

      console.error(
        "Achievements loading error:",
        requestError
      );


      setError(
        "Achievement intelligence could not be synchronized right now."
      );

      setRawAchievements(
        []
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }


  useEffect(() => {

    loadAchievements();

  }, []);


  const achievements =
    useMemo(
      () => {

        const unlockedTitles =
          new Set(
            rawAchievements.map(
              (
                item
              ) => {

                if (
                  typeof item ===
                  "string"
                ) {
                  return normalizeTitle(
                    item
                  );
                }


                if (
                  item &&
                  typeof item ===
                  "object"
                ) {

                  const record =
                    item as Record<
                      string,
                      unknown
                    >;


                  return normalizeTitle(
                    record.title ??
                    record.name
                  );

                }


                return "";

              }
            )
          );


        return ACHIEVEMENT_CATALOG.map(
          (
            achievement
          ) => {

            const unlocked =
              unlockedTitles.has(
                normalizeTitle(
                  achievement.title
                )
              );


            const raw =
              rawAchievements.find(
                (
                  item
                ) => {

                  if (
                    typeof item ===
                    "string"
                  ) {

                    return (
                      normalizeTitle(
                        item
                      ) ===
                      normalizeTitle(
                        achievement.title
                      )
                    );

                  }


                  if (
                    item &&
                    typeof item ===
                    "object"
                  ) {

                    const record =
                      item as Record<
                        string,
                        unknown
                      >;


                    return (
                      normalizeTitle(
                        record.title ??
                        record.name
                      ) ===
                      normalizeTitle(
                        achievement.title
                      )
                    );

                  }


                  return false;

                }
              );


            return {
              ...achievement,
              unlocked,
              raw:
                raw &&
                typeof raw ===
                  "object"
                  ? raw as Record<
                      string,
                      unknown
                    >
                  : undefined,
            };

          }
        );

      },
      [
        rawAchievements,
      ]
    );


  const unlockedCount =
    achievements.filter(
      (
        achievement
      ) =>
        achievement.unlocked
    ).length;


  const progress =
    achievements.length > 0
      ? Math.round(
          (
            unlockedCount /
            achievements.length
          ) * 100
        )
      : 0;


  if (loading) {

    return (

      <div
        className="
          flex
          min-h-[72vh]
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
            rounded-[28px]
            border
            border-violet-400/15
            bg-violet-500/[0.06]
            shadow-[0_0_60px_rgba(139,92,246,0.10)]
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
            Synchronizing achievements

          </p>

          <p
            className="
              mt-2
              text-xs
              text-slate-600
            "
          >
            Mapping your verified interview milestones...

          </p>

        </div>

      </div>

    );

  }


  return (

    <div
      className="
        min-h-full
        px-4
        py-5
        pb-12
        md:px-6
        lg:px-8
        xl:px-10
      "
    >

      <div
        className="
          mx-auto
          max-w-[1500px]
        "
      >

        {/* =================================================
            HERO
            ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.07]
            bg-[#0b0f19]/75
            px-5
            py-7
            backdrop-blur-xl
            md:px-8
            md:py-9
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
              bottom-[-150px]
              left-[25%]
              h-72
              w-72
              rounded-full
              bg-cyan-400/[0.06]
              blur-[110px]
            "
          />


          <div
            className="
              relative
              flex
              flex-col
              gap-8
              xl:flex-row
              xl:items-end
              xl:justify-between
            "
          >

            <div
              className="
                max-w-3xl
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.24em]
                  text-violet-300
                "
              >

                <Award
                  size={13}
                />

                Progress Intelligence

              </div>


              <h1
                className="
                  mt-4
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-white
                  md:text-5xl
                "
              >
                Achievements earned through
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
                  real progress.
                </span>

              </h1>


              <p
                className="
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-500
                "
              >
                Your HireSense milestones are tied to actual interview
                activity and performance signals. No decorative trophy
                spam, just a record of the work you have genuinely done.

              </p>

            </div>


            <div
              className="
                grid
                w-full
                gap-3
                sm:grid-cols-3
                xl:w-[520px]
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-violet-400/15
                  bg-violet-500/[0.055]
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <Trophy
                    size={17}
                    className="
                      text-violet-300
                    "
                  />

                  <span
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.14em]
                      text-slate-700
                    "
                  >
                    Unlocked

                  </span>

                </div>

                <p
                  className="
                    mt-5
                    text-3xl
                    font-semibold
                    text-white
                  "
                >
                  {unlockedCount}

                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  Verified milestones

                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-cyan-400/15
                  bg-cyan-400/[0.045]
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <Target
                    size={17}
                    className="
                      text-cyan-300
                    "
                  />

                  <span
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.14em]
                      text-slate-700
                    "
                  >
                    Progress

                  </span>

                </div>

                <p
                  className="
                    mt-5
                    text-3xl
                    font-semibold
                    text-white
                  "
                >
                  {progress}%

                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  Journey completed

                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-emerald-400/15
                  bg-emerald-400/[0.045]
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <Medal
                    size={17}
                    className="
                      text-emerald-300
                    "
                  />

                  <span
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.14em]
                      text-slate-700
                    "
                  >
                    Available

                  </span>

                </div>

                <p
                  className="
                    mt-5
                    text-3xl
                    font-semibold
                    text-white
                  "
                >
                  {achievements.length}

                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  Intelligence milestones

                </p>

              </div>

            </div>

          </div>


          <div
            className="
              relative
              mt-8
              h-2
              overflow-hidden
              rounded-full
              bg-white/[0.045]
            "
          >

            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-violet-500
                via-cyan-400
                to-emerald-400
                transition-all
                duration-700
              "
              style={{
                width:
                  `${Math.max(
                    progress,
                    unlockedCount > 0
                      ? 5
                      : 0
                  )}%`,
              }}
            />

          </div>

        </section>


        {/* =================================================
            TOOLBAR
            ================================================= */}

        <div
          className="
            mt-8
            flex
            flex-col
            gap-4
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
                text-cyan-300
              "
            >

              <Sparkles
                size={13}
              />

              Milestone Library

            </div>


            <h2
              className="
                mt-2
                text-2xl
                font-semibold
                tracking-tight
                text-white
              "
            >
              Your achievement journey

            </h2>

          </div>


          <button
            onClick={() =>
              loadAchievements(
                true
              )
            }
            disabled={refreshing}
            className="
              inline-flex
              h-11
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-4
              text-xs
              font-medium
              text-slate-400
              transition
              hover:border-violet-400/20
              hover:bg-violet-500/[0.06]
              hover:text-violet-200
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {
              refreshing
                ? "Synchronizing"
                : "Refresh progress"
            }

          </button>

        </div>


        {error && (

          <div
            className="
              mt-5
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-amber-400/15
              bg-amber-400/[0.045]
              p-4
            "
          >

            <Zap
              size={17}
              className="
                mt-0.5
                shrink-0
                text-amber-300
              "
            />

            <p
              className="
                text-xs
                leading-6
                text-slate-500
              "
            >
              {error}
              {" "}
              The milestone library is still visible, but locked status
              may not reflect the latest backend data.

            </p>

          </div>

        )}


        {/* =================================================
            ACHIEVEMENT GRID
            ================================================= */}

        <section
          className="
            mt-6
            grid
            gap-5
            md:grid-cols-2
            xl:grid-cols-4
          "
        >

          {
            achievements.map(
              (
                achievement,
                index
              ) => (

                <AchievementCard
                  key={
                    achievement.id
                  }
                  achievement={
                    achievement
                  }
                  index={
                    index
                  }
                />

              )
            )
          }

        </section>


        {/* =================================================
            FOOTER SIGNAL
            ================================================= */}

        <section
          className="
            mt-8
            rounded-2xl
            border
            border-white/[0.055]
            bg-white/[0.018]
            p-5
          "
        >

          <div
            className="
              flex
              flex-col
              gap-4
              md:flex-row
              md:items-center
              md:justify-between
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
                  bg-cyan-400/[0.045]
                "
              >

                <TrendingUp
                  size={18}
                  className="
                    text-cyan-300
                  "
                />

              </div>


              <div>

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-300
                  "
                >
                  Keep building verified progress

                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  Achievements unlock automatically as your interview
                  intelligence evolves.

                </p>

              </div>

            </div>


            <div
              className="
                inline-flex
                items-center
                gap-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-slate-600
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

              Achievement engine active

            </div>

          </div>

        </section>

      </div>

    </div>

  );

}


export default Achievements;