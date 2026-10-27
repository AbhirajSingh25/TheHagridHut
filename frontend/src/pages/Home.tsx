import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Mic,
  FileText,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Menu,
  X,
  Compass,
  Layers,
  Sparkles,
  Coffee,
  PenTool,
  Clock,
} from "lucide-react";
import HagridsLogo from "../components/shared/HagridsLogo";
import ExperienceToggle from "../components/shared/ExperienceToggle";
import AmbientSoundController from "../components/shared/AmbientSoundController";
import InstallAppModal from "../components/shared/InstallAppModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { experience, setExperience } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"interview" | "resume" | "reports">("interview");

  const isCozy = experience === "cozy";

  const handleEnterHut = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB] dark:bg-[#221D19] text-[#302820] dark:text-[#F3EADD] font-sans transition-colors duration-200 flex flex-col">
      {/* =========================================================
         RESTRAINED EDITORIAL HEADER
         ========================================================= */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF5EC]/90 dark:bg-[#2A231C]/90 backdrop-blur-md border-b border-[#49372B]/10 dark:border-[#E5D6BE]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with Cottage Mark & Parent Endorsement */}
          <HagridsLogo to="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#6B5D50] dark:text-[#B8AFA3]">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-[#302820] dark:hover:text-[#FAF5EC] transition-colors"
            >
              The Hut
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-[#302820] dark:hover:text-[#FAF5EC] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("two-modes")}
              className="hover:text-[#302820] dark:hover:text-[#FAF5EC] transition-colors"
            >
              Two Experiences
            </button>
            <button
              onClick={() => scrollToSection("about-club")}
              className="hover:text-[#302820] dark:hover:text-[#FAF5EC] transition-colors"
            >
              About
            </button>
          </nav>

          {/* Desktop Right Actions: Discreet Ambience, Sign In, Primary CTA */}
          <div className="hidden md:flex items-center gap-4">
            <AmbientSoundController />

            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-primary"
              >
                Go to Study Desk
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#6B5D50] dark:text-[#B8AFA3] hover:text-[#302820] dark:hover:text-[#FAF5EC] transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleEnterHut}
                  className="btn-primary"
                >
                  Enter the Hut
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <AmbientSoundController />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="touch-target p-2 rounded-md text-[#302820] dark:text-[#F3EADD] hover:bg-[#E5D6BE]/40 dark:hover:bg-[#342C25]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Accessible Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#49372B]/10 dark:border-[#E5D6BE]/10 bg-[#FAF5EC] dark:bg-[#2A231C] px-5 py-5 space-y-4 shadow-lg">
            <nav className="flex flex-col space-y-3 text-base font-medium text-[#49372B] dark:text-[#F3EADD]">
              <button
                onClick={() => scrollToSection("features")}
                className="text-left py-2 hover:text-[#AC7256]"
              >
                The Hut
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left py-2 hover:text-[#AC7256]"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("two-modes")}
                className="text-left py-2 hover:text-[#AC7256]"
              >
                Two Experiences
              </button>
              <button
                onClick={() => scrollToSection("about-club")}
                className="text-left py-2 hover:text-[#AC7256]"
              >
                About The Sorted Club
              </button>
            </nav>

            <div className="pt-3 border-t border-[#49372B]/10 dark:border-[#E5D6BE]/10 flex flex-col gap-2.5">
              {user ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn-primary w-full justify-center"
                >
                  Go to Study Desk
                </button>
              ) : (
                <>
                  <button
                    onClick={handleEnterHut}
                    className="btn-primary w-full justify-center"
                  >
                    Enter the Hut
                  </button>
                  <Link
                    to="/login"
                    className="btn-secondary w-full justify-center text-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
         HERO SECTION: THE RAINLIT STUDY
         ========================================================= */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Editorial Left Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Restrained Subtitle / Endorsement */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5D6BE]/60 dark:bg-[#383029] text-xs font-medium text-[#49372B] dark:text-[#E5D6BE] border border-[#49372B]/10 dark:border-[#E5D6BE]/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#AC7256]" />
                The Rainlit Study · A product of The Sorted Club
              </div>

              {/* Main Headline in Fraunces Serif */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#302820] dark:text-[#FAF5EC] leading-[1.12]">
                Make room for your next chapter.
              </h1>

              {/* Supportive Editorial Body */}
              <p className="text-lg sm:text-xl text-[#6B5D50] dark:text-[#B8AFA3] leading-relaxed max-w-xl font-normal">
                Prepare for interviews, refine your resume, and build confidence at your own pace.
                Your next career step starts here, in a space that lets you breathe.
              </p>

              {/* Primary & Secondary Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleEnterHut}
                  className="btn-primary text-base px-6 py-3"
                >
                  Enter the Hut
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => scrollToSection("features")}
                  className="btn-secondary text-base px-5 py-3"
                >
                  Take a look around
                </button>
              </div>

              {/* Marginal Human Note */}
              <div className="pt-4 flex items-center gap-3">
                <span className="font-hand text-xl text-[#AC7256]">
                  "Take your time. A good room makes all the difference."
                </span>
                <span className="text-xs text-[#9B8D7F]">— Notes from the Hut</span>
              </div>
            </div>

            {/* Editorial Photographic Composition (Right Column) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-[#49372B]/15 dark:border-[#E5D6BE]/15 bg-[#E5D6BE]/30">
                <img
                  src="/images/rainlit_study_hero.jpg"
                  alt="A warm wooden desk beside a rain-streaked window with an amber reading lamp, an open notebook, and books"
                  className="w-full h-auto object-cover max-h-[500px]"
                  loading="eager"
                />

                {/* Quiet caption bar */}
                <div className="px-4 py-2.5 bg-[#FAF5EC]/95 dark:bg-[#2A231C]/95 border-t border-[#49372B]/10 dark:border-[#E5D6BE]/10 flex items-center justify-between text-xs text-[#6B5D50] dark:text-[#B8AFA3]">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-3.5 h-3.5 text-[#AC7256]" />
                    <span>The Rainlit Study — A quiet place to think</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#9B8D7F]">Rainfall & Amber Light</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         PHILOSOPHY CALLOUT
         ========================================================= */}
      <section className="py-14 bg-[#F0E9DC] dark:bg-[#2A231C] border-y border-[#49372B]/10 dark:border-[#E5D6BE]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <p className="font-serif text-2xl sm:text-3xl font-medium text-[#302820] dark:text-[#FAF5EC] leading-snug">
            Most career tools feel like an assessment under cold fluorescent lights.
            Hagrid's Hut is designed like an inviting study on a rainy evening — safe, familiar, and unhurried.
          </p>
          <p className="text-base text-[#6B5D50] dark:text-[#B8AFA3]">
            Work with genuine AI evaluation, practice real interview questions, and build lasting career confidence.
          </p>
        </div>
      </section>

      {/* =========================================================
         PRODUCT DISCOVERY: REAL WORKING TOOLS
         ========================================================= */}
      <section id="features" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-[#AC7256]">
            Everyday Study Tools
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
            Tools built for focus, not anxiety.
          </h2>
          <p className="text-[#6B5D50] dark:text-[#B8AFA3] text-base">
            Every feature is designed to feel like sitting down at your desk with a cup of coffee and making real progress.
          </p>
        </div>

        {/* Feature Grid with Tactile Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Resume Workshop */}
          <div className="study-card p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-[#AC7256]/15 text-[#AC7256] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Resume Workshop
              </h3>
              <p className="text-[#6B5D50] dark:text-[#B8AFA3] text-sm leading-relaxed">
                Refine your resume in a warm document reading sheet. Upload your PDF or text, analyze clarity and strengths, and review targeted improvement suggestions.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#49372B]/10 dark:border-[#E5D6BE]/10 flex items-center justify-between text-xs text-[#AC7256] font-medium">
              <span>PDF analysis & ATS scoring</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 2: Interview Practice */}
          <div className="study-card p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-[#7A8065]/15 text-[#7A8065] flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Interview Practice
              </h3>
              <p className="text-[#6B5D50] dark:text-[#B8AFA3] text-sm leading-relaxed">
                Practise job interviews in a low-distraction room. Generate realistic questions for your target role, record spoken or typed answers, and receive nuanced follow-ups.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#49372B]/10 dark:border-[#E5D6BE]/10 flex items-center justify-between text-xs text-[#7A8065] font-medium">
              <span>Live audio & camera controls</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Feature 3: Answer Feedback & Reports */}
          <div className="study-card p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-[#B39460]/20 text-[#B39460] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Personal Reports
              </h3>
              <p className="text-[#6B5D50] dark:text-[#B8AFA3] text-sm leading-relaxed">
                Clear, readable evaluations that look like notes left in your journal. Understand what worked, what to polish, and concrete suggestions for your next attempt.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#49372B]/10 dark:border-[#E5D6BE]/10 flex items-center justify-between text-xs text-[#B39460] font-medium">
              <span>Answer breakdowns & export</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Real Product Workspace Preview Showcase */}
        <div className="mt-16 study-card p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 text-left">
              <span className="font-hand text-xl text-[#AC7256]">A desk you want to return to</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Your personal study desk, always ready.
              </h3>
              <p className="text-sm text-[#6B5D50] dark:text-[#B8AFA3] leading-relaxed">
                Log in and pick up right where you left off. Review your recent interview attempts, refine draft answers, inspect keyword matches for job descriptions, and see your progress accumulate.
              </p>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-sm text-[#49372B] dark:text-[#E5D6BE]">
                  <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
                  <span>Resume PDF parsing and tailored suggestion notes</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#49372B] dark:text-[#E5D6BE]">
                  <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
                  <span>Real audio capture and transcript evaluation</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#49372B] dark:text-[#E5D6BE]">
                  <CheckCircle2 className="w-4 h-4 text-[#7A8065]" />
                  <span>Historical report records preserved securely</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative rounded-lg overflow-hidden border border-[#49372B]/15 dark:border-[#E5D6BE]/15 shadow-md">
                <img
                  src="/images/study_workspace_desk.jpg"
                  alt="A wooden study desk with a resume document, glasses, fountain pen, and warm coffee cup"
                  className="w-full h-auto object-cover max-h-[420px]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         HOW IT WORKS
         ========================================================= */}
      <section id="how-it-works" className="py-20 bg-[#F0E9DC] dark:bg-[#2A231C] border-y border-[#49372B]/10 dark:border-[#E5D6BE]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#AC7256]">
              Simple Rhythm
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
              How you work in the Hut.
            </h2>
            <p className="text-[#6B5D50] dark:text-[#B8AFA3] text-base">
              A calm four-step cycle that turns interview nerves into steady preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#FAF5EC] dark:bg-[#342C25] p-6 rounded-lg border border-[#49372B]/10 dark:border-[#E5D6BE]/10 space-y-3">
              <span className="font-serif text-2xl font-bold text-[#AC7256]">01</span>
              <h3 className="font-serif text-lg font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Set Your Goal
              </h3>
              <p className="text-xs text-[#6B5D50] dark:text-[#B8AFA3] leading-relaxed">
                Choose the role, industry, or specific company you are targeting.
              </p>
            </div>

            <div className="bg-[#FAF5EC] dark:bg-[#342C25] p-6 rounded-lg border border-[#49372B]/10 dark:border-[#E5D6BE]/10 space-y-3">
              <span className="font-serif text-2xl font-bold text-[#AC7256]">02</span>
              <h3 className="font-serif text-lg font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Pick Your Task
              </h3>
              <p className="text-xs text-[#6B5D50] dark:text-[#B8AFA3] leading-relaxed">
                Work through a practice interview question or polish your resume document.
              </p>
            </div>

            <div className="bg-[#FAF5EC] dark:bg-[#342C25] p-6 rounded-lg border border-[#49372B]/10 dark:border-[#E5D6BE]/10 space-y-3">
              <span className="font-serif text-2xl font-bold text-[#AC7256]">03</span>
              <h3 className="font-serif text-lg font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Receive Feedback
              </h3>
              <p className="text-xs text-[#6B5D50] dark:text-[#B8AFA3] leading-relaxed">
                Get thoughtful, private feedback that highlights your strengths and areas to tighten.
              </p>
            </div>

            <div className="bg-[#FAF5EC] dark:bg-[#342C25] p-6 rounded-lg border border-[#49372B]/10 dark:border-[#E5D6BE]/10 space-y-3">
              <span className="font-serif text-2xl font-bold text-[#AC7256]">04</span>
              <h3 className="font-serif text-lg font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Build Confidence
              </h3>
              <p className="text-xs text-[#6B5D50] dark:text-[#B8AFA3] leading-relaxed">
                Review your session history and track your progress over time with zero judgment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         TWO EXPERIENCES: COZY vs ADVANCED MODE
         ========================================================= */}
      <section id="two-modes" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-[#AC7256]">
            One Product · Two Ways to Work
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
            Two experiences for different moments.
          </h2>
          <p className="text-[#6B5D50] dark:text-[#B8AFA3] text-base">
            Switch anytime. Both modes share your account, interviews, resume drafts, and data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cozy Experience Card */}
          <div
            onClick={() => setExperience("cozy")}
            className={`p-8 rounded-lg cursor-pointer transition-all border ${
              isCozy
                ? "bg-[#FAF5EC] dark:bg-[#2E2721] border-[#AC7256] shadow-md ring-1 ring-[#AC7256]"
                : "bg-[#FAF5EC]/60 dark:bg-[#2A231C]/60 border-[#49372B]/10 hover:border-[#49372B]/30"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif text-xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
                The Cozy Experience (Default)
              </span>
              {isCozy && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#AC7256]/15 text-[#AC7256]">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-[#6B5D50] dark:text-[#B8AFA3] leading-relaxed mb-6">
              A quiet, comfortable study desk. Designed for deep concentration, low anxiety, and natural readability. Perfect when preparing for interviews and writing resumes.
            </p>
            <ul className="space-y-2 text-xs text-[#49372B] dark:text-[#E5D6BE]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#AC7256]" />
                <span>Tactile paper reading surfaces and Fraunces typography</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#AC7256]" />
                <span>Restrained, distraction-free answer workspace</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#AC7256]" />
                <span>Optional soft rain ambience</span>
              </li>
            </ul>
          </div>

          {/* Advanced Mode Card */}
          <div
            onClick={() => setExperience("advanced")}
            className={`p-8 rounded-lg cursor-pointer transition-all border ${
              !isCozy
                ? "bg-[#282C30] border-[#7A8065] shadow-md ring-1 ring-[#7A8065] text-[#ECEEF0]"
                : "bg-[#F0E9DC]/70 dark:bg-[#2A231C]/60 border-[#49372B]/10 hover:border-[#49372B]/30"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif text-xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
                Advanced Mode
              </span>
              {!isCozy && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#7A8065]/20 text-[#ADB09A]">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-[#6B5D50] dark:text-[#B8AFA3] leading-relaxed mb-6">
              Modernized analytical mode. High data density, compact tables, candidate intelligence, speech pacing graphs, and deeper performance diagnostics.
            </p>
            <ul className="space-y-2 text-xs text-[#49372B] dark:text-[#E5D6BE]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7A8065]" />
                <span>Deep charcoal surfaces and compact metrics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7A8065]" />
                <span>Candidate intelligence and speech breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7A8065]" />
                <span>Shared accounts, sessions, and report records</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================
         ABOUT THE SORTED CLUB & FINAL INVITATION
         ========================================================= */}
      <section id="about-club" className="py-20 bg-[#F0E9DC] dark:bg-[#2A231C] border-t border-[#49372B]/10 dark:border-[#E5D6BE]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="font-hand text-2xl text-[#AC7256]">A product of The Sorted Club</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#302820] dark:text-[#FAF5EC]">
            Your corner of the world to get career-ready.
          </h2>
          <p className="text-base text-[#6B5D50] dark:text-[#B8AFA3] max-w-xl mx-auto leading-relaxed">
            The Sorted Club builds products that treat you like a capable adult who deserves calm tools. No countdowns, no neon scores, no synthetic pressure.
          </p>

          <div className="pt-4">
            <button
              onClick={handleEnterHut}
              className="btn-primary text-base px-8 py-3.5"
            >
              Enter Hagrid's Hut
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
         RESTRAINED FOOTER
         ========================================================= */}
      <footer className="py-12 bg-[#FAF5EC] dark:bg-[#221D19] border-t border-[#49372B]/10 dark:border-[#E5D6BE]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <HagridsLogo variant="full" />

          <p className="text-xs text-[#9B8D7F] text-center sm:text-right">
            © {new Date().getFullYear()} Hagrid's Hut · A product of <span className="font-medium text-[#AC7256]">The Sorted Club</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}