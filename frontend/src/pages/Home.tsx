import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Mic,
  FileText,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Menu,
  X,
  Volume2,
  Terminal,
  Cpu,
  GraduationCap,
  Award,
  ChevronRight,
  Layers,
  HeartHandshake
} from "lucide-react";
import HagridsLogo from "../components/shared/HagridsLogo";
import ExperienceToggle from "../components/shared/ExperienceToggle";
import AmbientSoundController from "../components/shared/AmbientSoundController";
import RainWindowEffect from "../components/shared/RainWindowEffect";
import InstallAppModal from "../components/shared/InstallAppModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { experience, setExperience } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<"interview" | "resume" | "speech" | "reports">("interview");

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
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden flex flex-col font-sans-ui">
      {/* Ambient Rain Window backdrop */}
      <RainWindowEffect intensity="subtle" />

      {/* Warm Ambient Overhead Light Halo */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(232,173,98,0.14),transparent_70%)] blur-2xl z-0" />

      {/* =========================================================
         PUBLIC NAVIGATION
         ========================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#1A1512]/85 border-b border-[#E8AD62]/15 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Parent Endorsement */}
          <HagridsLogo to="/" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#EFE4D2]">
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-[#E8AD62] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-[#E8AD62] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("experience-modes")}
              className="hover:text-[#E8AD62] transition-colors"
            >
              Two Modes
            </button>
            <button
              onClick={() => scrollToSection("about-club")}
              className="hover:text-[#E8AD62] transition-colors"
            >
              The Sorted Club
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ExperienceToggle variant="pill" />
            <AmbientSoundController />

            {user ? (
              <Link
                to="/dashboard"
                className="ml-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase bg-[#E8AD62] text-[#211B17] hover:bg-[#F6CD8B] shadow-md transition-all active:scale-95"
              >
                Go to Study Desk
              </Link>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#EFE4D2] hover:text-[#FFF7E9] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase bg-gradient-to-r from-[#E8AD62] to-[#D97706] text-[#211B17] hover:brightness-105 shadow-[0_0_25px_rgba(232,173,98,0.3)] transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Sound Controls */}
          <div className="flex md:hidden items-center gap-2">
            <AmbientSoundController />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="touch-target p-2 rounded-xl text-[#FFF7E9] hover:bg-[#2E231C] border border-[#E8AD62]/20"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E8AD62]/20 bg-[#1A1512] px-5 py-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8AD62]/10">
              <span className="text-xs text-[#B9AB97]">Appearance</span>
              <ExperienceToggle variant="compact" />
            </div>

            <nav className="flex flex-col space-y-3 text-base font-medium text-[#EFE4D2]">
              <button
                onClick={() => scrollToSection("features")}
                className="text-left py-2 hover:text-[#E8AD62]"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left py-2 hover:text-[#E8AD62]"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("experience-modes")}
                className="text-left py-2 hover:text-[#E8AD62]"
              >
                Two Modes
              </button>
              <button
                onClick={() => scrollToSection("about-club")}
                className="text-left py-2 hover:text-[#E8AD62]"
              >
                About The Sorted Club
              </button>
            </nav>

            <div className="pt-4 border-t border-[#E8AD62]/10 space-y-3">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl font-semibold text-center block bg-[#E8AD62] text-[#211B17]"
                >
                  Go to Study Desk
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl font-semibold text-center block bg-gradient-to-r from-[#E8AD62] to-[#D97706] text-[#211B17]"
                  >
                    Enter the Hut (Get Started)
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl font-medium text-center block text-[#B9AB97] border border-[#E8AD62]/20"
                  >
                    Sign In
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setInstallModalOpen(true);
                }}
                className="w-full py-2 text-xs text-[#E8AD62] flex items-center justify-center gap-1.5"
              >
                Install Hagrid's Hut App
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
         HERO SECTION: THE WARM STUDY
         ========================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Brand Welcome Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#2E231C]/90 border border-[#E8AD62]/35 shadow-inner text-xs sm:text-sm font-medium text-[#F6CD8B]"
          >
            <Sparkles className="w-4 h-4 text-[#E8AD62]" />
            <span>A warm sanctuary for interview practice & career readiness</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#FFF7E9] leading-[1.12]"
          >
            Build a career <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6CD8B] via-[#E8AD62] to-[#D97706] italic">
              you're ready for.
            </span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-[#EFE4D2]/90 leading-relaxed font-study"
          >
            Practise interviews, improve your resume, understand your strengths, and take your next career step from a space that feels like yours.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={handleEnterHut}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base tracking-wide bg-gradient-to-r from-[#E8AD62] via-[#E8AD62] to-[#D97706] text-[#211B17] hover:brightness-105 shadow-[0_0_40px_rgba(232,173,98,0.35)] transition-all flex items-center justify-center gap-3 active:scale-98"
            >
              <span>Enter the Hut</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => scrollToSection("interactive-desk")}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-medium text-base text-[#FFF7E9] bg-[#2E231C]/80 hover:bg-[#35251D] border border-[#E8AD62]/25 hover:border-[#E8AD62]/50 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#E8AD62]" />
              <span>Explore the Experience</span>
            </button>
          </motion.div>

          {/* Subtle Tagline Endorsement */}
          <p className="text-xs text-[#B9AB97] pt-2">
            "Your corner of the world to get career-ready." — A product of <span className="text-[#E8AD62]">The Sorted Club</span>
          </p>
        </div>

        {/* =========================================================
           INTERACTIVE DESK PREVIEW (The Open Notebook Motif)
           ========================================================= */}
        <div id="interactive-desk" className="max-w-5xl mx-auto mt-14 relative">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#E8AD62]/30 via-[#35251D]/60 to-[#241B16] shadow-2xl overflow-hidden">
            <div className="bg-[#1F1713] rounded-[22px] p-6 sm:p-10 border border-[#E8AD62]/15">
              {/* Desk Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8AD62]/15">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#E8AD62] animate-pulse" />
                  <span className="font-display font-semibold text-sm text-[#FFF7E9]">
                    The Study Desk · Active Practice Session
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#536B4F]/30 text-[#80C8B5] border border-[#536B4F]/40">
                    Groq AI Intelligence
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#E8AD62]/20 text-[#F6CD8B] border border-[#E8AD62]/30">
                    Cozy Study Vibe
                  </span>
                </div>
              </div>

              {/* Inside Desk: Notebook Layout */}
              <div className="grid md:grid-cols-12 gap-8 mt-8">
                {/* Left Page: Open Question & Speech Prompt */}
                <div className="md:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#35251D] border border-[#E8AD62]/20 text-xs text-[#E8AD62]">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Interview Question 03 of 05</span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FFF7E9] leading-snug">
                    "Tell me about a time when you had to balance competing technical priorities under tight deadlines."
                  </h3>

                  <p className="text-sm text-[#EFE4D2]/80 leading-relaxed font-study">
                    The interviewer is listening for structured STAR thinking (Situation, Task, Action, Result), prioritization frameworks, and honest reflection.
                  </p>

                  {/* Simulated Response Box */}
                  <div className="p-4 rounded-2xl bg-[#1A1512] border border-[#E8AD62]/20 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#B9AB97]">
                      <span className="flex items-center gap-1.5 text-[#80C8B5]">
                        <span className="w-2 h-2 rounded-full bg-[#80C8B5] animate-ping" />
                        Speech Ready
                      </span>
                      <span>Text or Voice Answer</span>
                    </div>
                    <p className="text-sm text-[#FFF7E9] italic font-study">
                      "In my previous role, our team faced a severe production bottleneck while simultaneously preparing for a major product launch..."
                    </p>
                  </div>
                </div>

                {/* Right Page: Real-time AI Evaluation Notebook */}
                <div className="md:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-[#2E231C]/90 border border-[#E8AD62]/25 text-left space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#E8AD62]">
                        Study Feedback
                      </span>
                      <span className="text-xs font-bold text-[#80C8B5] px-2 py-0.5 rounded-full bg-[#536B4F]/30">
                        Strong Signal
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-[#EFE4D2] mb-1">
                          <span>Structure (STAR Clarity)</span>
                          <span className="text-[#E8AD62] font-semibold">92%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#1A1512] overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#536B4F] to-[#E8AD62] w-[92%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-[#EFE4D2] mb-1">
                          <span>Technical Depth</span>
                          <span className="text-[#E8AD62] font-semibold">88%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#1A1512] overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#536B4F] to-[#E8AD62] w-[88%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1512]/80 border border-[#E8AD62]/15 text-xs text-[#B9AB97] space-y-1">
                    <span className="font-semibold text-[#FFF7E9] block">Follow-up Generated:</span>
                    <p className="italic text-[#EFE4D2]/90">
                      "How did you validate that your architectural trade-offs did not compromise system security?"
                    </p>
                  </div>

                  <button
                    onClick={handleEnterHut}
                    className="w-full py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase bg-[#E8AD62] text-[#211B17] hover:bg-[#F6CD8B] transition-colors"
                  >
                    Try Live in the Hut
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         FEATURE DISCOVERY
         ========================================================= */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E8AD62]">
            What You Can Do
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FFF7E9]">
            Everything you need to master your career journey.
          </h2>
          <p className="text-base text-[#EFE4D2]/80 font-study">
            Built on genuine Groq AI models, robust resume parsing, speech analysis, and comprehensive session history.
          </p>

          {/* Interactive Feature Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setActiveFeatureTab("interview")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFeatureTab === "interview"
                  ? "bg-[#E8AD62] text-[#211B17] shadow-md"
                  : "bg-[#241B16] text-[#B9AB97] hover:text-[#FFF7E9] border border-[#E8AD62]/15"
              }`}
            >
              Interview Practice
            </button>
            <button
              onClick={() => setActiveFeatureTab("resume")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFeatureTab === "resume"
                  ? "bg-[#E8AD62] text-[#211B17] shadow-md"
                  : "bg-[#241B16] text-[#B9AB97] hover:text-[#FFF7E9] border border-[#E8AD62]/15"
              }`}
            >
              Resume Workshop
            </button>
            <button
              onClick={() => setActiveFeatureTab("speech")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFeatureTab === "speech"
                  ? "bg-[#E8AD62] text-[#211B17] shadow-md"
                  : "bg-[#241B16] text-[#B9AB97] hover:text-[#FFF7E9] border border-[#E8AD62]/15"
              }`}
            >
              Speech Intelligence
            </button>
            <button
              onClick={() => setActiveFeatureTab("reports")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFeatureTab === "reports"
                  ? "bg-[#E8AD62] text-[#211B17] shadow-md"
                  : "bg-[#241B16] text-[#B9AB97] hover:text-[#FFF7E9] border border-[#E8AD62]/15"
              }`}
            >
              Reports & Progress
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Interview Room */}
          <div className="p-8 rounded-3xl bg-[#241B16]/90 border border-[#E8AD62]/20 hover:border-[#E8AD62]/50 shadow-xl transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8AD62]/15 border border-[#E8AD62]/30 flex items-center justify-center text-[#E8AD62]">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#FFF7E9]">
              Interview Practice Room
            </h3>
            <p className="text-sm text-[#EFE4D2]/80 leading-relaxed font-study">
              Choose your target role, difficulty, and company style. Practice answering real questions with instant feedback and intelligent follow-ups.
            </p>
            <div className="pt-2">
              <Link
                to="/practice"
                className="text-xs font-semibold text-[#E8AD62] hover:text-[#F6CD8B] inline-flex items-center gap-1.5"
              >
                Enter Practice Room <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Resume Workshop */}
          <div className="p-8 rounded-3xl bg-[#241B16]/90 border border-[#E8AD62]/20 hover:border-[#E8AD62]/50 shadow-xl transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#536B4F]/20 border border-[#536B4F]/40 flex items-center justify-center text-[#80C8B5]">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#FFF7E9]">
              AI Resume Workshop
            </h3>
            <p className="text-sm text-[#EFE4D2]/80 leading-relaxed font-study">
              Upload your resume for real-time ATS scoring, keyword extraction, structural feedback, and job description alignment.
            </p>
            <div className="pt-2">
              <Link
                to="/resume"
                className="text-xs font-semibold text-[#80C8B5] hover:text-[#FFF7E9] inline-flex items-center gap-1.5"
              >
                Upload & Analyze Resume <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: In-Depth Reports */}
          <div className="p-8 rounded-3xl bg-[#241B16]/90 border border-[#E8AD62]/20 hover:border-[#E8AD62]/50 shadow-xl transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8AD62]/15 border border-[#E8AD62]/30 flex items-center justify-center text-[#E8AD62]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#FFF7E9]">
              Comprehensive Reports
            </h3>
            <p className="text-sm text-[#EFE4D2]/80 leading-relaxed font-study">
              Review every completed session. Identify your strongest communication habits, recurring patterns, and exportable PDF summaries.
            </p>
            <div className="pt-2">
              <Link
                to="/reports"
                className="text-xs font-semibold text-[#E8AD62] hover:text-[#F6CD8B] inline-flex items-center gap-1.5"
              >
                View Report Overview <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Speech & Voice Intelligence */}
          <div className="p-8 rounded-3xl bg-[#241B16]/90 border border-[#E8AD62]/20 hover:border-[#E8AD62]/50 shadow-xl transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#536B4F]/20 border border-[#536B4F]/40 flex items-center justify-center text-[#80C8B5]">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#FFF7E9]">
              Speech & Tone Analysis
            </h3>
            <p className="text-sm text-[#EFE4D2]/80 leading-relaxed font-study">
              Understand pacing, clarity, confidence, and articulation without harsh judgment or robotic scoring.
            </p>
            <div className="pt-2">
              <Link
                to="/speech"
                className="text-xs font-semibold text-[#80C8B5] hover:text-[#FFF7E9] inline-flex items-center gap-1.5"
              >
                Explore Speech Insights <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 5: Recruiter Insights */}
          <div className="p-8 rounded-3xl bg-[#241B16]/90 border border-[#E8AD62]/20 hover:border-[#E8AD62]/50 shadow-xl transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8AD62]/15 border border-[#E8AD62]/30 flex items-center justify-center text-[#E8AD62]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#FFF7E9]">
              Recruiter Perspective
            </h3>
            <p className="text-sm text-[#EFE4D2]/80 leading-relaxed font-study">
              See what hiring managers and talent evaluators look for in candidates applying to top engineering, product, and leadership roles.
            </p>
            <div className="pt-2">
              <Link
                to="/recruiter"
                className="text-xs font-semibold text-[#E8AD62] hover:text-[#F6CD8B] inline-flex items-center gap-1.5"
              >
                Inspect Hiring Signals <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 6: Streaks & Certificates */}
          <div className="p-8 rounded-3xl bg-[#241B16]/90 border border-[#E8AD62]/20 hover:border-[#E8AD62]/50 shadow-xl transition-all duration-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#536B4F]/20 border border-[#536B4F]/40 flex items-center justify-center text-[#80C8B5]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#FFF7E9]">
              Achievements & Readiness
            </h3>
            <p className="text-sm text-[#EFE4D2]/80 leading-relaxed font-study">
              Earn verified readiness certificates and track weekly practice consistency to build quiet, unshakeable interview confidence.
            </p>
            <div className="pt-2">
              <Link
                to="/certificate"
                className="text-xs font-semibold text-[#80C8B5] hover:text-[#FFF7E9] inline-flex items-center gap-1.5"
              >
                View Certificates <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         HOW IT WORKS
         ========================================================= */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-[#E8AD62]/15">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E8AD62]">
            Simple, Calm Process
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FFF7E9]">
            How Hagrid's Hut works.
          </h2>
          <p className="text-base text-[#EFE4D2]/80 font-study">
            No endless quizzes or corporate hurdles. Just genuine preparation tailored to your real career goals.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 text-left">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#241B16] border border-[#E8AD62]/20 space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#E8AD62] text-[#211B17] font-bold text-sm flex items-center justify-center">
              1
            </span>
            <h4 className="font-display font-bold text-base text-[#FFF7E9]">Set Up Profile</h4>
            <p className="text-xs text-[#B9AB97] font-study leading-relaxed">
              Define your target job title, experience level, and preferred interview formats.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#241B16] border border-[#E8AD62]/20 space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#E8AD62] text-[#211B17] font-bold text-sm flex items-center justify-center">
              2
            </span>
            <h4 className="font-display font-bold text-base text-[#FFF7E9]">Choose a Task</h4>
            <p className="text-xs text-[#B9AB97] font-study leading-relaxed">
              Pick between a mock interview session, resume critique, or speech practice exercise.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#241B16] border border-[#E8AD62]/20 space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#E8AD62] text-[#211B17] font-bold text-sm flex items-center justify-center">
              3
            </span>
            <h4 className="font-display font-bold text-base text-[#FFF7E9]">Practise Comfortably</h4>
            <p className="text-xs text-[#B9AB97] font-study leading-relaxed">
              Answer by voice or keyboard in a serene, distraction-free atmosphere.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-[#241B16] border border-[#E8AD62]/20 space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#E8AD62] text-[#211B17] font-bold text-sm flex items-center justify-center">
              4
            </span>
            <h4 className="font-display font-bold text-base text-[#FFF7E9]">Receive Feedback</h4>
            <p className="text-xs text-[#B9AB97] font-study leading-relaxed">
              Get detailed STAR analysis, follow-up challenges, and specific wording upgrades.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-6 rounded-2xl bg-[#241B16] border border-[#E8AD62]/20 space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#E8AD62] text-[#211B17] font-bold text-sm flex items-center justify-center">
              5
            </span>
            <h4 className="font-display font-bold text-base text-[#FFF7E9]">Review & Excel</h4>
            <p className="text-xs text-[#B9AB97] font-study leading-relaxed">
              Watch your readiness score rise and enter real interviews with calm confidence.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
         TWO MODES SHOWCASE (Cozy Experience vs Advanced Mode)
         ========================================================= */}
      <section id="experience-modes" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-[#E8AD62]/15">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E8AD62]">
            Two Experiences, One Unified Product
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FFF7E9]">
            Choose the mood that suits your focus.
          </h2>
          <p className="text-base text-[#EFE4D2]/80 font-study">
            Switch effortlessly with a single tap. Your active interviews, resume drafts, and history stay intact.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Cozy Experience Card */}
          <div
            onClick={() => setExperience("cozy")}
            className={`cursor-pointer p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              isCozy
                ? "bg-gradient-to-br from-[#2E231C] to-[#241B16] border-[#E8AD62] shadow-[0_0_50px_rgba(232,173,98,0.2)]"
                : "bg-[#241B16]/70 border-[#E8AD62]/20 opacity-80 hover:opacity-100"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#E8AD62]/20 text-[#F6CD8B] text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  The Cozy Experience (Default)
                </span>
                {isCozy && <CheckCircle2 className="w-5 h-5 text-[#E8AD62]" />}
              </div>

              <h3 className="font-display text-2xl font-bold text-[#FFF7E9]">
                Warm Wood, Amber Light & Calm Focus
              </h3>

              <p className="text-sm text-[#EFE4D2]/80 font-study leading-relaxed">
                Designed to feel like a private evening study with gentle rain outside, warm oak surfaces, parchment reading sheets, and reassuring pacing for deep preparation.
              </p>

              <div className="pt-4 space-y-2 text-xs text-[#B9AB97]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8AD62]" />
                  <span>Cinzel & Lora editorial typography paired with clean UI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8AD62]" />
                  <span>Optional Web Audio rain and hearth ambience</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8AD62]" />
                  <span>High-contrast parchment reading views for long reports</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setExperience("cozy");
              }}
              className="mt-8 w-full py-3 rounded-xl font-semibold text-xs tracking-wider uppercase bg-[#E8AD62] text-[#211B17] hover:bg-[#F6CD8B] transition-colors"
            >
              {isCozy ? "Active Experience" : "Switch to Cozy"}
            </button>
          </div>

          {/* Advanced Mode Card */}
          <div
            onClick={() => setExperience("advanced")}
            className={`cursor-pointer p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              !isCozy
                ? "bg-gradient-to-br from-[#121824] to-[#0E131C] border-[#10B981] shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                : "bg-[#0F141F]/80 border-white/10 opacity-80 hover:opacity-100"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-xs font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Advanced Mode
                </span>
                {!isCozy && <CheckCircle2 className="w-5 h-5 text-[#10B981]" />}
              </div>

              <h3 className="font-display text-2xl font-bold text-[#FFFFFF]">
                High-Density Telemetry & Professional Analytics
              </h3>

              <p className="text-sm text-[#D1D5DB] font-sans-ui leading-relaxed">
                The modernized HireSense AI engine. Refined charcoal surfaces, restrained emerald highlights, dense candidate tables, live transcript feeds, and recruiter telemetry.
              </p>

              <div className="pt-4 space-y-2 text-xs text-[#9CA3AF]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Compact data tables with extensive chart breakdowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Real-time candidate intelligence and hiring probability</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Cyber-gold and emerald telemetry alerts</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setExperience("advanced");
              }}
              className="mt-8 w-full py-3 rounded-xl font-semibold text-xs tracking-wider uppercase bg-[#10B981] text-[#07090E] hover:bg-[#34D399] transition-colors"
            >
              {!isCozy ? "Active Experience" : "Switch to Advanced"}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
         THE SORTED CLUB BRAND SECTION
         ========================================================= */}
      <section id="about-club" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#536B4F]/20 border border-[#536B4F]/30 text-xs text-[#80C8B5]">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Parent Brand Endorsement</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FFF7E9]">
          A Product of The Sorted Club
        </h2>

        <p className="text-base text-[#EFE4D2]/80 font-study max-w-2xl mx-auto leading-relaxed">
          The Sorted Club builds human-centered technology that helps ambitious people get prepared, stay focused, and thrive in their careers without unnecessary anxiety or cold corporate jargon.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setInstallModalOpen(true)}
            className="px-6 py-2.5 rounded-xl border border-[#E8AD62]/30 bg-[#241B16] hover:bg-[#2E231C] text-xs font-medium text-[#E8AD62] inline-flex items-center gap-2 transition-all"
          >
            <span>Install Mobile / Desktop App</span>
          </button>
        </div>
      </section>

      {/* =========================================================
         FINAL CTA
         ========================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-[#35251D] via-[#241B16] to-[#1A1512] border border-[#E8AD62]/35 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#E8AD62]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#FFF7E9]">
              Make yourself comfortable. <br />
              <span className="text-[#E8AD62]">Your next opportunity starts here.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#EFE4D2]/80 font-study max-w-xl mx-auto">
              Join thousands of job seekers preparing in the warmth of Hagrid's Hut.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleEnterHut}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base bg-gradient-to-r from-[#E8AD62] to-[#D97706] text-[#211B17] hover:brightness-105 shadow-xl transition-all"
              >
                {user ? "Open Your Study Desk" : "Enter the Hut — Get Started Free"}
              </button>

              <button
                onClick={() => setInstallModalOpen(true)}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-medium text-sm text-[#FFF7E9] bg-[#1A1512] border border-[#E8AD62]/20 hover:bg-[#241B16]"
              >
                Install App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
         FOOTER
         ========================================================= */}
      <footer className="mt-auto border-t border-[#E8AD62]/15 bg-[#14100D] py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <HagridsLogo to="/" />

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#B9AB97]">
            <Link to="/practice" className="hover:text-[#FFF7E9]">Interview Practice</Link>
            <Link to="/resume" className="hover:text-[#FFF7E9]">Resume Workshop</Link>
            <Link to="/reports" className="hover:text-[#FFF7E9]">Reports</Link>
            <Link to="/dashboard" className="hover:text-[#FFF7E9]">Study Desk</Link>
            <button onClick={() => setInstallModalOpen(true)} className="hover:text-[#E8AD62]">
              Install App
            </button>
          </div>

          <p className="text-xs text-[#B9AB97]/70 text-center md:text-right">
            © {new Date().getFullYear()} Hagrid's Hut. A product of The Sorted Club. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Install Modal */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </div>
  );
}