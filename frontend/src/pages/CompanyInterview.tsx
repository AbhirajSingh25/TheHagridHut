import React, { useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  Clock3,
  Code2,
  Crown,
  FileText,
  Play,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Company = {
  name: string;
  description: string;
  focus: string[];
  level: string;
  interviews: string;
};

const companies: Company[] = [
  {
    name: "Google",
    description:
      "Structured interviews focused on problem solving, system thinking, technical depth and communication.",
    focus: [
      "Data Structures",
      "Algorithms",
      "System Design",
      "Behavioral",
    ],
    level: "Advanced",
    interviews: "45-60 min",
  },
  {
    name: "Microsoft",
    description:
      "Technical and behavioral interviews with strong emphasis on collaboration and engineering fundamentals.",
    focus: [
      "Coding",
      "Problem Solving",
      "Design",
      "Leadership",
    ],
    level: "Intermediate",
    interviews: "45-60 min",
  },
  {
    name: "Amazon",
    description:
      "Leadership Principles combined with technical interviews and practical problem solving.",
    focus: [
      "Leadership Principles",
      "Coding",
      "System Design",
      "Behavioral",
    ],
    level: "Intermediate",
    interviews: "60 min",
  },
  {
    name: "Salesforce",
    description:
      "Cloud technology, software engineering fundamentals, problem solving and culture-focused questions.",
    focus: [
      "Java",
      "Cloud",
      "Coding",
      "Behavioral",
    ],
    level: "Intermediate",
    interviews: "45 min",
  },
  {
    name: "Infosys",
    description:
      "Programming fundamentals, aptitude, communication and project-based technical questions.",
    focus: [
      "Programming",
      "Aptitude",
      "Projects",
      "Communication",
    ],
    level: "Beginner",
    interviews: "30-45 min",
  },
  {
    name: "Meta",
    description:
      "High-intensity coding interviews focused on algorithms, optimization and communication.",
    focus: [
      "Algorithms",
      "Coding",
      "Optimization",
      "System Design",
    ],
    level: "Advanced",
    interviews: "45-60 min",
  },
];

const CompanyInterview: React.FC = () => {
  const navigate = useNavigate();

  const [selectedCompany, setSelectedCompany] =
    useState<Company>(companies[0]);

  const [selectedRole, setSelectedRole] =
    useState("Software Engineer");

  const [experienceLevel, setExperienceLevel] =
    useState("Fresher");

  const [questionCount, setQuestionCount] =
    useState("10");

  const companyStats = useMemo(
    () => [
      {
        label: "Interview Style",
        value: selectedCompany.level,
        icon: Target,
      },
      {
        label: "Estimated Duration",
        value: selectedCompany.interviews,
        icon: Clock3,
      },
      {
        label: "Preparation Focus",
        value: `${selectedCompany.focus.length} areas`,
        icon: Code2,
      },
    ],
    [selectedCompany]
  );

  const startInterview = () => {
    navigate(
      `/live-interview?company=${encodeURIComponent(
        selectedCompany.name
      )}&role=${encodeURIComponent(
        selectedRole
      )}&level=${encodeURIComponent(
        experienceLevel
      )}&questions=${questionCount}`
    );
  };

  return (
    <div className="relative min-h-full overflow-hidden pb-10">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-20 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[150px]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">

        {/* Header */}
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
            duration: 0.45,
          }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
              <Building2 className="h-4 w-4 text-violet-300" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-violet-300">
              Company Intelligence
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Company Interview Lab
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Practice interviews designed around company-specific expectations,
            technical patterns and hiring styles.
          </p>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.05,
          }}
          className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:p-8"
        >
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-violet-500/10 to-transparent" />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  AI Powered Simulation
                </span>
              </div>

              <h2 className="max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Prepare for the interview you actually want.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                Select a company, configure your target role and launch a
                focused interview experience instead of receiving the same
                generic interview questions humanity has been recycling since
                the invention of HR.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {selectedCompany.focus.map((focus) => (
                  <span
                    key={focus}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300"
                  >
                    {focus}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-5">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300">
                    Selected Company
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {selectedCompany.name}
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Crown className="h-5 w-5 text-amber-300" />
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-400">
                {selectedCompany.description}
              </p>

              <button
                type="button"
                onClick={startInterview}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:scale-[1.01] active:scale-[0.99]"
              >
                <Play className="h-4 w-4 fill-current" />
                Start {selectedCompany.name} Interview
              </button>
            </div>

          </div>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {companyStats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + index * 0.05,
                }}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/5">
                    <Icon className="h-4 w-4 text-cyan-300" />
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </div>

                <p className="mt-5 text-xs text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {stat.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">

          {/* Company selection */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl sm:p-6">

            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-violet-300" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300">
                    Target Companies
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-semibold text-white">
                  Choose your interview environment
                </h2>
              </div>

              <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-400">
                {companies.length} companies
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {companies.map((company) => {
                const isSelected =
                  selectedCompany.name === company.name;

                return (
                  <button
                    type="button"
                    key={company.name}
                    onClick={() =>
                      setSelectedCompany(company)
                    }
                    className={`group rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-violet-400/40 bg-violet-500/[0.09] shadow-lg shadow-violet-950/20"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-900">
                        <Building2
                          className={`h-5 w-5 ${
                            isSelected
                              ? "text-violet-300"
                              : "text-slate-400"
                          }`}
                        />
                      </div>

                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>

                    <h3 className="mt-4 font-semibold text-white">
                      {company.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                      {company.description}
                    </p>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Configuration */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-xl sm:p-6">

            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-300" />

              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300">
                Interview Setup
              </span>
            </div>

            <h2 className="mt-3 text-xl font-semibold text-white">
              Configure simulation
            </h2>

            <div className="mt-7 space-y-5">

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Target Role
                </label>

                <select
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50"
                >
                  <option>Software Engineer</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Data Analyst</option>
                  <option>Data Scientist</option>
                  <option>Machine Learning Engineer</option>
                  <option>Cybersecurity Analyst</option>
                  <option>Product Manager</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Experience Level
                </label>

                <select
                  value={experienceLevel}
                  onChange={(event) =>
                    setExperienceLevel(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50"
                >
                  <option>Fresher</option>
                  <option>0-2 Years</option>
                  <option>2-5 Years</option>
                  <option>5+ Years</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Number of Questions
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {["5", "10", "15"].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() =>
                        setQuestionCount(count)
                      }
                      className={`rounded-xl border py-3 text-sm font-medium transition ${
                        questionCount === count
                          ? "border-violet-400/50 bg-violet-500/10 text-violet-200"
                          : "border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                  <FileText className="h-4 w-4 text-violet-300" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    AI Interview Blueprint
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your selected company, role and experience level will shape
                    the interview session.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={startInterview}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20"
            >
              Launch Interview
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CompanyInterview;