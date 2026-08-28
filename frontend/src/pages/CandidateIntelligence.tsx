import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Activity,
  Brain,
  BriefcaseBusiness,
  CircleAlert,
  Cpu,
  Database,
  Gauge,
  Layers3,
  LoaderCircle,
  Radar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Waves,
  Zap,
} from "lucide-react";

import {
  getCandidateIntelligence,
} from "../services/api";

/* =========================================================
   TYPES
   ========================================================= */

type CandidateData = {
  readiness?: number;
  profile?: number;
  resume?: number;
  jd_match?: number;
  technical?: number;
  speech?: number;
  communication?: number;
  confidence?: number;
  vision?: number;
  hiring_probability?: number;
  strongest_signal?: string;
  focus_area?: string;
  recommendation?: string;
  status?: string;
  signals?: number;
  [key: string]: unknown;
};

type IntelligenceState = {
  readiness: number;
  profile: number;
  resume: number;
  jdMatch: number;
  technical: number;
  speech: number;
  communication: number;
  confidence: number;
  vision: number;
  hiringProbability: number;
  strongestSignal: string;
  focusArea: string;
  recommendation: string;
  signals: number;
};

/* =========================================================
   DEFAULT STATE
   ========================================================= */

const DEFAULT_STATE: IntelligenceState = {
  readiness: 0,
  profile: 0,
  resume: 0,
  jdMatch: 0,
  technical: 0,
  speech: 0,
  communication: 0,
  confidence: 0,
  vision: 0,
  hiringProbability: 0,
  strongestSignal:
    "Collecting data",
  focusArea:
    "Complete first analysis",
  recommendation:
    "Complete resume and interview analysis to activate your candidate intelligence profile.",
  signals: 0,
};

/* =========================================================
   HELPERS
   ========================================================= */

function clamp(
  value: unknown
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(number)
    )
  );
}

function normalizeCandidate(
  data: CandidateData | null
): IntelligenceState {
  if (!data) {
    return DEFAULT_STATE;
  }

  return {
    readiness:
      clamp(
        data.readiness ??
          data.candidate_readiness ??
          data.overall_readiness
      ),

    profile:
      clamp(
        data.profile ??
          data.profile_score ??
          data.profile_coverage
      ),

    resume:
      clamp(
        data.resume ??
          data.resume_score ??
          data.ats_score
      ),

    jdMatch:
      clamp(
        data.jd_match ??
          data.jdMatch ??
          data.jd_match_score
      ),

    technical:
      clamp(
        data.technical ??
          data.technical_score
      ),

    speech:
      clamp(
        data.speech ??
          data.speech_score
      ),

    communication:
      clamp(
        data.communication ??
          data.communication_score
      ),

    confidence:
      clamp(
        data.confidence ??
          data.confidence_score
      ),

    vision:
      clamp(
        data.vision ??
          data.vision_score
      ),

    hiringProbability:
      clamp(
        data.hiring_probability ??
          data.hiringProbability ??
          data.probability
      ),

    strongestSignal:
      String(
        data.strongest_signal ??
          data.strongestSignal ??
          "Collecting data"
      ),

    focusArea:
      String(
        data.focus_area ??
          data.focusArea ??
          "Complete first analysis"
      ),

    recommendation:
      String(
        data.recommendation ??
          data.ai_recommendation ??
          DEFAULT_STATE.recommendation
      ),

    signals:
      Math.max(
        0,
        Number(
          data.signals ??
            data.signal_count ??
            0
        ) || 0
      ),
  };
}

function scoreLabel(
  score: number
) {
  if (score >= 85) {
    return "Strong";
  }

  if (score >= 65) {
    return "Developing";
  }

  if (score > 0) {
    return "Early";
  }

  return "Pending";
}

/* =========================================================
   SIGNAL ORBIT
   ========================================================= */

function IntelligenceCore({
  score,
  loading,
}: {
  score: number;
  loading: boolean;
}) {
  const orbitSignals = [
    {
      label: "RESUME",
      x: 18,
      y: 30,
      color:
        "border-violet-400/30 bg-violet-400/15 text-violet-200",
    },
    {
      label: "VOICE",
      x: 74,
      y: 20,
      color:
        "border-cyan-400/30 bg-cyan-400/15 text-cyan-200",
    },
    {
      label: "VISION",
      x: 82,
      y: 66,
      color:
        "border-fuchsia-400/30 bg-fuchsia-400/15 text-fuchsia-200",
    },
    {
      label: "INTERVIEW",
      x: 16,
      y: 74,
      color:
        "border-emerald-400/30 bg-emerald-400/15 text-emerald-200",
    },
  ];

  return (
    <div
      className="
        relative
        mx-auto
        flex
        h-[310px]
        w-full
        max-w-[520px]
        items-center
        justify-center
        sm:h-[350px]
      "
    >
      {/* ambient glow */}

      <motion.div
        animate={{
          scale:
            loading
              ? [
                  1,
                  1.1,
                  1,
                ]
              : [
                  1,
                  1.05,
                  1,
                ],
          opacity:
            loading
              ? [
                  0.35,
                  0.6,
                  0.35,
                ]
              : [
                  0.25,
                  0.4,
                  0.25,
                ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          h-44
          w-44
          rounded-full
          bg-violet-500/20
          blur-[85px]
        "
      />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          h-[240px]
          w-[240px]
          rounded-full
          border
          border-violet-400/15
          [transform:rotateX(62deg)]
          sm:h-[290px]
          sm:w-[290px]
        "
      >
        <span
          className="
            absolute
            -top-1
            left-1/2
            h-2
            w-2
            rounded-full
            bg-violet-300
            shadow-[0_0_18px_rgba(196,181,253,1)]
          "
        />
      </motion.div>

      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          h-[190px]
          w-[320px]
          rounded-full
          border
          border-cyan-400/15
          [transform:rotateX(72deg)_rotateY(24deg)]
          sm:h-[220px]
          sm:w-[390px]
        "
      >
        <span
          className="
            absolute
            bottom-0
            left-[18%]
            h-2
            w-2
            rounded-full
            bg-cyan-300
            shadow-[0_0_18px_rgba(103,232,249,1)]
          "
        />
      </motion.div>

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          h-[280px]
          w-[170px]
          rounded-full
          border
          border-fuchsia-400/10
          [transform:rotateY(66deg)]
        "
      />

      {/* signal chips */}

      {orbitSignals.map(
        (
          signal,
          index
        ) => (
          <motion.div
            key={signal.label}
            animate={{
              y:
                index % 2 === 0
                  ? [
                      0,
                      -7,
                      0,
                    ]
                  : [
                      0,
                      7,
                      0,
                    ],
            }}
            transition={{
              duration:
                3.5 +
                index * 0.45,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`
              absolute
              rounded-full
              border
              px-2.5
              py-1
              font-mono
              text-[8px]
              font-semibold
              tracking-[0.14em]
              backdrop-blur-xl

              ${signal.color}
            `}
            style={{
              left:
                `${signal.x}%`,
              top:
                `${signal.y}%`,
            }}
          >
            {signal.label}
          </motion.div>
        )
      )}

      {/* core */}

      <motion.div
        animate={{
          rotateY:
            [
              0,
              8,
              0,
              -8,
              0,
            ],
          rotateX:
            [
              0,
              -5,
              0,
              5,
              0,
            ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          relative
          z-20
          [transform-style:preserve-3d]
        "
      >
        <div
          className="
            absolute
            -inset-8
            rounded-full
            border
            border-violet-400/10
            blur-[1px]
          "
        />

        <div
          className="
            relative
            flex
            h-[150px]
            w-[150px]
            flex-col
            items-center
            justify-center
            rounded-full
            border
            border-white/[0.08]
            bg-[#080b14]/90
            shadow-[0_25px_80px_rgba(0,0,0,0.5)]
            backdrop-blur-2xl
            sm:h-[175px]
            sm:w-[175px]
          "
        >
          <div
            className="
              absolute
              inset-4
              rounded-full
              border
              border-violet-400/15
            "
          />

          <div
            className="
              absolute
              inset-0
              rounded-full
              bg-[radial-gradient(circle_at_35%_30%,rgba(139,92,246,0.25),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(34,211,238,0.18),transparent_35%)]
            "
          />

          {loading ? (
            <LoaderCircle
              size={28}
              className="
                animate-spin
                text-violet-300
              "
            />
          ) : (
            <>
              <span
                className="
                  relative
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-white
                  sm:text-5xl
                "
              >
                {score}
              </span>

              <span
                className="
                  relative
                  mt-1
                  font-mono
                  text-[8px]
                  uppercase
                  tracking-[0.25em]
                  text-slate-600
                "
              >
                Intelligence
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   SIGNAL BAR
   ========================================================= */

function SignalBar({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent:
    | "violet"
    | "cyan"
    | "emerald"
    | "amber";
}) {
  const colors = {
    violet:
      "from-violet-500 to-fuchsia-400",
    cyan:
      "from-cyan-500 to-blue-400",
    emerald:
      "from-emerald-500 to-teal-400",
    amber:
      "from-amber-500 to-orange-400",
  };

  return (
    <div>
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
            text-[11px]
            font-medium
            text-slate-400
          "
        >
          {label}
        </span>

        <span
          className="
            font-mono
            text-[10px]
            text-slate-500
          "
        >
          {value}%
        </span>
      </div>

      <div
        className="
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
              `${value}%`,
          }}
          transition={{
            duration: 1.1,
            ease: "easeOut",
          }}
          className={`
            h-full
            rounded-full
            bg-gradient-to-r

            ${colors[accent]}
          `}
        />
      </div>
    </div>
  );
}

/* =========================================================
   RADAR VISUAL
   ========================================================= */

function RadarVisual({
  values,
}: {
  values: number[];
}) {
  const labels = [
    "Resume",
    "Technical",
    "Voice",
    "Confidence",
    "Vision",
    "JD Match",
  ];

  const center = 150;

  const radius = 100;

  const points = values
    .map(
      (
        value,
        index
      ) => {
        const angle =
          (
            Math.PI *
            2 *
            index
          ) /
            values.length -
          Math.PI / 2;

        const scaledRadius =
          radius *
          (value / 100);

        const x =
          center +
          Math.cos(angle) *
            scaledRadius;

        const y =
          center +
          Math.sin(angle) *
            scaledRadius;

        return `${x},${y}`;
      }
    )
    .join(" ");

  const gridPoints = (
    scale: number
  ) =>
    values
      .map(
        (
          _,
          index
        ) => {
          const angle =
            (
              Math.PI *
              2 *
              index
            ) /
              values.length -
            Math.PI / 2;

          const x =
            center +
            Math.cos(angle) *
              radius *
              scale;

          const y =
            center +
            Math.sin(angle) *
              radius *
              scale;

          return `${x},${y}`;
        }
      )
      .join(" ");

  return (
    <div
      className="
        relative
        mx-auto
        aspect-square
        w-full
        max-w-[340px]
      "
    >
      <svg
        viewBox="0 0 300 300"
        className="
          h-full
          w-full
          overflow-visible
        "
      >
        {[0.25, 0.5, 0.75, 1].map(
          (scale) => (
            <polygon
              key={scale}
              points={
                gridPoints(
                  scale
                )
              }
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          )
        )}

        {labels.map(
          (
            label,
            index
          ) => {
            const angle =
              (
                Math.PI *
                2 *
                index
              ) /
                labels.length -
              Math.PI / 2;

            const x =
              center +
              Math.cos(angle) *
                radius;

            const y =
              center +
              Math.sin(angle) *
                radius;

            const textX =
              center +
              Math.cos(angle) *
                122;

            const textY =
              center +
              Math.sin(angle) *
                122;

            return (
              <g
                key={label}
              >
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />

                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(148,163,184,0.75)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {label.toUpperCase()}
                </text>
              </g>
            );
          }
        )}

        <motion.polygon
          points={points}
          fill="rgba(139,92,246,0.16)"
          stroke="rgba(167,139,250,0.85)"
          strokeWidth="2"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
          }}
        />
      </svg>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

function CandidateIntelligence() {
  const [
    intelligence,
    setIntelligence,
  ] =
    useState<IntelligenceState>(
      DEFAULT_STATE
    );

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

  const loadIntelligence =
    async (
      isRefresh = false
    ) => {
      try {
        setError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await getCandidateIntelligence();

        const normalized =
          normalizeCandidate(
            response as CandidateData
          );

        setIntelligence(
          normalized
        );
      } catch (
        requestError
      ) {
        console.error(
          "Candidate intelligence loading failed:",
          requestError
        );

        setIntelligence(
          DEFAULT_STATE
        );

        setError(
          "Candidate intelligence is waiting for backend signals."
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    };

  useEffect(() => {
    loadIntelligence();
  }, []);

  const radarValues =
    useMemo(
      () => [
        intelligence.resume,
        intelligence.technical,
        intelligence.speech,
        intelligence.confidence,
        intelligence.vision,
        intelligence.jdMatch,
      ],
      [
        intelligence,
      ]
    );

  const coverage =
    useMemo(() => {
      const values =
        radarValues.filter(
          (value) =>
            value > 0
        );

      if (
        values.length === 0
      ) {
        return 0;
      }

      return Math.round(
        values.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        ) / values.length
      );
    }, [
      radarValues,
    ]);

  const activeSignals =
    radarValues.filter(
      (value) =>
        value > 0
    ).length;

  const health =
    intelligence.readiness > 0
      ? intelligence.readiness
      : coverage;

  return (
    <div
      className="
        relative
        min-h-full
        overflow-hidden
      "
    >
      {/* =====================================================
          PAGE BACKGROUND
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <motion.div
          animate={{
            x: [
              0,
              40,
              0,
            ],
            y: [
              0,
              -30,
              0,
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            -left-24
            top-10
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-500/[0.055]
            blur-[150px]
          "
        />

        <motion.div
          animate={{
            x: [
              0,
              -35,
              0,
            ],
            y: [
              0,
              40,
              0,
            ],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            right-[-180px]
            top-[180px]
            h-[520px]
            w-[520px]
            rounded-full
            bg-cyan-500/[0.045]
            blur-[170px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
          "
          style={{
            backgroundImage:
              `
                linear-gradient(
                  rgba(255,255,255,0.6) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,0.6) 1px,
                  transparent 1px
                )
              `,
            backgroundSize:
              "48px 48px",
          }}
        />

        <div
          className="
            absolute
            inset-x-[10%]
            top-[24%]
            h-px
            bg-gradient-to-r
            from-transparent
            via-violet-400/20
            to-transparent
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-[1500px]
          pb-10
        "
      >
        {/* ===================================================
            HERO
            =================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.07]
            bg-[#090c15]/70
            px-5
            py-7
            backdrop-blur-2xl
            sm:px-7
            lg:px-9
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-28
              -top-28
              h-[320px]
              w-[320px]
              rounded-full
              bg-violet-500/[0.08]
              blur-[100px]
            "
          />

          <div
            className="
              relative
              grid
              items-center
              gap-8
              lg:grid-cols-[1.1fr_0.9fr]
            "
          >
            <div>
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-violet-400/15
                    bg-violet-500/[0.07]
                    px-3
                    py-1.5
                    font-mono
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-violet-300
                  "
                >
                  <Sparkles
                    size={12}
                  />

                  Candidate intelligence
                </span>

                <span
                  className={`
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3
                    py-1.5
                    font-mono
                    text-[9px]
                    uppercase
                    tracking-[0.15em]

                    ${
                      activeSignals > 0
                        ? `
                          border-emerald-400/15
                          bg-emerald-400/[0.05]
                          text-emerald-300
                        `
                        : `
                          border-amber-400/15
                          bg-amber-400/[0.05]
                          text-amber-300
                        `
                    }
                  `}
                >
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full

                      ${
                        activeSignals > 0
                          ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                          : "bg-amber-400"
                      }
                    `}
                  />

                  {
                    activeSignals > 0
                      ? "Signals active"
                      : "Signal collection"
                  }
                </span>
              </div>

              <h1
                className="
                  mt-6
                  max-w-3xl
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-white
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                Your candidate profile,
                <span
                  className="
                    block
                    bg-gradient-to-r
                    from-violet-300
                    via-fuchsia-300
                    to-cyan-300
                    bg-clip-text
                    text-transparent
                  "
                >
                  understood as one system.
                </span>
              </h1>

              <p
                className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-500
                  sm:text-[15px]
                "
              >
                HireSense combines resume quality,
                interview performance, communication,
                confidence, voice and visual signals
                into a continuously evolving
                intelligence profile.
              </p>

              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <button
                  onClick={() =>
                    loadIntelligence(true)
                  }
                  disabled={
                    refreshing
                  }
                  className="
                    group
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.03]
                    px-4
                    py-2.5
                    text-xs
                    font-medium
                    text-slate-300
                    transition
                    hover:border-violet-400/20
                    hover:bg-violet-500/[0.06]
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <RefreshCw
                    size={14}
                    className={
                      refreshing
                        ? "animate-spin"
                        : "transition group-hover:rotate-90"
                    }
                  />

                  {
                    refreshing
                      ? "Synchronizing..."
                      : "Refresh intelligence"
                  }
                </button>

                <span
                  className="
                    flex
                    items-center
                    gap-2
                    text-[11px]
                    text-slate-600
                  "
                >
                  <Database
                    size={13}
                    className="
                      text-cyan-400/70
                    "
                  />

                  Backend-driven signal profile
                </span>
              </div>
            </div>

            <IntelligenceCore
              score={health}
              loading={loading}
            />
          </div>
        </section>

        {/* ===================================================
            BACKEND PENDING
            =================================================== */}

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
            className="
              mt-5
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-amber-400/15
              bg-amber-400/[0.035]
              px-5
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <span
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-amber-400/15
                  bg-amber-400/[0.06]
                  text-amber-300
                "
              >
                <CircleAlert
                  size={16}
                />
              </span>

              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    text-amber-100
                  "
                >
                  Intelligence backend connection pending
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-slate-500
                  "
                >
                  {error} The frontend is ready and
                  will populate automatically when the
                  candidate intelligence API is fixed.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                loadIntelligence(true)
              }
              className="
                shrink-0
                rounded-lg
                px-3
                py-2
                text-[11px]
                font-medium
                text-amber-200
                transition
                hover:bg-amber-400/[0.06]
              "
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* ===================================================
            PRIMARY INTELLIGENCE GRID
            =================================================== */}

        <section
          className="
            mt-5
            grid
            gap-5
            xl:grid-cols-[1.45fr_0.85fr]
          "
        >
          {/* SIGNAL MATRIX */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-white/[0.07]
              bg-[#090c15]/72
              p-5
              backdrop-blur-xl
              sm:p-6
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                right-[-100px]
                top-[-100px]
                h-[260px]
                w-[260px]
                rounded-full
                bg-violet-500/[0.05]
                blur-[100px]
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    font-mono
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-cyan-300
                  "
                >
                  Intelligence engine
                </p>

                <h2
                  className="
                    mt-2
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Signal matrix
                </h2>

                <p
                  className="
                    mt-2
                    max-w-xl
                    text-[11px]
                    leading-6
                    text-slate-500
                  "
                >
                  Every completed analysis contributes
                  to the profile rather than existing as
                  another disconnected dashboard number.
                </p>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.025]
                  px-3
                  py-2
                "
              >
                <Layers3
                  size={14}
                  className="
                    text-violet-300
                  "
                />

                <span
                  className="
                    font-mono
                    text-[10px]
                    text-slate-400
                  "
                >
                  {activeSignals}/6 active
                </span>
              </div>
            </div>

            <div
              className="
                relative
                mt-7
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {[
                {
                  label: "Resume",
                  value:
                    intelligence.resume,
                  icon:
                    <FileTextSignal />,
                  accent:
                    "violet" as const,
                },
                {
                  label: "Technical",
                  value:
                    intelligence.technical,
                  icon:
                    <Cpu size={18} />,
                  accent:
                    "cyan" as const,
                },
                {
                  label: "Communication",
                  value:
                    intelligence.communication,
                  icon:
                    <Waves size={18} />,
                  accent:
                    "emerald" as const,
                },
                {
                  label: "Speech",
                  value:
                    intelligence.speech,
                  icon:
                    <Activity size={18} />,
                  accent:
                    "cyan" as const,
                },
                {
                  label: "Confidence",
                  value:
                    intelligence.confidence,
                  icon:
                    <TrendingUp size={18} />,
                  accent:
                    "violet" as const,
                },
                {
                  label: "Vision",
                  value:
                    intelligence.vision,
                  icon:
                    <Radar size={18} />,
                  accent:
                    "amber" as const,
                },
              ].map(
                (
                  signal,
                  index
                ) => (
                  <motion.div
                    key={signal.label}
                    initial={{
                      opacity: 0,
                      y: 14,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.35,
                      delay:
                        index * 0.05,
                    }}
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/[0.06]
                      bg-white/[0.018]
                      p-4
                      transition
                      hover:-translate-y-0.5
                      hover:border-white/[0.1]
                      hover:bg-white/[0.03]
                    "
                  >
                    <div
                      className={`
                        absolute
                        -right-8
                        -top-8
                        h-24
                        w-24
                        rounded-full
                        blur-2xl
                        opacity-0
                        transition
                        group-hover:opacity-100

                        ${
                          signal.accent ===
                          "cyan"
                            ? "bg-cyan-400/10"
                            : signal.accent ===
                              "emerald"
                            ? "bg-emerald-400/10"
                            : signal.accent ===
                              "amber"
                            ? "bg-amber-400/10"
                            : "bg-violet-400/10"
                        }
                      `}
                    />

                    <div
                      className="
                        relative
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <span
                        className={`
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          border

                          ${
                            signal.accent ===
                            "cyan"
                              ? "border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300"
                              : signal.accent ===
                                "emerald"
                              ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
                              : signal.accent ===
                                "amber"
                              ? "border-amber-400/15 bg-amber-400/[0.06] text-amber-300"
                              : "border-violet-400/15 bg-violet-400/[0.06] text-violet-300"
                          }
                        `}
                      >
                        {
                          signal.icon
                        }
                      </span>

                      <span
                        className="
                          font-mono
                          text-lg
                          font-semibold
                          text-slate-200
                        "
                      >
                        {
                          signal.value
                        }%
                      </span>
                    </div>

                    <p
                      className="
                        relative
                        mt-5
                        text-xs
                        font-medium
                        text-slate-300
                      "
                    >
                      {
                        signal.label
                      }
                    </p>

                    <p
                      className="
                        relative
                        mt-1
                        text-[10px]
                        text-slate-600
                      "
                    >
                      {scoreLabel(
                        signal.value
                      )}
                    </p>

                    <div
                      className="
                        relative
                        mt-4
                        h-1
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
                            `${signal.value}%`,
                        }}
                        transition={{
                          duration: 0.9,
                          delay:
                            index * 0.05,
                        }}
                        className={`
                          h-full
                          rounded-full

                          ${
                            signal.accent ===
                            "cyan"
                              ? "bg-gradient-to-r from-cyan-500 to-blue-400"
                              : signal.accent ===
                                "emerald"
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                              : signal.accent ===
                                "amber"
                              ? "bg-gradient-to-r from-amber-500 to-orange-400"
                              : "bg-gradient-to-r from-violet-500 to-fuchsia-400"
                          }
                        `}
                      />
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </div>

          {/* STATUS COLUMN */}

          <div
            className="
              grid
              gap-5
            "
          >
            <div
              className="
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white/[0.07]
                bg-[#090c15]/72
                p-5
                backdrop-blur-xl
                sm:p-6
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
                      font-mono
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.22em]
                      text-violet-300
                    "
                  >
                    Candidate status
                  </p>

                  <h2
                    className="
                      mt-2
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    Intelligence health
                  </h2>
                </div>

                <span
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-violet-400/15
                    bg-violet-500/[0.06]
                    text-violet-300
                  "
                >
                  <ShieldCheck
                    size={18}
                  />
                </span>
              </div>

              <div
                className="
                  mt-8
                  flex
                  items-end
                  justify-between
                "
              >
                <div>
                  <span
                    className="
                      text-4xl
                      font-semibold
                      tracking-tight
                      text-white
                    "
                  >
                    {health}%
                  </span>

                  <p
                    className="
                      mt-2
                      text-[10px]
                      text-slate-600
                    "
                  >
                    Profile signal coverage
                  </p>
                </div>

                <span
                  className={`
                    rounded-lg
                    border
                    px-3
                    py-2
                    text-[10px]
                    font-semibold

                    ${
                      health >= 70
                        ? `
                          border-emerald-400/15
                          bg-emerald-400/[0.06]
                          text-emerald-300
                        `
                        : health > 0
                        ? `
                          border-violet-400/15
                          bg-violet-400/[0.06]
                          text-violet-300
                        `
                        : `
                          border-slate-400/10
                          bg-white/[0.025]
                          text-slate-500
                        `
                    }
                  `}
                >
                  {
                    health >= 70
                      ? "Profile ready"
                      : health > 0
                      ? "Building"
                      : "Pending"
                  }
                </span>
              </div>

              <div
                className="
                  mt-6
                  h-2
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
                      `${health}%`,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-violet-500
                    via-fuchsia-400
                    to-cyan-400
                  "
                />
              </div>

              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-white/[0.02]
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
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-cyan-400/10
                      bg-cyan-400/[0.05]
                      text-cyan-300
                    "
                  >
                    <Sparkles
                      size={15}
                    />
                  </span>

                  <div>
                    <p
                      className="
                        text-[10px]
                        font-medium
                        text-slate-300
                      "
                    >
                      {
                        intelligence.signals ||
                        activeSignals
                      } intelligence signals
                    </p>

                    <p
                      className="
                        mt-1
                        text-[9px]
                        text-slate-600
                      "
                    >
                      Signal sources are continuously
                      synchronized.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SIGNAL SUMMARY */}

            <div
              className="
                rounded-[28px]
                border
                border-white/[0.07]
                bg-[#090c15]/72
                p-5
                backdrop-blur-xl
                sm:p-6
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
                      font-mono
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.22em]
                      text-cyan-300
                    "
                  >
                    Intelligence engine
                  </p>

                  <h2
                    className="
                      mt-2
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    Signal summary
                  </h2>
                </div>

                <Cpu
                  size={17}
                  className="
                    text-slate-600
                  "
                />
              </div>

              <div
                className="
                  mt-5
                  space-y-3
                "
              >
                <SummaryRow
                  label="Strongest signal"
                  value={
                    intelligence.strongestSignal
                  }
                  accent="emerald"
                />

                <SummaryRow
                  label="Focus area"
                  value={
                    intelligence.focusArea
                  }
                  accent="violet"
                />

                <SummaryRow
                  label="Profile coverage"
                  value={`${coverage}%`}
                  accent="cyan"
                />

                <SummaryRow
                  label="Candidate readiness"
                  value={`${health}%`}
                  accent="amber"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            INTELLIGENCE MAP
            =================================================== */}

        <section
          className="
            mt-5
            grid
            gap-5
            xl:grid-cols-[0.95fr_1.05fr]
          "
        >
          {/* RADAR */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-white/[0.07]
              bg-[#090c15]/72
              p-5
              backdrop-blur-xl
              sm:p-6
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                bottom-[-120px]
                left-[-120px]
                h-[300px]
                w-[300px]
                rounded-full
                bg-cyan-500/[0.045]
                blur-[110px]
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
                    font-mono
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-cyan-300
                  "
                >
                  Multi-signal map
                </p>

                <h2
                  className="
                    mt-2
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Candidate surface
                </h2>

                <p
                  className="
                    mt-2
                    text-[11px]
                    leading-6
                    text-slate-500
                  "
                >
                  A single visual layer for your
                  strongest and weakest intelligence
                  dimensions.
                </p>
              </div>

              <Radar
                size={18}
                className="
                  text-cyan-300/60
                "
              />
            </div>

            <div
              className="
                relative
                mt-4
              "
            >
              <RadarVisual
                values={
                  radarValues
                }
              />
            </div>
          </div>

          {/* SIGNAL PROGRESS */}

          <div
            className="
              rounded-[28px]
              border
              border-white/[0.07]
              bg-[#090c15]/72
              p-5
              backdrop-blur-xl
              sm:p-6
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
                <p
                  className="
                    font-mono
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-violet-300
                  "
                >
                  Signal progression
                </p>

                <h2
                  className="
                    mt-2
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Profile development
                </h2>

                <p
                  className="
                    mt-2
                    text-[11px]
                    leading-6
                    text-slate-500
                  "
                >
                  The system becomes more accurate as
                  more interview and analysis data is
                  collected.
                </p>
              </div>

              <span
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-violet-400/15
                  bg-violet-500/[0.06]
                  text-violet-300
                "
              >
                <Zap
                  size={17}
                />
              </span>
            </div>

            <div
              className="
                mt-8
                space-y-6
              "
            >
              <SignalBar
                label="Resume intelligence"
                value={
                  intelligence.resume
                }
                accent="violet"
              />

              <SignalBar
                label="Technical reasoning"
                value={
                  intelligence.technical
                }
                accent="cyan"
              />

              <SignalBar
                label="Communication"
                value={
                  intelligence.communication
                }
                accent="emerald"
              />

              <SignalBar
                label="Confidence"
                value={
                  intelligence.confidence
                }
                accent="violet"
              />

              <SignalBar
                label="Job alignment"
                value={
                  intelligence.jdMatch
                }
                accent="amber"
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            AI RECOMMENDATION
            =================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[28px]
            border
            border-violet-400/10
            bg-[linear-gradient(120deg,rgba(139,92,246,0.08),rgba(9,12,21,0.7),rgba(34,211,238,0.04))]
            p-5
            backdrop-blur-xl
            sm:p-7
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              right-[-60px]
              top-[-60px]
              h-52
              w-52
              rounded-full
              bg-violet-400/10
              blur-[80px]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div
              className="
                flex
                max-w-4xl
                items-start
                gap-4
              "
            >
              <span
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-violet-400/15
                  bg-violet-500/[0.09]
                  text-violet-300
                  shadow-[0_0_35px_rgba(139,92,246,0.08)]
                "
              >
                <Brain
                  size={21}
                />
              </span>

              <div>
                <p
                  className="
                    font-mono
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.22em]
                    text-violet-300
                  "
                >
                  AI next move
                </p>

                <h2
                  className="
                    mt-2
                    text-xl
                    font-semibold
                    text-white
                  "
                >
                  Recommended profile action
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    text-slate-400
                  "
                >
                  {
                    intelligence.recommendation
                  }
                </p>
              </div>
            </div>

            <div
              className="
                flex
                shrink-0
                items-center
                gap-3
                rounded-2xl
                border
                border-white/[0.07]
                bg-black/20
                px-4
                py-3
              "
            >
              <Target
                size={16}
                className="
                  text-cyan-300
                "
              />

              <div>
                <p
                  className="
                    text-[10px]
                    text-slate-600
                  "
                >
                  Current readiness
                </p>

                <p
                  className="
                    mt-1
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  {health}%
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL ICON COMPONENT
   ========================================================= */

function FileTextSignal() {
  return (
    <BriefcaseBusiness
      size={18}
    />
  );
}

/* =========================================================
   SUMMARY ROW
   ========================================================= */

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent:
    | "violet"
    | "cyan"
    | "emerald"
    | "amber";
}) {
  const colors = {
    violet:
      "text-violet-300",
    cyan:
      "text-cyan-300",
    emerald:
      "text-emerald-300",
    amber:
      "text-amber-300",
  };

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        border-white/[0.06]
        bg-white/[0.018]
        px-4
        py-3
      "
    >
      <span
        className="
          text-[10px]
          text-slate-500
        "
      >
        {label}
      </span>

      <span
        className={`
          max-w-[170px]
          truncate
          text-right
          text-[10px]
          font-medium

          ${colors[accent]}
        `}
      >
        {value}
      </span>
    </div>
  );
}

export default CandidateIntelligence;