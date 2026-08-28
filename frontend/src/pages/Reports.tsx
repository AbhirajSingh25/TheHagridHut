import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  FileText,
  Gauge,
  Lightbulb,
  Loader2,
  Mic,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserCheck,
  Video,
  XCircle,
} from "lucide-react";

import {
  getInterviewSessions,
  getLatestReport,
} from "../services/api";


type UnknownRecord = Record<
  string,
  any
>;


type ReportSession = {
  id: string;
  role: string;
  level: string;
  date: string;
  duration: string;
  score: number;
  technical: number;
  communication: number;
  confidence: number;
  status: string;
  raw: UnknownRecord;
};


type ReportData = {
  overallScore: number;
  recommendation: string;

  role: string;
  level: string;

  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;

  summary: string;

  technicalAnalysis: string;
  communicationAnalysis: string;
  confidenceAnalysis: string;

  strengths: string[];
  weaknesses: string[];
  recommendations: string[];

  speechInsights: string[];
  visionInsights: string[];

  hiringNotes: string;

  questionsAnswered: number;
  duration: string;

  raw: UnknownRecord;
};


function getRecord(
  value: unknown
): UnknownRecord {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRecord;
  }

  return {};
}


function getNumber(
  ...values: unknown[]
): number {
  for (
    const value of values
  ) {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return Math.round(value);
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
        return Math.round(
          parsed
        );
      }
    }
  }

  return 0;
}


function clampScore(
  value: number
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value)
    )
  );
}


function getString(
  ...values: unknown[]
): string {
  for (
    const value of values
  ) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === "number"
    ) {
      return String(value);
    }
  }

  return "";
}


function getArray(
  ...values: unknown[]
): string[] {
  for (
    const value of values
  ) {
    if (
      Array.isArray(value)
    ) {
      return value
        .map(
          (
            item
          ) => {
            if (
              typeof item ===
              "string"
            ) {
              return item.trim();
            }

            if (
              item &&
              typeof item ===
              "object"
            ) {
              const record =
                getRecord(item);

              return getString(
                record.text,
                record.message,
                record.title,
                record.description,
                record.feedback
              );
            }

            return String(item ?? "");
          }
        )
        .filter(Boolean);
    }

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value
        .split(/\n|•|;/)
        .map(
          (
            item
          ) =>
            item.trim()
        )
        .filter(Boolean);
    }
  }

  return [];
}


function formatDate(
  value: unknown
) {
  if (
    !value
  ) {
    return "Recent session";
  }

  const date =
    new Date(
      String(value)
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}


function formatDuration(
  value: unknown
) {
  if (
    !value &&
    value !== 0
  ) {
    return "Not available";
  }

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  const seconds =
    Number(value);

  if (
    !Number.isFinite(
      seconds
    )
  ) {
    return "Not available";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    seconds % 60;

  if (
    minutes <= 0
  ) {
    return `${remaining}s`;
  }

  return `${minutes}m ${remaining}s`;
}


function normalizeSessions(
  response: unknown
): ReportSession[] {
  const record =
    getRecord(response);

  const candidates =
    Array.isArray(response)
      ? response
      : Array.isArray(
          record.sessions
        )
        ? record.sessions
        : Array.isArray(
            record.history
          )
          ? record.history
          : Array.isArray(
              record.interviews
            )
            ? record.interviews
            : Array.isArray(
                record.data
              )
              ? record.data
              : [];

  return candidates
    .map(
      (
        item,
        index
      ) => {
        const session =
          getRecord(item);

        const metrics =
          getRecord(
            session.metrics
          );

        const scores =
          getRecord(
            session.scores
          );

        const report =
          getRecord(
            session.report
          );

        const score =
          clampScore(
            getNumber(
              session.overall_score,
              session.overallScore,
              session.score,
              report.overall_score,
              report.overallScore,
              scores.overall,
              metrics.overall
            )
          );

        return {
          id:
            getString(
              session.id,
              session.session_id,
              session.uuid,
              session.interview_id
            ) ||
            `session-${index}`,

          role:
            getString(
              session.role,
              session.target_role,
              report.role
            ) ||
            "Interview Session",

          level:
            getString(
              session.level,
              session.experience_level,
              report.level
            ) ||
            "Not specified",

          date:
            formatDate(
              session.created_at ||
                session.date ||
                session.createdAt ||
                session.completed_at
            ),

          duration:
            formatDuration(
              session.duration ||
                session.duration_seconds ||
                session.session_duration
            ),

          score,

          technical:
            clampScore(
              getNumber(
                session.technical,
                session.technical_score,
                report.technical_score,
                scores.technical,
                metrics.technical
              )
            ),

          communication:
            clampScore(
              getNumber(
                session.communication,
                session.communication_score,
                report.communication_score,
                scores.communication,
                metrics.communication
              )
            ),

          confidence:
            clampScore(
              getNumber(
                session.confidence,
                session.confidence_score,
                report.confidence_score,
                scores.confidence,
                metrics.confidence
              )
            ),

          status:
            getString(
              session.status,
              session.state
            ) ||
            "Completed",

          raw:
            session,
        };
      }
    )
    .filter(
      (
        session
      ) =>
        session.id
    );
}


function normalizeReport(
  response: unknown,
  selectedSession?: ReportSession
): ReportData {
  const data =
    getRecord(response);

  const report =
    getRecord(
      data.report
    );

  const summary =
    getRecord(
      data.summary
    );

  const metrics =
    getRecord(
      data.metrics
    );

  const scores =
    getRecord(
      data.scores
    );

  const insights =
    getRecord(
      data.insights
    );

  const technical =
    clampScore(
      getNumber(
        data.technical_score,
        data.technicalScore,
        report.technical_score,
        report.technicalScore,
        metrics.technical,
        scores.technical,
        selectedSession?.technical
      )
    );

  const communication =
    clampScore(
      getNumber(
        data.communication_score,
        data.communicationScore,
        report.communication_score,
        report.communicationScore,
        metrics.communication,
        scores.communication,
        selectedSession?.communication
      )
    );

  const confidence =
    clampScore(
      getNumber(
        data.confidence_score,
        data.confidenceScore,
        report.confidence_score,
        report.confidenceScore,
        metrics.confidence,
        scores.confidence,
        selectedSession?.confidence
      )
    );

  const calculatedScore =
    Math.round(
      (
        technical +
        communication +
        confidence
      ) / 3
    );

  const overallScore =
    clampScore(
      getNumber(
        data.overall_score,
        data.overallScore,
        data.score,
        report.overall_score,
        report.overallScore,
        summary.overall_score,
        metrics.overall,
        scores.overall,
        selectedSession?.score,
        calculatedScore
      )
    );

  return {
    overallScore,

    recommendation:
      getString(
        data.recommendation,
        data.hiring_recommendation,
        data.decision,
        report.recommendation,
        summary.recommendation
      ) ||
      (
        overallScore >= 85
          ? "Strong Hire"
          : overallScore >= 70
            ? "Hire"
            : overallScore >= 55
              ? "Consider"
              : "Needs Improvement"
      ),

    role:
      getString(
        data.role,
        data.target_role,
        report.role,
        selectedSession?.role
      ) ||
      "Interview Session",

    level:
      getString(
        data.level,
        data.experience_level,
        report.level,
        selectedSession?.level
      ) ||
      "Not specified",

    technicalScore:
      technical,

    communicationScore:
      communication,

    confidenceScore:
      confidence,

    summary:
      getString(
        data.summary,
        data.overview,
        data.feedback_summary,
        report.summary,
        summary.text,
        summary.overview
      ) ||
      "Your interview performance has been analyzed across technical ability, communication quality, confidence, and recruiter-readiness signals.",

    technicalAnalysis:
      getString(
        data.technical_analysis,
        data.technical_feedback,
        report.technical_analysis,
        report.technicalFeedback,
        insights.technical
      ) ||
      "Technical analysis will become more detailed as additional interview sessions are completed.",

    communicationAnalysis:
      getString(
        data.communication_analysis,
        data.communication_feedback,
        report.communication_analysis,
        report.communicationFeedback,
        insights.communication
      ) ||
      "Communication insights will become more detailed as additional answers and speech signals are available.",

    confidenceAnalysis:
      getString(
        data.confidence_analysis,
        data.confidence_feedback,
        report.confidence_analysis,
        report.confidenceFeedback,
        insights.confidence
      ) ||
      "Confidence analysis will use behavioral and speech signals when those metrics are available.",

    strengths:
      getArray(
        data.strengths,
        report.strengths,
        summary.strengths,
        insights.strengths
      ),

    weaknesses:
      getArray(
        data.weaknesses,
        data.improvements,
        data.areas_for_improvement,
        report.weaknesses,
        report.improvements,
        summary.weaknesses
      ),

    recommendations:
      getArray(
        data.recommendations,
        data.next_steps,
        data.action_items,
        report.recommendations,
        report.next_steps
      ),

    speechInsights:
      getArray(
        data.speech_insights,
        data.speech_feedback,
        report.speech_insights,
        getRecord(
          data.speech
        ).insights
      ),

    visionInsights:
      getArray(
        data.vision_insights,
        data.visual_feedback,
        report.vision_insights,
        getRecord(
          data.vision
        ).insights
      ),

    hiringNotes:
      getString(
        data.hiring_notes,
        data.recruiter_notes,
        data.final_feedback,
        report.hiring_notes,
        report.recruiter_notes
      ) ||
      "Complete more interview sessions to build a stronger recruiter-readiness profile.",

    questionsAnswered:
      getNumber(
        data.questions_answered,
        data.questionsAnswered,
        data.question_count,
        report.questions_answered,
        selectedSession?.raw
          ?.questions
          ?.length
      ),

    duration:
      formatDuration(
        data.duration ||
          data.duration_seconds ||
          report.duration ||
          selectedSession?.duration
      ),

    raw:
      data,
  };
}


function getRecommendationStyle(
  recommendation: string
) {
  const normalized =
    recommendation.toLowerCase();

  if (
    normalized.includes(
      "strong hire"
    )
  ) {
    return {
      label:
        "Strong Hire",
      className:
        "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    };
  }

  if (
    normalized === "hire" ||
    normalized.includes(
      "recommend"
    )
  ) {
    return {
      label:
        recommendation,
      className:
        "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    };
  }

  if (
    normalized.includes(
      "consider"
    )
  ) {
    return {
      label:
        recommendation,
      className:
        "border-amber-400/30 bg-amber-400/10 text-amber-300",
    };
  }

  return {
    label:
      recommendation,
    className:
      "border-rose-400/30 bg-rose-400/10 text-rose-300",
  };
}


function getScoreLabel(
  score: number
) {
  if (
    score >= 85
  ) {
    return "Excellent";
  }

  if (
    score >= 70
  ) {
    return "Strong";
  }

  if (
    score >= 55
  ) {
    return "Developing";
  }

  return "Needs work";
}


function MetricBar({
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
        border-white/[0.08]
        bg-black/20
        p-4
      "
    >
      <div
        className="
          mb-4
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
            text-sm
            text-zinc-400
          "
        >
          {icon}

          {label}
        </div>

        <span
          className="
            text-lg
            font-bold
            text-white
          "
        >
          {value}%
        </span>
      </div>

      <div
        className="
          h-2
          overflow-hidden
          rounded-full
          bg-white/[0.06]
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
              `${clampScore(
                value
              )}%`,
          }}
        />
      </div>
    </div>
  );
}


function InsightList({
  title,
  icon,
  items,
  emptyText,
  variant = "default",
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  emptyText: string;
  variant?: "default" | "positive" | "warning";
}) {
  const accent =
    variant === "positive"
      ? "text-emerald-300"
      : variant === "warning"
        ? "text-amber-300"
        : "text-violet-300";

  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.08]
        bg-black/20
        p-5
      "
    >
      <div
        className="
          mb-5
          flex
          items-center
          gap-3
        "
      >
        <div
          className={accent}
        >
          {icon}
        </div>

        <h3
          className="
            font-semibold
            text-white
          "
        >
          {title}
        </h3>
      </div>

      {
        items.length ? (
          <div
            className="
              space-y-3
            "
          >
            {
              items.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      `${item}-${index}`
                    }
                    className="
                      flex
                      gap-3
                      text-sm
                      leading-6
                      text-zinc-400
                    "
                  >
                    <span
                      className={`
                        mt-2
                        h-1.5
                        w-1.5
                        shrink-0
                        rounded-full
                        ${
                          variant ===
                          "positive"
                            ? "bg-emerald-400"
                            : variant ===
                              "warning"
                              ? "bg-amber-400"
                              : "bg-violet-400"
                        }
                      `}
                    />

                    <span>
                      {item}
                    </span>
                  </div>
                )
              )
            }
          </div>
        ) : (
          <p
            className="
              text-sm
              leading-6
              text-zinc-500
            "
          >
            {emptyText}
          </p>
        )
      }
    </div>
  );
}


function Reports() {
  const navigate =
    useNavigate();

  const [
    sessions,
    setSessions,
  ] =
    useState<
      ReportSession[]
    >([]);

  const [
    selectedSessionId,
    setSelectedSessionId,
  ] =
    useState("");

  const [
    report,
    setReport,
  ] =
    useState<
      ReportData | null
    >(null);

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
    activeTab,
    setActiveTab,
  ] =
    useState<
      "overview" |
      "intelligence" |
      "signals"
    >(
      "overview"
    );


  const selectedSession =
    useMemo(
      () =>
        sessions.find(
          (
            session
          ) =>
            session.id ===
            selectedSessionId
        ) ||
        sessions[0],
      [
        sessions,
        selectedSessionId,
      ]
    );


  const recommendation =
    report
      ? getRecommendationStyle(
          report.recommendation
        )
      : null;


  async function loadReports(
    isRefresh = false
  ) {
    try {
      if (
        isRefresh
      ) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        sessionsResponse,
        latestReportResponse,
      ] =
        await Promise.allSettled(
          [
            getInterviewSessions(),
            getLatestReport(),
          ]
        );

      let normalizedSessions:
        ReportSession[] =
        [];

      if (
        sessionsResponse.status ===
        "fulfilled"
      ) {
        normalizedSessions =
          normalizeSessions(
            sessionsResponse.value
          );

        setSessions(
          normalizedSessions
        );

        setSelectedSessionId(
          (
            current
          ) =>
            current ||
            normalizedSessions[0]
              ?.id ||
            ""
        );
      }

      if (
        latestReportResponse.status ===
        "fulfilled"
      ) {
        const normalized =
          normalizeReport(
            latestReportResponse.value,
            normalizedSessions[0]
          );

        setReport(
          normalized
        );
      } else if (
        normalizedSessions.length
      ) {
        setReport(
          normalizeReport(
            normalizedSessions[0].raw,
            normalizedSessions[0]
          )
        );
      } else {
        setReport(null);
      }

      if (
        sessionsResponse.status ===
          "rejected" &&
        latestReportResponse.status ===
          "rejected"
      ) {
        setError(
          "Report data could not be loaded. The frontend is ready, but the report backend is not returning usable data yet."
        );
      }
    } catch (
      err
    ) {
      console.error(
        "Reports loading failed:",
        err
      );

      setError(
        "Report data could not be loaded. The frontend is ready, but the report backend is not returning usable data yet."
      );

      setReport(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  useEffect(
    () => {
      loadReports();
    },
    []
  );


  useEffect(
    () => {
      if (
        !selectedSession
      ) {
        return;
      }

      if (
        report
      ) {
        const roleMatches =
          report.role ===
          selectedSession.role;

        if (
          !roleMatches
        ) {
          setReport(
            normalizeReport(
              selectedSession.raw,
              selectedSession
            )
          );
        }
      }
    },
    [
      selectedSessionId,
    ]
  );


  function downloadReport() {
    if (
      !report
    ) {
      return;
    }

    const content = `
HireSense AI Interview Intelligence Report
==========================================

INTERVIEW CONTEXT
Role: ${report.role}
Experience Level: ${report.level}
Overall Score: ${report.overallScore}%
Recommendation: ${report.recommendation}
Questions Answered: ${report.questionsAnswered || "Not available"}
Duration: ${report.duration}

PERFORMANCE SUMMARY
${report.summary}

CORE SCORES
Technical: ${report.technicalScore}%
Communication: ${report.communicationScore}%
Confidence: ${report.confidenceScore}%

TECHNICAL ANALYSIS
${report.technicalAnalysis}

COMMUNICATION ANALYSIS
${report.communicationAnalysis}

CONFIDENCE ANALYSIS
${report.confidenceAnalysis}

STRENGTHS
${report.strengths.length
  ? report.strengths
      .map(
        (
          item
        ) =>
          `• ${item}`
      )
      .join("\n")
  : "No specific strengths were returned."}

AREAS FOR IMPROVEMENT
${report.weaknesses.length
  ? report.weaknesses
      .map(
        (
          item
        ) =>
          `• ${item}`
      )
      .join("\n")
  : "No specific improvement areas were returned."}

RECOMMENDED NEXT STEPS
${report.recommendations.length
  ? report.recommendations
      .map(
        (
          item
        ) =>
          `• ${item}`
      )
      .join("\n")
  : "Continue practicing to build a broader performance profile."}

RECRUITER NOTES
${report.hiringNotes}

Generated by HireSense AI
    `
      .trim();

    const blob =
      new Blob(
        [
          content,
        ],
        {
          type:
            "text/plain;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href =
      url;

    anchor.download =
      `HireSense_Report_${report.role.replace(
        /\s+/g,
        "_"
      )}.txt`;

    document.body.appendChild(
      anchor
    );

    anchor.click();

    document.body.removeChild(
      anchor
    );

    URL.revokeObjectURL(
      url
    );
  }


  if (
    loading
  ) {
    return (
      <div
        className="
          flex
          min-h-[70vh]
          items-center
          justify-center
          px-6
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-5
            text-center
          "
        >
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-3xl
              border
              border-violet-400/20
              bg-violet-500/10
              text-violet-300
            "
          >
            <Loader2
              size={28}
              className="
                animate-spin
              "
            />
          </div>

          <div>
            <h2
              className="
                text-xl
                font-semibold
                text-white
              "
            >
              Loading report intelligence
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-zinc-500
              "
            >
              Synchronizing interview
              performance data.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1800px]
        px-4
        pb-16
        pt-4
        sm:px-6
        xl:px-8
      "
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-white/[0.08]
          bg-gradient-to-br
          from-[#10111d]
          via-[#0b0d16]
          to-[#111426]
          p-6
          sm:p-8
          xl:p-10
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
            bg-violet-500/10
            blur-[100px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-[20%]
            h-40
            w-72
            rounded-full
            bg-cyan-400/[0.05]
            blur-[100px]
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
                mb-4
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
              <Sparkles
                size={13}
              />

              Performance intelligence
            </div>

            <h1
              className="
                text-3xl
                font-semibold
                tracking-tight
                text-white
                sm:text-4xl
                xl:text-5xl
              "
            >
              Interview Reports
            </h1>

            <p
              className="
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-zinc-400
                sm:text-base
              "
            >
              Your recruiter-style
              performance breakdown across
              interview quality,
              communication, confidence,
              technical ability, and
              career readiness.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            <button
              type="button"
              onClick={() =>
                loadReports(true)
              }
              disabled={
                refreshing
              }
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/[0.1]
                bg-white/[0.04]
                px-5
                text-sm
                font-semibold
                text-zinc-300
                transition
                hover:border-white/[0.18]
                hover:bg-white/[0.07]
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
              type="button"
              onClick={
                downloadReport
              }
              disabled={
                !report
              }
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-cyan-400/20
                bg-gradient-to-r
                from-violet-600
                to-cyan-500
                px-5
                text-sm
                font-semibold
                text-white
                shadow-[0_12px_40px_rgba(99,102,241,0.18)]
                transition
                hover:brightness-110
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Download
                size={16}
              />

              Export report
            </button>
          </div>
        </div>
      </section>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {
        error && (
          <div
            className="
              mt-5
              flex
              gap-3
              rounded-2xl
              border
              border-amber-400/20
              bg-amber-400/[0.06]
              px-5
              py-4
              text-sm
              text-amber-200
            "
          >
            <CircleAlert
              size={18}
              className="
                mt-0.5
                shrink-0
              "
            />

            <p>
              {error}
            </p>
          </div>
        )
      }


      {/* ================================================= */}
      {/* EMPTY STATE */}
      {/* ================================================= */}

      {
        !report &&
        !sessions.length && (
          <section
            className="
              mt-6
              flex
              min-h-[520px]
              flex-col
              items-center
              justify-center
              overflow-hidden
              rounded-[28px]
              border
              border-white/[0.08]
              bg-[#0b0d16]/90
              px-6
              text-center
            "
          >
            <div
              className="
                relative
                mb-8
                flex
                h-28
                w-28
                items-center
                justify-center
                rounded-full
                border
                border-violet-400/20
                bg-violet-500/[0.06]
              "
            >
              <div
                className="
                  absolute
                  h-36
                  w-36
                  rounded-full
                  border
                  border-cyan-400/[0.08]
                "
              />

              <FileText
                size={38}
                className="
                  text-violet-300
                "
              />
            </div>

            <div
              className="
                max-w-xl
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.3em]
                  text-cyan-300
                "
              >
                Report center
              </p>

              <h2
                className="
                  mt-4
                  text-2xl
                  font-semibold
                  text-white
                  sm:text-3xl
                "
              >
                No interview report yet
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  leading-7
                  text-zinc-500
                "
              >
                Complete a mock interview
                and HireSense will turn
                your performance signals
                into a structured
                recruiter-style report.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/mock-interview"
                )
              }
              className="
                mt-8
                inline-flex
                min-h-12
                items-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-violet-600
                to-cyan-500
                px-6
                text-sm
                font-semibold
                text-white
                shadow-[0_15px_50px_rgba(99,102,241,0.2)]
                transition
                hover:brightness-110
              "
            >
              Start an interview

              <ArrowRight
                size={16}
              />
            </button>
          </section>
        )
      }


      {
        report && (
          <>
            {/* ============================================= */}
            {/* SESSION SELECTOR */}
            {/* ============================================= */}

            {
              sessions.length > 0 && (
                <section
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-[#0b0d16]/80
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      xl:flex-row
                      xl:items-center
                      xl:justify-between
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.28em]
                          text-zinc-500
                        "
                      >
                        Interview history
                      </p>

                      <p
                        className="
                          mt-2
                          text-sm
                          text-zinc-400
                        "
                      >
                        Switch between
                        completed interview
                        sessions.
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        max-w-full
                        gap-2
                        overflow-x-auto
                        pb-1
                      "
                    >
                      {
                        sessions
                          .slice(
                            0,
                            8
                          )
                          .map(
                            (
                              session
                            ) => (
                              <button
                                key={
                                  session.id
                                }
                                type="button"
                                onClick={() =>
                                  setSelectedSessionId(
                                    session.id
                                  )
                                }
                                className={`
                                  min-w-[180px]
                                  rounded-xl
                                  border
                                  px-4
                                  py-3
                                  text-left
                                  transition
                                  ${
                                    selectedSession
                                      ?.id ===
                                    session.id
                                      ? `
                                        border-violet-400/30
                                        bg-violet-500/10
                                      `
                                      : `
                                        border-white/[0.07]
                                        bg-white/[0.025]
                                        hover:bg-white/[0.05]
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
                                      font-semibold
                                      text-white
                                    "
                                  >
                                    {
                                      session.role
                                    }
                                  </span>

                                  <span
                                    className="
                                      text-xs
                                      font-bold
                                      text-cyan-300
                                    "
                                  >
                                    {
                                      session.score
                                    }%
                                  </span>
                                </div>

                                <div
                                  className="
                                    mt-1
                                    text-xs
                                    text-zinc-500
                                  "
                                >
                                  {
                                    session.level
                                  }
                                  {" · "}
                                  {
                                    session.date
                                  }
                                </div>
                              </button>
                            )
                          )
                      }
                    </div>
                  </div>
                </section>
              )
            }


            {/* ============================================= */}
            {/* REPORT HERO */}
            {/* ============================================= */}

            <section
              className="
                mt-6
                grid
                gap-6
                xl:grid-cols-[1.35fr_0.65fr]
              "
            >
              <div
                className="
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-white/[0.08]
                  bg-[#0b0d16]/90
                  p-6
                  sm:p-8
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-8
                    lg:flex-row
                    lg:items-center
                  "
                >
                  <div
                    className="
                      relative
                      flex
                      h-48
                      w-48
                      shrink-0
                      items-center
                      justify-center
                      self-center
                      rounded-full
                      border
                      border-violet-400/15
                      bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.22),rgba(5,8,20,0.3)_45%,transparent_70%)]
                    "
                  >
                    <div
                      className="
                        absolute
                        inset-3
                        rounded-full
                        border
                        border-cyan-400/[0.12]
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-8
                        rounded-full
                        border
                        border-violet-400/[0.16]
                      "
                    />

                    <div
                      className="
                        relative
                        flex
                        flex-col
                        items-center
                      "
                    >
                      <span
                        className="
                          text-5xl
                          font-bold
                          tracking-tight
                          text-white
                        "
                      >
                        {
                          report.overallScore
                        }
                      </span>

                      <span
                        className="
                          mt-1
                          text-xs
                          font-semibold
                          text-zinc-500
                        "
                      >
                        OVERALL SCORE
                      </span>
                    </div>
                  </div>

                  <div
                    className="
                      min-w-0
                    "
                  >
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
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.28em]
                          text-cyan-300
                        "
                      >
                        Recruiter assessment
                      </span>

                      {
                        recommendation && (
                          <span
                            className={`
                              rounded-full
                              border
                              px-3
                              py-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.15em]
                              ${recommendation.className}
                            `}
                          >
                            {
                              recommendation.label
                            }
                          </span>
                        )
                      }
                    </div>

                    <h2
                      className="
                        mt-4
                        text-2xl
                        font-semibold
                        text-white
                        sm:text-3xl
                      "
                    >
                      {
                        getScoreLabel(
                          report.overallScore
                        )
                      }{" "}
                      interview performance
                    </h2>

                    <p
                      className="
                        mt-4
                        max-w-2xl
                        text-sm
                        leading-7
                        text-zinc-400
                      "
                    >
                      {
                        report.summary
                      }
                    </p>

                    <div
                      className="
                        mt-6
                        flex
                        flex-wrap
                        gap-3
                      "
                    >
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          border-white/[0.08]
                          bg-white/[0.03]
                          px-4
                          py-2
                          text-xs
                          text-zinc-400
                        "
                      >
                        <Target
                          size={14}
                          className="
                            text-violet-300
                          "
                        />

                        {
                          report.role
                        }
                      </span>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          border-white/[0.08]
                          bg-white/[0.03]
                          px-4
                          py-2
                          text-xs
                          text-zinc-400
                        "
                      >
                        <Gauge
                          size={14}
                          className="
                            text-cyan-300
                          "
                        />

                        {
                          report.level
                        }
                      </span>

                      {
                        report.questionsAnswered >
                          0 && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              border-white/[0.08]
                              bg-white/[0.03]
                              px-4
                              py-2
                              text-xs
                              text-zinc-400
                            "
                          >
                            <Brain
                              size={14}
                              className="
                                text-emerald-300
                              "
                            />

                            {
                              report.questionsAnswered
                            }{" "}
                            answers analyzed
                          </span>
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>


              <div
                className="
                  rounded-[28px]
                  border
                  border-white/[0.08]
                  bg-[#0b0d16]/90
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
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-cyan-400/20
                      bg-cyan-400/[0.08]
                      text-cyan-300
                    "
                  >
                    <UserCheck
                      size={20}
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.24em]
                        text-zinc-500
                      "
                    >
                      Recruiter verdict
                    </p>

                    <p
                      className="
                        mt-1
                        text-lg
                        font-semibold
                        text-white
                      "
                    >
                      {
                        report.recommendation
                      }
                    </p>
                  </div>
                </div>

                <div
                  className="
                    my-6
                    h-px
                    bg-white/[0.07]
                  "
                />

                <p
                  className="
                    text-sm
                    leading-7
                    text-zinc-400
                  "
                >
                  {
                    report.hiringNotes
                  }
                </p>

                {
                  selectedSession && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/playback/${selectedSession.id}`
                        )
                      }
                      className="
                        mt-6
                        inline-flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        border
                        border-white/[0.08]
                        bg-white/[0.03]
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-zinc-300
                        transition
                        hover:border-violet-400/20
                        hover:bg-violet-500/[0.06]
                      "
                    >
                      Review interview playback

                      <ChevronRight
                        size={17}
                      />
                    </button>
                  )
                }
              </div>
            </section>


            {/* ============================================= */}
            {/* METRICS */}
            {/* ============================================= */}

            <section
              className="
                mt-6
                grid
                gap-4
                md:grid-cols-3
              "
            >
              <MetricBar
                label="Technical ability"
                value={
                  report.technicalScore
                }
                icon={
                  <Brain
                    size={16}
                    className="
                      text-violet-300
                    "
                  />
                }
              />

              <MetricBar
                label="Communication"
                value={
                  report.communicationScore
                }
                icon={
                  <Mic
                    size={16}
                    className="
                      text-cyan-300
                    "
                  />
                }
              />

              <MetricBar
                label="Confidence"
                value={
                  report.confidenceScore
                }
                icon={
                  <ShieldCheck
                    size={16}
                    className="
                      text-emerald-300
                    "
                  />
                }
              />
            </section>


            {/* ============================================= */}
            {/* TABS */}
            {/* ============================================= */}

            <section
              className="
                mt-6
              "
            >
              <div
                className="
                  mb-5
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {
                  [
                    {
                      id:
                        "overview",
                      label:
                        "Performance",
                      icon:
                        <Activity
                          size={15}
                        />,
                    },
                    {
                      id:
                        "intelligence",
                      label:
                        "AI Intelligence",
                      icon:
                        <Sparkles
                          size={15}
                        />,
                    },
                    {
                      id:
                        "signals",
                      label:
                        "Multimodal Signals",
                      icon:
                        <Gauge
                          size={15}
                        />,
                    },
                  ].map(
                    (
                      tab
                    ) => (
                      <button
                        key={
                          tab.id
                        }
                        type="button"
                        onClick={() =>
                          setActiveTab(
                            tab.id as
                              | "overview"
                              | "intelligence"
                              | "signals"
                          )
                        }
                        className={`
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          transition
                          ${
                            activeTab ===
                            tab.id
                              ? `
                                border-violet-400/30
                                bg-violet-500/10
                                text-violet-200
                              `
                              : `
                                border-white/[0.07]
                                bg-white/[0.02]
                                text-zinc-500
                                hover:bg-white/[0.05]
                                hover:text-zinc-300
                              `
                          }
                        `}
                      >
                        {
                          tab.icon
                        }

                        {
                          tab.label
                        }
                      </button>
                    )
                  )
                }
              </div>


              {/* =========================================== */}
              {/* OVERVIEW TAB */}
              {/* =========================================== */}

              {
                activeTab ===
                  "overview" && (
                  <div
                    className="
                      grid
                      gap-6
                      xl:grid-cols-2
                    "
                  >
                    <div
                      className="
                        space-y-6
                      "
                    >
                      <InsightList
                        title="Technical assessment"
                        icon={
                          <Brain
                            size={20}
                          />
                        }
                        items={[
                          report.technicalAnalysis,
                        ].filter(
                          Boolean
                        )}
                        emptyText="
                          Technical feedback
                          will appear after
                          interview analysis.
                        "
                      />

                      <InsightList
                        title="Communication assessment"
                        icon={
                          <Mic
                            size={20}
                          />
                        }
                        items={[
                          report.communicationAnalysis,
                        ].filter(
                          Boolean
                        )}
                        emptyText="
                          Communication
                          feedback will appear
                          after speech analysis.
                        "
                      />

                      <InsightList
                        title="Confidence assessment"
                        icon={
                          <ShieldCheck
                            size={20}
                          />
                        }
                        items={[
                          report.confidenceAnalysis,
                        ].filter(
                          Boolean
                        )}
                        emptyText="
                          Confidence signals
                          will appear when
                          enough interview
                          data is available.
                        "
                      />
                    </div>

                    <div
                      className="
                        space-y-6
                      "
                    >
                      <InsightList
                        title="Strengths detected"
                        icon={
                          <CheckCircle2
                            size={20}
                          />
                        }
                        items={
                          report.strengths
                        }
                        emptyText="
                          Complete additional
                          interviews to identify
                          consistent strengths.
                        "
                        variant="positive"
                      />

                      <InsightList
                        title="Priority improvements"
                        icon={
                          <AlertTriangle
                            size={20}
                          />
                        }
                        items={
                          report.weaknesses
                        }
                        emptyText="
                          No major improvement
                          areas have been
                          identified yet.
                        "
                        variant="warning"
                      />
                    </div>
                  </div>
                )
              }


              {/* =========================================== */}
              {/* AI INTELLIGENCE TAB */}
              {/* =========================================== */}

              {
                activeTab ===
                  "intelligence" && (
                  <div
                    className="
                      grid
                      gap-6
                      xl:grid-cols-[1.15fr_0.85fr]
                    "
                  >
                    <div
                      className="
                        rounded-[28px]
                        border
                        border-white/[0.08]
                        bg-[#0b0d16]/90
                        p-6
                        sm:p-8
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
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-violet-400/20
                            bg-violet-500/[0.08]
                            text-violet-300
                          "
                        >
                          <Lightbulb
                            size={22}
                          />
                        </div>

                        <div>
                          <p
                            className="
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.26em]
                              text-violet-300
                            "
                          >
                            Improvement strategy
                          </p>

                          <h3
                            className="
                              mt-1
                              text-xl
                              font-semibold
                              text-white
                            "
                          >
                            Your next moves
                          </h3>
                        </div>
                      </div>

                      <div
                        className="
                          mt-8
                          space-y-4
                        "
                      >
                        {
                          report.recommendations
                            .length ? (
                            report.recommendations.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={
                                    `${item}-${index}`
                                  }
                                  className="
                                    flex
                                    gap-4
                                    rounded-2xl
                                    border
                                    border-white/[0.07]
                                    bg-white/[0.025]
                                    p-4
                                  "
                                >
                                  <div
                                    className="
                                      flex
                                      h-8
                                      w-8
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-lg
                                      bg-violet-500/10
                                      text-xs
                                      font-bold
                                      text-violet-300
                                    "
                                  >
                                    {
                                      index + 1
                                    }
                                  </div>

                                  <p
                                    className="
                                      pt-1
                                      text-sm
                                      leading-6
                                      text-zinc-400
                                    "
                                  >
                                    {
                                      item
                                    }
                                  </p>
                                </div>
                              )
                            )
                          ) : (
                            <div
                              className="
                                rounded-2xl
                                border
                                border-dashed
                                border-white/[0.08]
                                px-5
                                py-10
                                text-center
                                text-sm
                                leading-7
                                text-zinc-500
                              "
                            >
                              Complete more
                              interviews to
                              generate
                              personalized AI
                              recommendations.
                            </div>
                          )
                        }
                      </div>
                    </div>

                    <div
                      className="
                        rounded-[28px]
                        border
                        border-white/[0.08]
                        bg-[#0b0d16]/90
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
                        <div>
                          <p
                            className="
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.26em]
                              text-cyan-300
                            "
                          >
                            Career readiness
                          </p>

                          <h3
                            className="
                              mt-2
                              text-xl
                              font-semibold
                              text-white
                            "
                          >
                            Recruiter signals
                          </h3>
                        </div>

                        <Trophy
                          size={22}
                          className="
                            text-amber-300
                          "
                        />
                      </div>

                      <div
                        className="
                          mt-8
                          space-y-4
                        "
                      >
                        {
                          [
                            {
                              label:
                                "Technical readiness",
                              value:
                                report.technicalScore,
                              icon:
                                <Brain
                                  size={16}
                                />,
                            },
                            {
                              label:
                                "Communication readiness",
                              value:
                                report.communicationScore,
                              icon:
                                <Mic
                                  size={16}
                                />,
                            },
                            {
                              label:
                                "Confidence signal",
                              value:
                                report.confidenceScore,
                              icon:
                                <ShieldCheck
                                  size={16}
                                />,
                            },
                          ].map(
                            (
                              item
                            ) => (
                              <div
                                key={
                                  item.label
                                }
                                className="
                                  rounded-2xl
                                  border
                                  border-white/[0.07]
                                  bg-white/[0.025]
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
                                  <div
                                    className="
                                      flex
                                      items-center
                                      gap-2
                                      text-sm
                                      text-zinc-400
                                    "
                                  >
                                    <span
                                      className="
                                        text-cyan-300
                                      "
                                    >
                                      {
                                        item.icon
                                      }
                                    </span>

                                    {
                                      item.label
                                    }
                                  </div>

                                  <span
                                    className="
                                      font-bold
                                      text-white
                                    "
                                  >
                                    {
                                      item.value
                                    }%
                                  </span>
                                </div>
                              </div>
                            )
                          )
                        }
                      </div>
                    </div>
                  </div>
                )
              }


              {/* =========================================== */}
              {/* SIGNALS TAB */}
              {/* =========================================== */}

              {
                activeTab ===
                  "signals" && (
                  <div
                    className="
                      grid
                      gap-6
                      xl:grid-cols-2
                    "
                  >
                    <InsightList
                      title="Speech intelligence"
                      icon={
                        <Mic
                          size={20}
                        />
                      }
                      items={
                        report.speechInsights
                      }
                      emptyText="
                        Speech insights will
                        appear when the speech
                        analysis backend returns
                        usable metrics.
                      "
                    />

                    <InsightList
                      title="Vision intelligence"
                      icon={
                        <Video
                          size={20}
                        />
                      }
                      items={
                        report.visionInsights
                      }
                      emptyText="
                        Vision insights will
                        appear when camera
                        analysis data is
                        available.
                      "
                    />

                    <div
                      className="
                        rounded-2xl
                        border
                        border-white/[0.08]
                        bg-black/20
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
                        <Clock3
                          size={20}
                          className="
                            text-cyan-300
                          "
                        />

                        <div>
                          <p
                            className="
                              font-semibold
                              text-white
                            "
                          >
                            Session duration
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              text-zinc-500
                            "
                          >
                            Interview time
                            captured for this
                            report.
                          </p>
                        </div>
                      </div>

                      <p
                        className="
                          mt-8
                          text-4xl
                          font-bold
                          text-white
                        "
                      >
                        {
                          report.duration
                        }
                      </p>
                    </div>

                    <div
                      className="
                        rounded-2xl
                        border
                        border-white/[0.08]
                        bg-black/20
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
                        <Brain
                          size={20}
                          className="
                            text-violet-300
                          "
                        />

                        <div>
                          <p
                            className="
                              font-semibold
                              text-white
                            "
                          >
                            Questions analyzed
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              text-zinc-500
                            "
                          >
                            AI evaluation
                            coverage for this
                            session.
                          </p>
                        </div>
                      </div>

                      <p
                        className="
                          mt-8
                          text-4xl
                          font-bold
                          text-white
                        "
                      >
                        {
                          report.questionsAnswered ||
                          "--"
                        }
                      </p>
                    </div>
                  </div>
                )
              }
            </section>
          </>
        )
      }
    </div>
  );
}


export default Reports;