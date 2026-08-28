import { useMemo, useState } from "react";

import {
  ArrowUpRight,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileText,
  Gauge,
  Lightbulb,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";


type SignalType = {
  label: string;
  score: number;
  description: string;
  color: "violet" | "cyan" | "emerald" | "amber";
};


const hiringSignals: SignalType[] = [
  {
    label: "Interview Performance",
    score: 82,
    description:
      "Your interview responses show strong reasoning and answer structure.",
    color: "violet",
  },
  {
    label: "Resume Strength",
    score: 76,
    description:
      "Your resume is competitive but still has opportunities for stronger impact.",
    color: "cyan",
  },
  {
    label: "Communication",
    score: 71,
    description:
      "Your clarity is improving, but answer delivery can become more concise.",
    color: "emerald",
  },
  {
    label: "Skill Alignment",
    score: 88,
    description:
      "Your current skills show strong alignment with your selected career direction.",
    color: "amber",
  },
];


const improvementActions = [
  {
    title: "Improve answer precision",
    description:
      "Reduce unnecessary explanation and structure answers around the strongest evidence.",
    impact: "+6%",
    icon: MessageIcon,
  },
  {
    title: "Strengthen resume impact",
    description:
      "Add more measurable outcomes and role-specific keywords to improve relevance.",
    impact: "+4%",
    icon: FileText,
  },
  {
    title: "Practice communication",
    description:
      "Run focused communication drills to improve clarity, confidence and pacing.",
    impact: "+3%",
    icon: Zap,
  },
];


const trendData = [
  42,
  46,
  45,
  51,
  55,
  58,
  61,
  65,
  64,
  69,
  73,
  76,
];


function HiringProbability() {
  const [
    selectedRole,
    setSelectedRole,
  ] =
    useState(
      "Software Engineer"
    );


  const [
    selectedCompanyType,
    setSelectedCompanyType,
  ] =
    useState(
      "Technology"
    );


  const overallProbability =
    useMemo(
      () => {
        const total =
          hiringSignals.reduce(
            (
              sum,
              signal
            ) =>
              sum +
              signal.score,
            0
          );

        return Math.round(
          total /
          hiringSignals.length
        );
      },
      []
    );


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
              top-[-140px]
              h-[330px]
              w-[330px]
              rounded-full
              bg-violet-500/[0.08]
              blur-[130px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              bottom-[-150px]
              h-[320px]
              w-[320px]
              rounded-full
              bg-cyan-400/[0.06]
              blur-[130px]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-8
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
                  text-violet-300
                "
              >
                <Radar
                  size={13}
                />

                Career Intelligence
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
                Understand your
                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-violet-300
                    via-fuchsia-300
                    to-cyan-300
                    bg-clip-text
                    text-transparent
                  "
                >
                  hiring readiness.
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
                HireSense combines interview performance, resume signals,
                communication and skill alignment to estimate your current
                hiring readiness.
              </p>
            </div>


            <div
              className="
                self-start
                rounded-xl
                border
                border-white/[0.07]
                bg-black/20
                px-4
                py-4
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
                    border-violet-400/20
                    bg-violet-400/[0.06]
                  "
                >
                  <div
                    className="
                      absolute
                      inset-0
                      animate-pulse
                      rounded-xl
                      border
                      border-violet-400/10
                    "
                  />

                  <Brain
                    size={21}
                    className="
                      relative
                      text-violet-300
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
                    AI Confidence Model
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-medium
                      text-slate-300
                    "
                  >
                    Signals synchronized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* MAIN */}

        <section
          className="
            mt-6
            grid
            gap-6
            xl:grid-cols-[1.1fr_.9fr]
          "
        >

          {/* PROBABILITY ENGINE */}

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
                flex-col
                gap-5
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
                    tracking-[0.22em]
                    text-cyan-300
                  "
                >
                  <Gauge
                    size={13}
                  />

                  Hiring model
                </div>

                <h2
                  className="
                    mt-3
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Current probability signal
                </h2>
              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-emerald-400/10
                  bg-emerald-400/[0.04]
                  px-3
                  py-2
                  text-[10px]
                  font-medium
                  text-emerald-200
                "
              >
                <CheckCircle2
                  size={13}
                />

                Model ready
              </div>
            </div>


            {/* SCORE */}

            <div
              className="
                mt-7
                grid
                gap-6
                lg:grid-cols-[.85fr_1.15fr]
              "
            >
              <div
                className="
                  relative
                  flex
                  min-h-[280px]
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-black/20
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    h-[250px]
                    w-[250px]
                    rounded-full
                    border
                    border-violet-400/[0.07]
                  "
                />

                <div
                  className="
                    pointer-events-none
                    absolute
                    h-[190px]
                    w-[190px]
                    rounded-full
                    border
                    border-cyan-400/[0.08]
                  "
                />

                <div
                  className="
                    pointer-events-none
                    absolute
                    h-[130px]
                    w-[130px]
                    rounded-full
                    bg-violet-500/[0.05]
                    blur-[50px]
                  "
                />

                <div
                  className="
                    relative
                    text-center
                  "
                >
                  <div
                    className="
                      relative
                      flex
                      h-40
                      w-40
                      items-center
                      justify-center
                      rounded-full
                    "
                    style={{
                      background:
                        `conic-gradient(
                          from 210deg,
                          rgba(139,92,246,0.95) ${overallProbability * 3.6}deg,
                          rgba(255,255,255,0.04) ${overallProbability * 3.6}deg
                        )`,
                    }}
                  >
                    <div
                      className="
                        flex
                        h-[136px]
                        w-[136px]
                        flex-col
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/[0.06]
                        bg-[#0b0f19]
                      "
                    >
                      <span
                        className="
                          text-4xl
                          font-semibold
                          tracking-tight
                          text-white
                        "
                      >
                        {overallProbability}
                        <span
                          className="
                            text-xl
                            text-slate-500
                          "
                        >
                          %
                        </span>
                      </span>

                      <span
                        className="
                          mt-1
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.2em]
                          text-slate-600
                        "
                      >
                        Readiness
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* CONTEXT */}

              <div
                className="
                  flex
                  flex-col
                  justify-center
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-slate-200
                  "
                >
                  <TrendingUp
                    size={16}
                    className="
                      text-emerald-300
                    "
                  />

                  Strong positive trajectory
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    leading-7
                    text-slate-500
                  "
                >
                  Your current profile shows a solid level of hiring
                  readiness. Technical alignment is your strongest signal,
                  while communication and resume positioning have the most
                  room to improve.
                </p>

                <div
                  className="
                    mt-6
                    grid
                    grid-cols-2
                    gap-3
                  "
                >
                  <SelectField
                    label="Target role"
                    value={
                      selectedRole
                    }
                    onChange={
                      setSelectedRole
                    }
                    options={[
                      "Software Engineer",
                      "Data Analyst",
                      "AI Engineer",
                      "Backend Engineer",
                    ]}
                  />

                  <SelectField
                    label="Industry"
                    value={
                      selectedCompanyType
                    }
                    onChange={
                      setSelectedCompanyType
                    }
                    options={[
                      "Technology",
                      "Finance",
                      "Consulting",
                      "Startup",
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>


          {/* TREND */}

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
                    text-slate-500
                  "
                >
                  <TrendingUp
                    size={13}
                  />

                  Progress trend
                </div>

                <h2
                  className="
                    mt-3
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Readiness movement
                </h2>
              </div>

              <span
                className="
                  rounded-lg
                  border
                  border-emerald-400/10
                  bg-emerald-400/[0.04]
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-emerald-300
                "
              >
                +34%
              </span>
            </div>


            <div
              className="
                mt-8
                flex
                h-[220px]
                items-end
                gap-2
              "
            >
              {
                trendData.map(
                  (
                    value,
                    index
                  ) => (
                    <div
                      key={index}
                      className="
                        group
                        relative
                        flex
                        h-full
                        flex-1
                        items-end
                      "
                    >
                      <div
                        className="
                          absolute
                          -top-7
                          left-1/2
                          hidden
                          -translate-x-1/2
                          rounded-md
                          border
                          border-white/[0.07]
                          bg-[#111827]
                          px-2
                          py-1
                          text-[9px]
                          text-slate-300
                          group-hover:block
                        "
                      >
                        {value}%
                      </div>

                      <div
                        className="
                          w-full
                          rounded-t-lg
                          border-x
                          border-t
                          border-violet-400/10
                          bg-gradient-to-t
                          from-violet-500/[0.14]
                          to-cyan-400/[0.2]
                          transition-all
                          duration-300
                          group-hover:brightness-125
                        "
                        style={{
                          height:
                            `${value}%`,
                        }}
                      />
                    </div>
                  )
                )
              }
            </div>


            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                text-[10px]
                text-slate-700
              "
            >
              <span>Earlier</span>
              <span>Current</span>
            </div>


            <div
              className="
                mt-6
                rounded-xl
                border
                border-white/[0.05]
                bg-white/[0.015]
                p-4
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <Lightbulb
                  size={16}
                  className="
                    mt-0.5
                    text-amber-300
                  "
                />

                <div>
                  <p
                    className="
                      text-xs
                      font-medium
                      text-slate-300
                    "
                  >
                    Intelligence insight
                  </p>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-6
                      text-slate-600
                    "
                  >
                    Your readiness trend is improving consistently.
                    Focus on communication quality to unlock the next
                    meaningful increase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* SIGNALS */}

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
                  text-cyan-300
                "
              >
                <Radar
                  size={13}
                />

                Intelligence signals
              </div>

              <h2
                className="
                  mt-3
                  text-lg
                  font-semibold
                  text-white
                "
              >
                What is shaping your probability
              </h2>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-slate-600
              "
            >
              <ShieldCheck
                size={14}
              />

              Multi-signal analysis
            </div>
          </div>


          <div
            className="
              mt-6
              grid
              gap-4
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            {
              hiringSignals.map(
                (
                  signal
                ) => (
                  <SignalCard
                    key={
                      signal.label
                    }
                    signal={
                      signal
                    }
                  />
                )
              )
            }
          </div>
        </section>


        {/* IMPROVEMENT */}

        <section
          className="
            mt-6
            grid
            gap-6
            xl:grid-cols-[.7fr_1.3fr]
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-violet-400/10
              bg-violet-400/[0.025]
              p-6
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                -bottom-16
                -right-16
                h-40
                w-40
                rounded-full
                bg-violet-500/[0.08]
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
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-violet-400/15
                  bg-violet-400/[0.05]
                "
              >
                <Target
                  size={20}
                  className="
                    text-violet-300
                  "
                />
              </div>

              <h2
                className="
                  mt-6
                  text-2xl
                  font-semibold
                  text-white
                "
              >
                Your fastest path
                <br />
                to stronger readiness.
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  leading-7
                  text-slate-500
                "
              >
                Small improvements in the weakest signals can create
                a much stronger overall hiring profile.
              </p>

              <div
                className="
                  mt-6
                  flex
                  items-center
                  gap-3
                  text-sm
                  font-medium
                  text-violet-200
                "
              >
                <Sparkles
                  size={16}
                />

                Estimated potential: 89%
              </div>
            </div>
          </div>


          <div
            className="
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
                    tracking-[0.22em]
                    text-slate-500
                  "
                >
                  Recommended actions
                </p>

                <h2
                  className="
                    mt-3
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  Improve the signals that matter most
                </h2>
              </div>
            </div>


            <div
              className="
                mt-6
                space-y-3
              "
            >
              {
                improvementActions.map(
                  (
                    action
                  ) => {
                    const Icon =
                      action.icon;

                    return (
                      <button
                        key={
                          action.title
                        }
                        type="button"
                        className="
                          group
                          flex
                          w-full
                          items-center
                          gap-4
                          rounded-xl
                          border
                          border-white/[0.06]
                          bg-white/[0.015]
                          p-4
                          text-left
                          transition-all
                          hover:border-white/[0.1]
                          hover:bg-white/[0.025]
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
                            rounded-lg
                            border
                            border-white/[0.07]
                            bg-black/20
                          "
                        >
                          <Icon
                            size={17}
                            className="
                              text-violet-300
                            "
                          />
                        </div>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <p
                            className="
                              text-sm
                              font-medium
                              text-slate-300
                            "
                          >
                            {
                              action.title
                            }
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-slate-600
                            "
                          >
                            {
                              action.description
                            }
                          </p>
                        </div>

                        <div
                          className="
                            hidden
                            items-center
                            gap-3
                            sm:flex
                          "
                        >
                          <span
                            className="
                              text-xs
                              font-medium
                              text-emerald-300
                            "
                          >
                            {
                              action.impact
                            }
                          </span>

                          <ChevronRight
                            size={16}
                            className="
                              text-slate-700
                              transition-transform
                              group-hover:translate-x-1
                            "
                          />
                        </div>
                      </button>
                    );
                  }
                )
              }
            </div>
          </div>
        </section>


        {/* DISCLAIMER */}

        <section
          className="
            mt-6
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-white/[0.05]
            bg-white/[0.01]
            px-4
            py-4
          "
        >
          <CircleAlert
            size={16}
            className="
              mt-0.5
              shrink-0
              text-slate-600
            "
          />

          <p
            className="
              text-xs
              leading-6
              text-slate-600
            "
          >
            Hiring Probability is an AI-generated readiness estimate,
            not a guarantee of employment. The score becomes more
            meaningful as additional resume, interview and performance
            data is connected to the HireSense platform.
          </p>
        </section>
      </div>
    </div>
  );
}


function SignalCard(
  {
    signal,
  }: {
    signal: SignalType;
  }
) {
  const colorMap = {
    violet: {
      text:
        "text-violet-300",
      bar:
        "from-violet-500/[0.55] to-fuchsia-400/[0.7]",
    },
    cyan: {
      text:
        "text-cyan-300",
      bar:
        "from-cyan-500/[0.5] to-sky-400/[0.7]",
    },
    emerald: {
      text:
        "text-emerald-300",
      bar:
        "from-emerald-500/[0.45] to-teal-400/[0.65]",
    },
    amber: {
      text:
        "text-amber-300",
      bar:
        "from-amber-500/[0.45] to-yellow-400/[0.65]",
    },
  };


  const style =
    colorMap[
      signal.color
    ];


  return (
    <div
      className="
        rounded-xl
        border
        border-white/[0.06]
        bg-white/[0.015]
        p-5
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <p
          className="
            text-sm
            font-medium
            text-slate-300
          "
        >
          {
            signal.label
          }
        </p>

        <span
          className={`
            text-lg
            font-semibold
            ${style.text}
          `}
        >
          {
            signal.score
          }
          %
        </span>
      </div>

      <div
        className="
          mt-5
          h-1.5
          overflow-hidden
          rounded-full
          bg-white/[0.04]
        "
      >
        <div
          className={`
            h-full
            rounded-full
            bg-gradient-to-r
            ${style.bar}
          `}
          style={{
            width:
              `${signal.score}%`,
          }}
        />
      </div>

      <p
        className="
          mt-4
          text-xs
          leading-6
          text-slate-600
        "
      >
        {
          signal.description
        }
      </p>
    </div>
  );
}


function SelectField(
  {
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (
      value: string
    ) => void;
    options: string[];
  }
) {
  return (
    <div>
      <label
        className="
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.15em]
          text-slate-700
        "
      >
        {label}
      </label>

      <select
        value={value}
        onChange={
          (
            event
          ) =>
            onChange(
              event.target.value
            )
        }
        className="
          mt-2
          h-10
          w-full
          rounded-lg
          border
          border-white/[0.07]
          bg-black/20
          px-3
          text-xs
          text-slate-300
          outline-none
          transition
          focus:border-violet-400/30
        "
      >
        {
          options.map(
            (
              option
            ) => (
              <option
                key={option}
                value={option}
                className="
                  bg-[#0b0f19]
                "
              >
                {option}
              </option>
            )
          )
        }
      </select>
    </div>
  );
}


function MessageIcon(
  {
    size = 17,
  }: {
    size?: number;
  }
) {
  return (
    <BriefcaseBusiness
      size={size}
    />
  );
}


export default HiringProbability;