import { useState } from "react";
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  BriefcaseBusiness,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";



const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

type ResumeResult = {
  ats_score?: number;
  resume_text?: string;
  skills?: string[];
  missing_skills?: string[];
  readiness?: number;
  verdict?: string;
  recommended_roles?: string[];
  strengths?: string[];
  weaknesses?: string[];
};

type JDResult = {
  match_score?: number;
  missing_skills?: string[];
  keywords_to_add?: string[];
};

function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);

  const [jobDescription, setJobDescription] =
    useState("");

  const [jdResult, setJdResult] =
    useState<JDResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [jdLoading, setJdLoading] =
    useState(false);

  const [result, setResult] =
    useState<ResumeResult | null>(null);

  function saveCandidateScore(
    key: string,
    score: number,
  ) {
    const safeScore = Math.max(
      0,
      Math.min(100, Number(score) || 0),
    );

    localStorage.setItem(
      key,
      safeScore.toString(),
    );

    const existingData = JSON.parse(
      localStorage.getItem(
        "hiresense_candidate_intelligence",
      ) || "{}",
    );

    const updatedData = {
      ...existingData,
      [key]: safeScore,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(
      "hiresense_candidate_intelligence",
      JSON.stringify(updatedData),
    );
  }

  async function analyzeResume() {
    if (!file) {
      toast.error("Please upload a resume");
      return;
    }

    try {
      setLoading(true);

      toast.loading(
        "Analyzing resume...",
        {
          id: "resume",
        },
      );

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/resume/analyze`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {

  const errorData =
    await response.json()
      .catch(
        () => null
      );

  console.error(
    "Resume API Error:",
    response.status,
    errorData
  );

  throw new Error(
    errorData?.detail ||
    `Resume analysis failed with status ${response.status}`
  );
}

      const data =
        (await response.json()) as ResumeResult;

      setResult(data);

      const atsScore =
        Number(data.ats_score) || 0;

      saveCandidateScore(
        "ats_score",
        atsScore,
      );

      toast.success(
        `Resume analyzed. ATS score ${atsScore}% saved to Candidate Intelligence.`,
        {
          id: "resume",
        },
      );
    } catch (error: any) {

  console.error(
    "Resume Analysis Error:",
    error
  );

  toast.error(
    error?.message ||
    "Resume analysis failed",
    {
      id: "resume",
    }
  );
} finally {
      setLoading(false);
    }
  }

  async function matchJobDescription() {
    if (!result?.resume_text) {
      toast.error(
        "Analyze resume first",
      );
      return;
    }

    if (!jobDescription.trim()) {
      toast.error(
        "Paste a job description first",
      );
      return;
    }

    try {
      setJdLoading(true);

      toast.loading(
        "Matching resume with job description...",
        {
          id: "jd-match",
        },
      );

      const response = await fetch(
        `${API_URL}/api/resume/match-jd`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            resume_text:
              result.resume_text,
            job_description:
              jobDescription,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "JD Match failed",
        );
      }

      const data =
        (await response.json()) as JDResult;

      setJdResult(data);

      saveCandidateScore(
        "jd_match_score",
        Number(data.match_score) || 0,
      );

      toast.success(
        "JD Match completed",
        {
          id: "jd-match",
        },
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "JD Match failed",
        {
          id: "jd-match",
        },
      );
    } finally {
      setJdLoading(false);
    }
  }

  function handleFileChange(
    selectedFile: File | null,
  ) {
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setJdResult(null);
  }

  const atsScore =
    Number(result?.ats_score) || 0;

  const skillsCount =
    result?.skills?.length || 0;

  const missingSkillsCount =
    result?.missing_skills?.length || 0;

  const readiness =
    Number(result?.readiness) || 0;

  const jdScore =
    Number(jdResult?.match_score) || 0;

  return (
    <div className="w-full px-6 pb-16 sm:px-8 lg:px-10">

        {/* PAGE HEADER */}
        <section className="mb-8 pt-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-400/80">
              RESUME INTELLIGENCE
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Resume Analyzer
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Analyze your resume for ATS compatibility,
            skills, recruiter readiness, and role
            alignment.
          </p>
        </section>

        {/* UPLOAD */}
        <section className="mb-6 rounded-2xl border border-white/[0.07] bg-[#090a10]/80 p-5 backdrop-blur-xl sm:p-6">

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
              <FileText
                size={17}
                className="text-cyan-300"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Upload your resume
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                PDF, DOC, or DOCX
              </p>
            </div>
          </div>

          <label
            htmlFor="resume-upload"
            className="
              group
              flex
              cursor-pointer
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-white/[0.09]
              bg-white/[0.015]
              px-5
              py-10
              text-center
              transition
              hover:border-cyan-400/30
              hover:bg-cyan-400/[0.025]
            "
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
              <Upload
                size={20}
                className="text-cyan-300 transition-transform group-hover:-translate-y-0.5"
              />
            </div>

            <p className="text-sm font-medium text-slate-200">
              {file
                ? file.name
                : "Choose a resume"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {file
                ? "Click to choose a different file"
                : "Upload your latest resume for analysis"}
            </p>

            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(event) => {
                handleFileChange(
                  event.target.files?.[0] ||
                    null,
                );
              }}
            />
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            {file ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 size={14} />
                Resume selected
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Maximum recommended file size: 10 MB
              </p>
            )}

            <button
              onClick={analyzeResume}
              disabled={!file || loading}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-violet-500
                to-cyan-400
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-[0_0_25px_rgba(139,92,246,0.15)]
                transition
                hover:-translate-y-0.5
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </section>

        {/* RESULTS */}
        {result && (
          <section className="space-y-6">

            {/* OVERVIEW */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-violet-400">
                    ANALYSIS
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Resume intelligence
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

                <Metric
                  label="ATS Score"
                  value={`${atsScore}%`}
                  icon={Target}
                  accent="cyan"
                />

                <Metric
                  label="Skills Found"
                  value={skillsCount}
                  icon={CheckCircle2}
                  accent="emerald"
                />

                <Metric
                  label="Missing Skills"
                  value={missingSkillsCount}
                  icon={AlertTriangle}
                  accent="amber"
                />

                <Metric
                  label="Interview Readiness"
                  value={`${readiness}%`}
                  icon={Sparkles}
                  accent="violet"
                />

              </div>
            </div>

            {/* RECRUITER SUMMARY */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

              <InfoCard
                label="RECRUITER VERDICT"
                value={
                  result.verdict ||
                  "Pending"
                }
                icon={BriefcaseBusiness}
                accent="emerald"
              />

              <InfoCard
                label="RECOMMENDED ROLES"
                value={`${result.recommended_roles?.length || 0} roles`}
                icon={Target}
                accent="violet"
              />

              <InfoCard
                label="ATS STATUS"
                value={
                  atsScore >= 80
                    ? "Strong match"
                    : atsScore >= 60
                      ? "Needs improvement"
                      : "Needs attention"
                }
                icon={FileText}
                accent="cyan"
              />

            </div>

            {/* SKILLS */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              <TagSection
                title="Skills Found"
                items={result.skills || []}
                variant="positive"
              />

              <TagSection
                title="Missing Skills"
                items={
                  result.missing_skills ||
                  []
                }
                variant="warning"
              />

            </div>

            {/* STRENGTHS / WEAKNESSES */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              <ListSection
                title="Strengths"
                items={result.strengths || []}
                variant="positive"
              />

              <ListSection
                title="Areas to Improve"
                items={result.weaknesses || []}
                variant="warning"
              />

            </div>

            {/* RECOMMENDED ROLES */}
            {result.recommended_roles &&
              result.recommended_roles.length >
                0 && (
                <section className="rounded-2xl border border-white/[0.07] bg-[#090a10]/80 p-5 backdrop-blur-xl">

                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10">
                      <BriefcaseBusiness
                        size={16}
                        className="text-violet-300"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-violet-400">
                        CAREER FIT
                      </p>

                      <h2 className="text-sm font-semibold text-white">
                        Recommended roles
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {result.recommended_roles.map(
                      (role, index) => (
                        <span
                          key={`${role}-${index}`}
                          className="rounded-lg border border-violet-400/15 bg-violet-400/[0.06] px-3 py-2 text-xs font-medium text-violet-200"
                        >
                          {role}
                        </span>
                      ),
                    )}
                  </div>

                </section>
              )}

            {/* JD MATCHER */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#090a10]/80 p-5 backdrop-blur-xl sm:p-6">

              <div className="mb-5 flex items-start justify-between gap-4">

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-400">
                    JOB MATCH
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Match your resume to a job
                  </h2>

                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Compare your analyzed resume against
                    a specific job description.
                  </p>
                </div>

                <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10 sm:flex">
                  <Search
                    size={16}
                    className="text-cyan-300"
                  />
                </div>

              </div>

              <textarea
                value={jobDescription}
                onChange={(event) =>
                  setJobDescription(
                    event.target.value,
                  )
                }
                placeholder="Paste the job description here..."
                className="
                  min-h-40
                  w-full
                  resize-y
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-black/20
                  p-4
                  text-sm
                  leading-relaxed
                  text-slate-200
                  outline-none
                  placeholder:text-slate-600
                  transition
                  focus:border-cyan-400/30
                  focus:bg-black/30
                "
              />

              <div className="mt-4 flex justify-end">
                <button
                  onClick={matchJobDescription}
                  disabled={
                    jdLoading ||
                    !jobDescription.trim()
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-cyan-400/20
                    bg-cyan-400/10
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-cyan-200
                    transition
                    hover:border-cyan-400/30
                    hover:bg-cyan-400/15
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {jdLoading ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Matching...
                    </>
                  ) : (
                    <>
                      <Search size={15} />
                      Match Resume
                    </>
                  )}
                </button>
              </div>

              {jdResult && (
                <div className="mt-6 border-t border-white/[0.06] pt-6">

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
                        MATCH RESULT
                      </p>

                      <h3 className="mt-1 text-sm font-semibold text-white">
                        Job compatibility
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-semibold text-cyan-300">
                        {jdScore}%
                      </p>

                      <p className="text-[10px] text-slate-600">
                        Match score
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <TagSection
                      title="Missing Skills"
                      items={
                        jdResult.missing_skills ||
                        []
                      }
                      variant="warning"
                    />

                    <TagSection
                      title="Keywords to Add"
                      items={
                        jdResult.keywords_to_add ||
                        []
                      }
                      variant="positive"
                    />

                  </div>

                </div>
              )}

            </section>

          </section>
        )}

        </div>
      );
}

/* =========================================================
   METRIC
   ========================================================= */

function Metric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: typeof Target;
  accent:
    | "cyan"
    | "emerald"
    | "amber"
    | "violet";
}) {
  const styles = {
    cyan: {
      icon: "bg-cyan-400/10 text-cyan-300",
      value: "text-cyan-200",
    },
    emerald: {
      icon: "bg-emerald-400/10 text-emerald-300",
      value: "text-emerald-200",
    },
    amber: {
      icon: "bg-amber-400/10 text-amber-300",
      value: "text-amber-200",
    },
    violet: {
      icon: "bg-violet-400/10 text-violet-300",
      value: "text-violet-200",
    },
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#090a10]/80 p-4 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[accent].icon}`}
        >
          <Icon size={15} />
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-semibold ${styles[accent].value}`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   INFO CARD
   ========================================================= */

function InfoCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Target;
  accent:
    | "cyan"
    | "emerald"
    | "violet";
}) {
  const styles = {
    cyan: {
      icon: "bg-cyan-400/10 text-cyan-300",
      label: "text-cyan-400",
    },
    emerald: {
      icon: "bg-emerald-400/10 text-emerald-300",
      label: "text-emerald-400",
    },
    violet: {
      icon: "bg-violet-400/10 text-violet-300",
      label: "text-violet-400",
    },
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#090a10]/80 p-5 backdrop-blur-xl">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[accent].icon}`}
        >
          <Icon size={15} />
        </div>
      </div>

      <p
        className={`text-[10px] font-medium uppercase tracking-[0.18em] ${styles[accent].label}`}
      >
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   TAG SECTION
   ========================================================= */

function TagSection({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "positive" | "warning";
}) {
  const styles =
    variant === "positive"
      ? {
          border:
            "border-emerald-400/10",
          bg:
            "bg-emerald-400/[0.04]",
          text:
            "text-emerald-300",
        }
      : {
          border:
            "border-amber-400/10",
          bg:
            "bg-amber-400/[0.04]",
          text:
            "text-amber-300",
        };

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#090a10]/80 p-5 backdrop-blur-xl">

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <span className="text-[10px] text-slate-600">
          {items.length} found
        </span>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map(
            (item, index) => (
              <span
                key={`${item}-${index}`}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${styles.border} ${styles.bg} ${styles.text}`}
              >
                {item}
              </span>
            ),
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-600">
          Nothing detected.
        </p>
      )}

    </section>
  );
}

/* =========================================================
   LIST SECTION
   ========================================================= */

function ListSection({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "positive" | "warning";
}) {
  const positive =
    variant === "positive";

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#090a10]/80 p-5 backdrop-blur-xl">

      <h3 className="mb-4 text-sm font-semibold text-white">
        {title}
      </h3>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className="
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-white/[0.05]
                  bg-white/[0.015]
                  px-3
                  py-2.5
                "
              >
                {positive ? (
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />
                ) : (
                  <AlertTriangle
                    size={15}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />
                )}

                <p className="text-xs leading-relaxed text-slate-400">
                  {item}
                </p>
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-600">
          Nothing detected.
        </p>
      )}

    </section>
  );
}

export default ResumeAnalyzer;