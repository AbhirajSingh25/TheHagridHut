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
  BookOpen,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

export default function ResumeAnalyzer() {
  const { experience } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jdResult, setJdResult] = useState<JDResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [jdLoading, setJdLoading] = useState(false);
  const [result, setResult] = useState<ResumeResult | null>(null);

  function saveCandidateScore(key: string, score: number) {
    const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
    localStorage.setItem(key, safeScore.toString());

    const existingData = JSON.parse(
      localStorage.getItem("hiresense_candidate_intelligence") || "{}"
    );

    const updatedData = {
      ...existingData,
      [key]: safeScore,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(
      "hiresense_candidate_intelligence",
      JSON.stringify(updatedData)
    );
  }

  async function analyzeResume() {
    if (!file) {
      toast.error("Please select a resume file first");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Analyzing your resume...", { id: "resume" });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/resume/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail ||
            `Resume analysis failed with status ${response.status}`
        );
      }

      const data = (await response.json()) as ResumeResult;
      setResult(data);

      const atsScore = Number(data.ats_score) || 0;
      saveCandidateScore("ats_score", atsScore);

      toast.success(
        `Resume analyzed. ATS score ${atsScore}% recorded.`,
        { id: "resume" }
      );
    } catch (error: any) {
      console.error("Resume Analysis Error:", error);
      toast.error(error?.message || "Resume analysis failed", { id: "resume" });
    } finally {
      setLoading(false);
    }
  }

  async function matchJobDescription() {
    if (!result?.resume_text) {
      toast.error("Analyze your resume before matching against a job description");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Please paste a job description first");
      return;
    }

    try {
      setJdLoading(true);
      toast.loading("Comparing resume against job description...", {
        id: "jd-match",
      });

      const response = await fetch(`${API_URL}/api/resume/match-jd`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: result.resume_text,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail ||
            `Job match failed with status ${response.status}`
        );
      }

      const data = (await response.json()) as JDResult;
      setJdResult(data);

      const matchScore = Number(data.match_score) || 0;
      saveCandidateScore("jd_match_score", matchScore);

      toast.success(`Match score: ${matchScore}%`, { id: "jd-match" });
    } catch (error: any) {
      console.error("JD Match Error:", error);
      toast.error(error?.message || "Job description match failed", {
        id: "jd-match",
      });
    } finally {
      setJdLoading(false);
    }
  }

  function handleFileChange(selectedFile: File | null) {
    if (!selectedFile) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|doc|docx)$/i)) {
      toast.error("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setJdResult(null);
  }

  const atsScore = Number(result?.ats_score) || 0;
  const skillsCount = result?.skills?.length || 0;
  const missingSkillsCount = result?.missing_skills?.length || 0;
  const readiness = Number(result?.readiness) || 0;
  const jdScore = Number(jdResult?.match_score) || 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left font-sans">
      {/* Editorial Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5D6BE]/60 dark:bg-[#342C25] text-xs font-medium text-[#49372B] dark:text-[#E5D6BE] border border-[#49372B]/10 dark:border-[#E5D6BE]/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#AC7256]" />
          <span>Hagrid's Hut · Resume Workshop</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#302820] dark:text-[#FAF5EC]">
          Resume Workshop
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-[#6B5D50] dark:text-[#B8AFA3]">
          A quiet document workspace to review your resume. Upload your file to inspect structure, extract technical and professional skills, and align keywords with target roles.
        </p>
      </div>

      {/* Upload Sheet */}
      <section className="study-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-[#49372B]/10 dark:border-[#E5D6BE]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#AC7256]/10 text-[#AC7256] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Your Resume Document
              </h2>
              <p className="text-xs text-[#6B5D50] dark:text-[#B8AFA3]">
                Supports PDF, DOC, and DOCX (up to 10MB)
              </p>
            </div>
          </div>
        </div>

        <label
          htmlFor="resume-upload"
          className="group flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#49372B]/20 dark:border-[#E5D6BE]/20 bg-[#FAF5EC] dark:bg-[#342C25] px-6 py-10 text-center cursor-pointer hover:border-[#AC7256] transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-[#E5D6BE]/60 dark:bg-[#383029] text-[#49372B] dark:text-[#E5D6BE] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5 text-[#AC7256]" />
          </div>

          <p className="text-sm font-semibold text-[#302820] dark:text-[#FAF5EC]">
            {file ? file.name : "Choose a resume to review"}
          </p>

          <p className="text-xs text-[#6B5D50] dark:text-[#B8AFA3] mt-1">
            {file
              ? "Click to choose a different document"
              : "Drag and drop or browse from your computer"}
          </p>

          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
        </label>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {file ? (
            <div className="flex items-center gap-2 text-xs font-medium text-[#657A57]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Document ready for analysis</span>
            </div>
          ) : (
            <span className="text-xs text-[#9B8D7F]">
              Private & confidential: your resume is evaluated securely.
            </span>
          )}

          <button
            onClick={analyzeResume}
            disabled={!file || loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing document...</span>
              </>
            ) : (
              <>
                <span>Analyze Resume</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="study-card p-5">
              <span className="text-xs text-[#6B5D50] dark:text-[#B8AFA3]">ATS Match Score</span>
              <div className="font-serif text-3xl font-bold text-[#302820] dark:text-[#FAF5EC] mt-1">
                {atsScore}%
              </div>
              <span className="text-[11px] text-[#9B8D7F] mt-1 block">Heuristic keyword fit</span>
            </div>

            <div className="study-card p-5">
              <span className="text-xs text-[#6B5D50] dark:text-[#B8AFA3]">Skills Detected</span>
              <div className="font-serif text-3xl font-bold text-[#7A8065] mt-1">
                {skillsCount}
              </div>
              <span className="text-[11px] text-[#9B8D7F] mt-1 block">Extracted from text</span>
            </div>

            <div className="study-card p-5">
              <span className="text-xs text-[#6B5D50] dark:text-[#B8AFA3]">Potential Gaps</span>
              <div className="font-serif text-3xl font-bold text-[#AC7256] mt-1">
                {missingSkillsCount}
              </div>
              <span className="text-[11px] text-[#9B8D7F] mt-1 block">Recommended additions</span>
            </div>

            <div className="study-card p-5">
              <span className="text-xs text-[#6B5D50] dark:text-[#B8AFA3]">Interview Readiness</span>
              <div className="font-serif text-3xl font-bold text-[#B39460] mt-1">
                {readiness}%
              </div>
              <span className="text-[11px] text-[#9B8D7F] mt-1 block">Overall preparation</span>
            </div>
          </div>

          {/* Recruiter Verdict Card */}
          {result.verdict && (
            <div className="study-card p-6 bg-[#FAF5EC] dark:bg-[#2E2721] border-l-4 border-l-[#AC7256] space-y-2">
              <span className="font-hand text-xl text-[#AC7256]">Recruiter Notes</span>
              <p className="text-sm text-[#49372B] dark:text-[#E5D6BE] leading-relaxed">
                {result.verdict}
              </p>
            </div>
          )}

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="study-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
                <h3 className="font-serif text-lg font-semibold text-[#302820] dark:text-[#FAF5EC]">
                  Skills Found in Document
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills && result.skills.length > 0 ? (
                  result.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#7A8065]/15 text-[#49372B] dark:text-[#E5D6BE] font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#9B8D7F]">No primary skills parsed</p>
                )}
              </div>
            </div>

            <div className="study-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#AC7256]" />
                <h3 className="font-serif text-lg font-semibold text-[#302820] dark:text-[#FAF5EC]">
                  Suggested Keywords & Skills
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills && result.missing_skills.length > 0 ? (
                  result.missing_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#AC7256]/15 text-[#AC7256] font-medium"
                    >
                      + {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#9B8D7F]">Document includes all standard target keywords</p>
                )}
              </div>
            </div>
          </div>

          {/* Strengths & Areas to Polish */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="study-card p-6 space-y-3">
              <h3 className="font-serif text-lg font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Document Strengths
              </h3>
              <ul className="space-y-2 text-xs text-[#6B5D50] dark:text-[#B8AFA3]">
                {result.strengths && result.strengths.length > 0 ? (
                  result.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#7A8065] font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <li>Clear professional presentation detected.</li>
                )}
              </ul>
            </div>

            <div className="study-card p-6 space-y-3">
              <h3 className="font-serif text-lg font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Areas to Polish
              </h3>
              <ul className="space-y-2 text-xs text-[#6B5D50] dark:text-[#B8AFA3]">
                {result.weaknesses && result.weaknesses.length > 0 ? (
                  result.weaknesses.map((weak, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#AC7256] font-bold">→</span>
                      <span>{weak}</span>
                    </li>
                  ))
                ) : (
                  <li>No major gaps identified in the current draft.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Job Description Matcher Section */}
          <section className="study-card p-6 sm:p-8 space-y-5">
            <div>
              <span className="font-hand text-xl text-[#AC7256]">Specific Role Alignment</span>
              <h3 className="font-serif text-2xl font-semibold text-[#302820] dark:text-[#FAF5EC] mt-1">
                Match Against a Target Job Description
              </h3>
              <p className="text-xs text-[#6B5D50] dark:text-[#B8AFA3] mt-1">
                Paste the job listing text you are targeting to see how closely your resume aligns with its requirements.
              </p>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description requirements and qualifications here..."
              rows={5}
              className="w-full p-4 rounded-md border border-[#49372B]/20 dark:border-[#E5D6BE]/20 bg-[#FAF5EC] dark:bg-[#342C25] text-sm text-[#302820] dark:text-[#FAF5EC] placeholder:text-[#9B8D7F] focus:border-[#AC7256] outline-none"
            />

            <div className="flex justify-end">
              <button
                onClick={matchJobDescription}
                disabled={jdLoading || !jobDescription.trim()}
                className="btn-primary"
              >
                {jdLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Comparing requirements...</span>
                  </>
                ) : (
                  <>
                    <span>Match with Job Description</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* JD Match Result */}
            {jdResult && (
              <div className="pt-6 border-t border-[#49372B]/10 dark:border-[#E5D6BE]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#6B5D50] dark:text-[#B8AFA3]">Alignment Score</span>
                    <div className="font-serif text-3xl font-bold text-[#AC7256] mt-0.5">
                      {jdScore}%
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded bg-[#AC7256]/15 text-[#AC7256] font-medium">
                    {jdScore >= 75 ? "High Alignment" : "Partial Alignment"}
                  </span>
                </div>

                {jdResult.keywords_to_add && jdResult.keywords_to_add.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#49372B] dark:text-[#E5D6BE]">
                      Keywords to integrate into your experience bullets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {jdResult.keywords_to_add.map((kw, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded bg-[#B39460]/20 text-[#49372B] dark:text-[#E5D6BE]"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Honest Disclaimer */}
          <div className="text-center text-[11px] text-[#9B8D7F] pt-4">
            Evaluations reflect heuristic ATS keyword matching and career best practices. They provide guidance rather than a guarantee of interview invitations or employment outcomes.
          </div>
        </div>
      )}
    </div>
  );
}