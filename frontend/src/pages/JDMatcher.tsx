import {
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  FileSearch,
  Gauge,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";


type MatchResult = {
  score: number;
  role: string;
  level: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
};


const initialResult: MatchResult = {
  score: 0,
  role: "Waiting for analysis",
  level: "—",
  matchedSkills: [],
  missingSkills: [],
  strengths: [],
  improvements: [],
};


function JDMatcher() {
  const [
    jobDescription,
    setJobDescription,
  ] = useState("");

  const [
    isAnalyzing,
    setIsAnalyzing,
  ] = useState(false);

  const [
    result,
    setResult,
  ] = useState<MatchResult>(
    initialResult
  );


  const hasResult =
    result.score > 0;


  const circumference =
    2 * Math.PI * 86;

  const progressOffset =
    circumference -
    (result.score / 100) *
      circumference;


  const analysisState =
    useMemo(
      () => {
        if (isAnalyzing) {
          return "Analyzing profile";
        }

        if (hasResult) {
          return "Analysis complete";
        }

        return "Ready for matching";
      },
      [
        hasResult,
        isAnalyzing,
      ]
    );


  const analyzeJobDescription =
    async () => {
      if (
        jobDescription.trim().length <
        40
      ) {
        return;
      }

      setIsAnalyzing(true);


      try {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1200
            )
        );


        const normalized =
          jobDescription.toLowerCase();


        const detectedSkills = [
          "python",
          "java",
          "react",
          "typescript",
          "javascript",
          "sql",
          "machine learning",
          "ai",
          "aws",
          "docker",
          "fastapi",
          "spring boot",
          "data analysis",
        ].filter(
          (skill) =>
            normalized.includes(
              skill
            )
        );


        const matched =
          detectedSkills.slice(
            0,
            6
          );

        const possibleMissing =
          [
            "Docker",
            "AWS",
            "System Design",
            "Cloud Architecture",
            "Kubernetes",
          ].filter(
            (
              skill
            ) =>
              !matched.some(
                (
                  matchedSkill
                ) =>
                  matchedSkill.toLowerCase() ===
                  skill.toLowerCase()
              )
          );


        setResult({
          score:
            Math.min(
              94,
              68 +
                detectedSkills.length *
                  4
            ),

          role:
            normalized.includes(
              "data"
            )
              ? "Data / AI Role"
              : normalized.includes(
                  "frontend"
                )
              ? "Frontend Engineering Role"
              : normalized.includes(
                  "backend"
                )
              ? "Backend Engineering Role"
              : "Software Engineering Role",

          level:
            normalized.includes(
              "senior"
            )
              ? "Senior"
              : normalized.includes(
                  "junior"
                )
              ? "Junior"
              : "Intermediate",

          matchedSkills:
            matched.map(
              (skill) =>
                skill
                  .split(" ")
                  .map(
                    (
                      word
                    ) =>
                      word
                        .charAt(
                          0
                        )
                        .toUpperCase() +
                      word.slice(
                        1
                      )
                  )
                  .join(
                    " "
                  )
            ),

          missingSkills:
            possibleMissing.slice(
              0,
              4
            ),

          strengths: [
            "Strong alignment between your technical stack and the job requirements.",
            "Your AI and software engineering background supports this role.",
            "Relevant project experience can strengthen your application further.",
          ],

          improvements: [
            "Use more measurable achievements in your resume.",
            "Highlight role-specific keywords earlier in your skills section.",
            "Connect your strongest projects directly to the job requirements.",
          ],
        });

      } finally {
        setIsAnalyzing(
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

        {/* HEADER */}

        <section
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.07]
            bg-[#0b0f19]/80
            px-5
            py-6
            md:px-7
            md:py-8
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              right-[-100px]
              top-[-120px]
              h-[320px]
              w-[320px]
              rounded-full
              bg-cyan-400/[0.08]
              blur-[110px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              left-[35%]
              bottom-[-160px]
              h-[320px]
              w-[320px]
              rounded-full
              bg-violet-500/[0.07]
              blur-[120px]
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
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-cyan-300
                "
              >
                <Target
                  size={13}
                />

                Job Intelligence
              </div>


              <h1
                className="
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-white
                  md:text-4xl
                "
              >
                JD Matcher
              </h1>


              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                Compare your candidate profile against a job description
                and identify alignment, missing capabilities and the
                strongest application strategy.
              </p>

            </div>


            <div
              className="
                inline-flex
                items-center
                gap-3
                self-start
                rounded-xl
                border
                border-white/[0.07]
                bg-black/20
                px-4
                py-3
              "
            >

              <div
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-cyan-400
                  shadow-[0_0_14px_rgba(34,211,238,0.9)]
                "
              />

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
                  Intelligence engine
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    font-medium
                    text-slate-300
                  "
                >
                  {analysisState}
                </p>

              </div>

            </div>

          </div>

        </section>


        <section
          className="
            mt-6
            grid
            gap-6
            xl:grid-cols-[1.08fr_.92fr]
          "
        >

          {/* INPUT */}

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
                  <FileSearch
                    size={13}
                  />

                  Target role
                </div>


                <h2
                  className="
                    mt-3
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Paste the job description
                </h2>

              </div>


              <span
                className="
                  rounded-lg
                  border
                  border-white/[0.06]
                  bg-white/[0.025]
                  px-3
                  py-1.5
                  text-[10px]
                  font-medium
                  text-slate-600
                "
              >
                {jobDescription.length}
                {" "}
                characters
              </span>

            </div>


            <textarea
              value={
                jobDescription
              }
              onChange={
                (
                  event
                ) =>
                  setJobDescription(
                    event.target.value
                  )
              }
              placeholder="
Paste the complete job description here. HireSense will compare
skills, experience signals and role requirements against your
candidate intelligence profile.
              "
              className="
                mt-5
                min-h-[360px]
                w-full
                resize-none
                rounded-xl
                border
                border-white/[0.07]
                bg-black/20
                p-4
                text-sm
                leading-7
                text-slate-300
                outline-none
                transition
                placeholder:text-slate-700
                focus:border-violet-400/30
                focus:bg-black/25
              "
            />


            <div
              className="
                mt-4
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <p
                className="
                  text-xs
                  text-slate-600
                "
              >
                Minimum 40 characters required for analysis.
              </p>


              <button
                type="button"
                disabled={
                  isAnalyzing ||
                  jobDescription.trim()
                    .length <
                    40
                }
                onClick={
                  analyzeJobDescription
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-violet-400/25
                  bg-violet-500/[0.12]
                  px-5
                  text-sm
                  font-semibold
                  text-violet-100
                  transition-all
                  hover:-translate-y-0.5
                  hover:border-violet-400/45
                  hover:bg-violet-500/[0.18]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >

                {
                  isAnalyzing
                    ? (
                      <>
                        <div
                          className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-violet-200/20
                            border-t-violet-200
                          "
                        />

                        Analyzing
                      </>
                    )
                    : (
                      <>
                        <WandSparkles
                          size={16}
                        />

                        Analyze Match
                      </>
                    )
                }

              </button>

            </div>

          </div>


          {/* SCORE */}

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

              Match signal
            </div>


            <div
              className="
                mt-6
                flex
                justify-center
              "
            >

              <div
                className="
                  relative
                  flex
                  h-56
                  w-56
                  items-center
                  justify-center
                "
              >

                <svg
                  className="
                    h-full
                    w-full
                    -rotate-90
                  "
                  viewBox="
                    0 0 200 200
                  "
                >

                  <circle
                    cx="100"
                    cy="100"
                    r="86"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="10"
                  />

                  <circle
                    cx="100"
                    cy="100"
                    r="86"
                    fill="transparent"
                    stroke="url(#matchGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={
                      circumference
                    }
                    strokeDashoffset={
                      progressOffset
                    }
                    style={{
                      transition:
                        "stroke-dashoffset 1.2s ease",
                    }}
                  />

                  <defs>

                    <linearGradient
                      id="matchGradient"
                      x1="0"
                      y1="0"
                      x2="200"
                      y2="200"
                    >
                      <stop
                        stopColor="#8b5cf6"
                      />

                      <stop
                        offset="1"
                        stopColor="#22d3ee"
                      />

                    </linearGradient>

                  </defs>

                </svg>


                <div
                  className="
                    absolute
                    text-center
                  "
                >

                  <div
                    className="
                      text-5xl
                      font-semibold
                      tracking-tight
                      text-white
                    "
                  >
                    {result.score}
                    %
                  </div>

                  <p
                    className="
                      mt-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-slate-600
                    "
                  >
                    Profile match
                  </p>

                </div>

              </div>

            </div>


            <div
              className="
                mt-7
                space-y-3
              "
            >

              <div
                className="
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.02]
                  p-4
                "
              >

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-slate-600
                  "
                >
                  Detected role
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    font-medium
                    text-slate-200
                  "
                >
                  {result.role}
                </p>

              </div>


              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >

                <div
                  className="
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.02]
                    p-4
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-slate-600
                    "
                  >
                    Level
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-medium
                      text-slate-200
                    "
                  >
                    {result.level}
                  </p>

                </div>


                <div
                  className="
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.02]
                    p-4
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-slate-600
                    "
                  >
                    Status
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-medium
                      text-cyan-300
                    "
                  >
                    {
                      hasResult
                        ? "Profile aligned"
                        : "Awaiting input"
                    }
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* DETAILS */}

        {
          hasResult && (
            <section
              className="
                mt-6
                grid
                gap-6
                lg:grid-cols-2
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-emerald-400/10
                  bg-[#0b0f19]/70
                  p-6
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <CheckCircle2
                    size={18}
                    className="
                      text-emerald-300
                    "
                  />

                  <h2
                    className="
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    Strong alignment
                  </h2>

                </div>


                <div
                  className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {
                    result.matchedSkills.map(
                      (
                        skill
                      ) => (
                        <span
                          key={
                            skill
                          }
                          className="
                            rounded-lg
                            border
                            border-emerald-400/15
                            bg-emerald-400/[0.05]
                            px-3
                            py-2
                            text-xs
                            text-emerald-200
                          "
                        >
                          {skill}
                        </span>
                      )
                    )
                  }

                </div>


                <div
                  className="
                    mt-6
                    space-y-3
                  "
                >
                  {
                    result.strengths.map(
                      (
                        strength
                      ) => (
                        <div
                          key={
                            strength
                          }
                          className="
                            rounded-xl
                            border
                            border-white/[0.05]
                            bg-white/[0.015]
                            p-4
                            text-sm
                            leading-6
                            text-slate-400
                          "
                        >
                          {strength}
                        </div>
                      )
                    )
                  }

                </div>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-amber-400/10
                  bg-[#0b0f19]/70
                  p-6
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <CircleAlert
                    size={18}
                    className="
                      text-amber-300
                    "
                  />

                  <h2
                    className="
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    Improvement signals
                  </h2>

                </div>


                <div
                  className="
                    mt-5
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {
                    result.missingSkills.map(
                      (
                        skill
                      ) => (
                        <span
                          key={
                            skill
                          }
                          className="
                            rounded-lg
                            border
                            border-amber-400/15
                            bg-amber-400/[0.05]
                            px-3
                            py-2
                            text-xs
                            text-amber-200
                          "
                        >
                          {skill}
                        </span>
                      )
                    )
                  }

                </div>


                <div
                  className="
                    mt-6
                    space-y-3
                  "
                >
                  {
                    result.improvements.map(
                      (
                        improvement
                      ) => (
                        <div
                          key={
                            improvement
                          }
                          className="
                            rounded-xl
                            border
                            border-white/[0.05]
                            bg-white/[0.015]
                            p-4
                            text-sm
                            leading-6
                            text-slate-400
                          "
                        >
                          {improvement}
                        </div>
                      )
                    )
                  }

                </div>

              </div>

            </section>
          )
        }


        {/* FOOTER */}

        <section
          className="
            mt-6
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.015]
            p-5
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
                border-violet-400/15
                bg-violet-400/[0.05]
              "
            >
              <BriefcaseBusiness
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
                  font-medium
                  text-slate-300
                "
              >
                Candidate intelligence is ready for role comparison
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-600
                "
              >
                Backend matching will replace the current frontend
                simulation in the backend phase.
              </p>

            </div>

          </div>


          <div
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              text-slate-600
            "
          >
            Role intelligence

            <ArrowRight
              size={14}
            />

          </div>

        </section>

      </div>

    </div>
  );
}


export default JDMatcher;