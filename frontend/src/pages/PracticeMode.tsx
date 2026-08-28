import { useMemo, useState } from "react";

import {
  Brain,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  Flame,
  Gauge,
  Headphones,
  Lightbulb,
  MessageSquareText,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


type PracticeModeType =
  | "Technical"
  | "Behavioral"
  | "Communication"
  | "Rapid Fire";


type DifficultyType =
  | "Foundation"
  | "Intermediate"
  | "Advanced";


type PracticeModeConfig = {
  title: PracticeModeType;
  description: string;
  detail: string;
  icon: typeof Brain;
  focus: string[];
};


const practiceModes: PracticeModeConfig[] = [
  {
    title: "Technical",
    description:
      "Strengthen technical reasoning through focused interview questions.",
    detail:
      "Practice problem solving, engineering concepts and technical explanations without committing to a full interview session.",
    icon: Code2,
    focus: [
      "Problem Solving",
      "Technical Depth",
      "Structured Answers",
    ],
  },
  {
    title: "Behavioral",
    description:
      "Build stronger stories around real experience and decision making.",
    detail:
      "Train behavioral answers using structured reflection, ownership and impact-driven storytelling.",
    icon: MessageSquareText,
    focus: [
      "STAR Method",
      "Leadership",
      "Decision Making",
    ],
  },
  {
    title: "Communication",
    description:
      "Practice speaking clearly, confidently and with stronger structure.",
    detail:
      "Focus on answer clarity, pacing and confidence before entering a full interview environment.",
    icon: Mic,
    focus: [
      "Clarity",
      "Confidence",
      "Answer Structure",
    ],
  },
  {
    title: "Rapid Fire",
    description:
      "Respond under time pressure with short, adaptive questions.",
    detail:
      "A high-intensity drill designed to test recall, composure and quick decision making.",
    icon: Zap,
    focus: [
      "Speed",
      "Pressure Handling",
      "Quick Thinking",
    ],
  },
];


const difficultyLevels: {
  title: DifficultyType;
  description: string;
  questions: string;
}[] = [
  {
    title: "Foundation",
    description:
      "Build confidence with structured and accessible questions.",
    questions:
      "6 prompts",
  },
  {
    title: "Intermediate",
    description:
      "Balanced challenge with deeper reasoning and follow-ups.",
    questions:
      "10 prompts",
  },
  {
    title: "Advanced",
    description:
      "Complex scenarios designed to expose depth and consistency.",
    questions:
      "14 prompts",
  },
];


const recentDrills = [
  {
    title:
      "Problem Solving",
    mode:
      "Technical",
    score:
      "84%",
    improvement:
      "+6%",
  },
  {
    title:
      "Answer Clarity",
    mode:
      "Communication",
    score:
      "78%",
    improvement:
      "+9%",
  },
  {
    title:
      "Leadership Stories",
    mode:
      "Behavioral",
    score:
      "81%",
    improvement:
      "+4%",
  },
];


function PracticeMode() {
  const navigate =
    useNavigate();

  const [
    selectedMode,
    setSelectedMode,
  ] =
    useState<
      PracticeModeConfig
    >(
      practiceModes[0]
    );

  const [
    selectedDifficulty,
    setSelectedDifficulty,
  ] =
    useState<
      DifficultyType
    >(
      "Intermediate"
    );

  const [
    isStarting,
    setIsStarting,
  ] =
    useState(
      false
    );


  const selectedDifficultyData =
    useMemo(
      () =>
        difficultyLevels.find(
          (
            level
          ) =>
            level.title ===
            selectedDifficulty
        ),
      [
        selectedDifficulty,
      ]
    );


  const ModeIcon =
    selectedMode.icon;


  const startPractice =
    async () => {
      setIsStarting(
        true
      );

      try {
        /*
         * Backend integration will be connected after the
         * frontend is completed.
         *
         * The configuration is stored so the interview engine
         * can consume it without duplicating the practice setup.
         */

        sessionStorage.setItem(
          "hiresense-practice-session",
          JSON.stringify(
            {
              mode:
                selectedMode.title,
              difficulty:
                selectedDifficulty,
              focus:
                selectedMode.focus,
              questionCount:
                selectedDifficultyData?.questions,
            }
          )
        );

        await new Promise(
          (
            resolve
          ) =>
            setTimeout(
              resolve,
              650
            )
        );

        navigate(
          "/live-interview"
        );
      } finally {
        setIsStarting(
          false
        );
      }
    };


  return (
    <div
      className="
        min-h-full
        px-4
        py-5
        pb-10
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

        {/* HERO */}

        <section
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.07]
            bg-[#0b0f19]/80
            px-5
            py-7
            md:px-7
            md:py-8
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -left-20
              top-[-120px]
              h-[320px]
              w-[320px]
              rounded-full
              bg-cyan-400/[0.06]
              blur-[120px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              bottom-[-180px]
              h-[320px]
              w-[320px]
              rounded-full
              bg-violet-500/[0.08]
              blur-[130px]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-7
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
                  tracking-[0.28em]
                  text-cyan-300
                "
              >
                <Target
                  size={13}
                />

                Practice Intelligence
              </div>

              <h1
                className="
                  mt-4
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-white
                  md:text-4xl
                "
              >
                Practice one skill.
                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-cyan-300
                    via-sky-300
                    to-violet-300
                    bg-clip-text
                    text-transparent
                  "
                >
                  Improve with intent.
                </span>
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
                Use focused drills to improve individual interview
                signals before testing yourself inside a full
                AI-powered interview.
              </p>
            </div>


            <div
              className="
                self-start
                rounded-xl
                border
                border-white/[0.07]
                bg-black/20
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/[0.05]
                  "
                >
                  <div
                    className="
                      absolute
                      inset-0
                      animate-pulse
                      rounded-xl
                      border
                      border-cyan-300/10
                    "
                  />

                  <Brain
                    size={21}
                    className="
                      relative
                      text-cyan-300
                    "
                  />
                </div>

                <div>
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-slate-600
                    "
                  >
                    Practice Engine
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-medium
                      text-slate-300
                    "
                  >
                    Adaptive drills ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section
          className="
            mt-6
            grid
            gap-6
            xl:grid-cols-[1.25fr_.75fr]
          "
        >

          {/* PRACTICE BUILDER */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#0b0f19]/70
              p-5
              md:p-6
            "
          >
            <div
              className="
                flex
                items-start
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
                    tracking-[0.22em]
                    text-violet-300
                  "
                >
                  <Sparkles
                    size={13}
                  />

                  Practice builder
                </div>

                <h2
                  className="
                    mt-3
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Choose your drill
                </h2>
              </div>

              <div
                className="
                  hidden
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-emerald-400/10
                  bg-emerald-400/[0.04]
                  px-3
                  py-2
                  sm:flex
                "
              >
                <div
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-300
                    shadow-[0_0_10px_rgba(110,231,183,0.8)]
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-medium
                    text-emerald-200
                  "
                >
                  Engine ready
                </span>
              </div>
            </div>


            {/* MODE GRID */}

            <div
              className="
                mt-7
                grid
                gap-3
                sm:grid-cols-2
              "
            >
              {
                practiceModes.map(
                  (
                    mode
                  ) => {
                    const Icon =
                      mode.icon;

                    const active =
                      selectedMode.title ===
                      mode.title;

                    return (
                      <button
                        key={
                          mode.title
                        }
                        type="button"
                        onClick={
                          () =>
                            setSelectedMode(
                              mode
                            )
                        }
                        className={`
                          group
                          relative
                          overflow-hidden
                          rounded-xl
                          border
                          p-5
                          text-left
                          transition-all
                          duration-300
                          ${
                            active
                              ? `
                                border-cyan-400/25
                                bg-cyan-400/[0.045]
                                shadow-[0_0_30px_rgba(34,211,238,0.04)]
                              `
                              : `
                                border-white/[0.06]
                                bg-white/[0.015]
                                hover:border-white/[0.11]
                                hover:bg-white/[0.025]
                              `
                          }
                        `}
                      >
                        {
                          active && (
                            <div
                              className="
                                pointer-events-none
                                absolute
                                -right-10
                                -top-10
                                h-28
                                w-28
                                rounded-full
                                bg-cyan-400/[0.07]
                                blur-2xl
                              "
                            />
                          )
                        }

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
                              h-11
                              w-11
                              items-center
                              justify-center
                              rounded-xl
                              border
                              ${
                                active
                                  ? `
                                    border-cyan-400/20
                                    bg-cyan-400/[0.07]
                                  `
                                  : `
                                    border-white/[0.07]
                                    bg-black/20
                                  `
                              }
                            `}
                          >
                            <Icon
                              size={19}
                              className={`
                                ${
                                  active
                                    ? "text-cyan-300"
                                    : "text-slate-500"
                                }
                              `}
                            />
                          </div>

                          {
                            active && (
                              <div
                                className="
                                  flex
                                  h-5
                                  w-5
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-cyan-300
                                  text-slate-950
                                "
                              >
                                <Check
                                  size={12}
                                  strokeWidth={3}
                                />
                              </div>
                            )
                          }
                        </div>

                        <h3
                          className="
                            relative
                            mt-5
                            text-sm
                            font-semibold
                            text-slate-200
                          "
                        >
                          {
                            mode.title
                          }
                        </h3>

                        <p
                          className="
                            relative
                            mt-2
                            text-xs
                            leading-6
                            text-slate-600
                          "
                        >
                          {
                            mode.description
                          }
                        </p>
                      </button>
                    );
                  }
                )
              }
            </div>


            {/* DIFFICULTY */}

            <div
              className="
                mt-8
                border-t
                border-white/[0.05]
                pt-7
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Gauge
                  size={15}
                  className="
                    text-slate-500
                  "
                />

                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-300
                  "
                >
                  Difficulty level
                </p>
              </div>

              <div
                className="
                  mt-4
                  grid
                  gap-3
                  md:grid-cols-3
                "
              >
                {
                  difficultyLevels.map(
                    (
                      level
                    ) => {
                      const active =
                        selectedDifficulty ===
                        level.title;

                      return (
                        <button
                          key={
                            level.title
                          }
                          type="button"
                          onClick={
                            () =>
                              setSelectedDifficulty(
                                level.title
                              )
                          }
                          className={`
                            rounded-xl
                            border
                            p-4
                            text-left
                            transition-all
                            ${
                              active
                                ? `
                                  border-violet-400/30
                                  bg-violet-500/[0.07]
                                `
                                : `
                                  border-white/[0.06]
                                  bg-white/[0.015]
                                  hover:border-white/[0.1]
                                `
                            }
                          `}
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
                                text-sm
                                font-medium
                                text-slate-200
                              "
                            >
                              {
                                level.title
                              }
                            </span>

                            {
                              active && (
                                <div
                                  className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-violet-400
                                    shadow-[0_0_10px_rgba(167,139,250,0.9)]
                                  "
                                />
                              )
                            }
                          </div>

                          <p
                            className="
                              mt-2
                              text-xs
                              leading-5
                              text-slate-600
                            "
                          >
                            {
                              level.description
                            }
                          </p>

                          <p
                            className="
                              mt-3
                              text-[10px]
                              font-medium
                              text-violet-300
                            "
                          >
                            {
                              level.questions
                            }
                          </p>
                        </button>
                      );
                    }
                  )
                }
              </div>
            </div>


            {/* START PRACTICE */}

            <div
              className="
                mt-7
                flex
                flex-col
                gap-4
                border-t
                border-white/[0.05]
                pt-6
                sm:flex-row
                sm:items-center
                sm:justify-between
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
                  {
                    selectedMode.title
                  }
                  {" "}
                  Practice ·
                  {" "}
                  {
                    selectedDifficulty
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  {
                    selectedDifficultyData?.questions
                  }
                  {" "}
                  focused on
                  {" "}
                  {
                    selectedMode.focus
                      .slice(
                        0,
                        2
                      )
                      .join(
                        " and "
                      )
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={
                  startPractice
                }
                disabled={
                  isStarting
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-cyan-400/30
                  bg-cyan-400/[0.08]
                  px-5
                  text-sm
                  font-semibold
                  text-cyan-100
                  transition-all
                  hover:-translate-y-0.5
                  hover:border-cyan-400/50
                  hover:bg-cyan-400/[0.14]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {
                  isStarting ? (
                    <>
                      <div
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-cyan-200/20
                          border-t-cyan-200
                        "
                      />

                      Preparing Drill
                    </>
                  ) : (
                    <>
                      <Play
                        size={16}
                        fill="currentColor"
                      />

                      Start Practice
                    </>
                  )
                }
              </button>
            </div>
          </div>


          {/* RIGHT INTELLIGENCE PANEL */}

          <div
            className="
              space-y-6
            "
          >

            {/* ACTIVE DRILL */}

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#0b0f19]/70
                p-6
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  right-[-50px]
                  top-[-50px]
                  h-40
                  w-40
                  rounded-full
                  bg-cyan-400/[0.06]
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
                    justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                        text-cyan-300
                      "
                    >
                      Selected drill
                    </p>

                    <h3
                      className="
                        mt-3
                        text-xl
                        font-semibold
                        text-white
                      "
                    >
                      {
                        selectedMode.title
                      }
                    </h3>
                  </div>

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-cyan-400/20
                      bg-cyan-400/[0.06]
                    "
                  >
                    <ModeIcon
                      size={20}
                      className="
                        text-cyan-300
                      "
                    />
                  </div>
                </div>

                <p
                  className="
                    mt-5
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  {
                    selectedMode.detail
                  }
                </p>

                <div
                  className="
                    mt-6
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-slate-600
                    "
                  >
                    Core signals
                  </p>

                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {
                      selectedMode.focus.map(
                        (
                          item
                        ) => (
                          <span
                            key={
                              item
                            }
                            className="
                              rounded-lg
                              border
                              border-cyan-400/10
                              bg-cyan-400/[0.04]
                              px-3
                              py-2
                              text-xs
                              text-cyan-100
                            "
                          >
                            {
                              item
                            }
                          </span>
                        )
                      )
                    }
                  </div>
                </div>
              </div>
            </div>


            {/* PRACTICE SIGNAL */}

            <div
              className="
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#0b0f19]/70
                p-6
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
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-violet-300
                  "
                >
                  <Flame
                    size={13}
                  />

                  Practice signal
                </div>

                <RotateCcw
                  size={15}
                  className="
                    text-slate-700
                  "
                />
              </div>

              <div
                className="
                  mt-6
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                <MetricBox
                  label="Current streak"
                  value="0"
                  suffix=" days"
                  accent="violet"
                />

                <MetricBox
                  label="Practice score"
                  value="--"
                  suffix=""
                  accent="cyan"
                />
              </div>

              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-white/[0.05]
                  bg-white/[0.015]
                  px-4
                  py-4
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
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-white/[0.06]
                        bg-black/20
                      "
                    >
                      <Clock3
                        size={16}
                        className="
                          text-slate-500
                        "
                      />
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          font-medium
                          text-slate-400
                        "
                      >
                        Next drill
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          text-slate-700
                        "
                      >
                        Start a focused practice session
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className="
                      text-slate-700
                    "
                  />
                </div>
              </div>
            </div>


            {/* AI INSIGHT */}

            <div
              className="
                rounded-2xl
                border
                border-violet-400/10
                bg-violet-400/[0.025]
                p-6
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
                    bg-violet-400/[0.05]
                  "
                >
                  <Lightbulb
                    size={18}
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
                    Practice insight
                  </p>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-6
                      text-slate-500
                    "
                  >
                    Focused repetition works best when each session
                    targets one signal instead of trying to improve
                    everything at once.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* RECENT DRILLS */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-white/[0.07]
            bg-[#0b0f19]/60
            p-5
            md:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
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
                  tracking-[0.22em]
                  text-slate-500
                "
              >
                <Headphones
                  size={13}
                />

                Recent practice
              </div>

              <h2
                className="
                  mt-3
                  text-lg
                  font-semibold
                  text-white
                "
              >
                Your latest drills
              </h2>
            </div>

            <span
              className="
                self-start
                rounded-lg
                border
                border-white/[0.06]
                bg-white/[0.015]
                px-3
                py-2
                text-[10px]
                text-slate-600
              "
            >
              Updates after completed sessions
            </span>
          </div>

          <div
            className="
              mt-6
              grid
              gap-4
              md:grid-cols-3
            "
          >
            {
              recentDrills.map(
                (
                  drill
                ) => (
                  <div
                    key={
                      drill.title
                    }
                    className="
                      group
                      rounded-xl
                      border
                      border-white/[0.06]
                      bg-white/[0.015]
                      p-4
                      transition-all
                      hover:border-white/[0.1]
                      hover:bg-white/[0.025]
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
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-white/[0.07]
                          bg-black/20
                        "
                      >
                        <Trophy
                          size={16}
                          className="
                            text-violet-300
                          "
                        />
                      </div>

                      <span
                        className="
                          text-[10px]
                          font-medium
                          text-emerald-300
                        "
                      >
                        {
                          drill.improvement
                        }
                      </span>
                    </div>

                    <p
                      className="
                        mt-5
                        text-sm
                        font-medium
                        text-slate-300
                      "
                    >
                      {
                        drill.title
                      }
                    </p>

                    <div
                      className="
                        mt-3
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <span
                        className="
                          text-xs
                          text-slate-600
                        "
                      >
                        {
                          drill.mode
                        }
                      </span>

                      <span
                        className="
                          text-sm
                          font-semibold
                          text-slate-200
                        "
                      >
                        {
                          drill.score
                        }
                      </span>
                    </div>
                  </div>
                )
              )
            }
          </div>
        </section>
      </div>
    </div>
  );
}


function MetricBox(
  {
    label,
    value,
    suffix,
    accent,
  }: {
    label: string;
    value: string;
    suffix: string;
    accent:
      | "violet"
      | "cyan";
  }
) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.05]
        bg-white/[0.015]
        p-4
      "
    >
      <p
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.15em]
          text-slate-700
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-3
          text-2xl
          font-semibold
          ${
            accent ===
            "violet"
              ? "text-violet-300"
              : "text-cyan-300"
          }
        `}
      >
        {value}

        <span
          className="
            ml-1
            text-xs
            font-medium
            text-slate-600
          "
        >
          {suffix}
        </span>
      </p>
    </div>
  );
}


export default PracticeMode;