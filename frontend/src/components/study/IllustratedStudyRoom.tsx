import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Mic,
  LayoutDashboard,
  BarChart3,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  User as UserIcon,
  LogOut,
  Sliders,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import HagridsLogo from "../shared/HagridsLogo";
import RainWindowEffect from "../shared/RainWindowEffect";
import AmbientSoundController from "../shared/AmbientSoundController";
import StudyCat, { CatState } from "./StudyCat";
import AuthModal from "../auth/AuthModal";

export default function IllustratedStudyRoom() {
  const { user, isAuthenticated, logout } = useAuth();
  const { artworkMode, setArtworkMode, experience, setExperience } = useTheme();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const [catReaction, setCatReaction] = useState<string | null>(null);
  const [soundModalOpen, setSoundModalOpen] = useState(false);

  const isRainy = artworkMode === "rainy-study";

  const roomImage = isRainy
    ? "/images/room/rainy_study_mode_a.jpg"
    : "/images/room/overcast_afternoon_mode_b.jpg";

  return (
    <div className="relative w-full min-h-screen bg-[#1E252B] text-[#FAF6EE] select-none overflow-x-hidden flex flex-col justify-between">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="relative z-40 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between bg-gradient-to-b from-[#182026]/90 via-[#182026]/60 to-transparent backdrop-blur-[2px]">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <HagridsLogo to="/" />
          <div className="hidden md:flex flex-col border-l border-[#FAF6EE]/15 pl-3">
            <span className="text-[11px] font-sans tracking-wide text-[#C4D2D5]/80">
              The Illustrated Rainy Study
            </span>
            <span className="text-[10px] font-serif italic text-[#C4D2D5]/60">
              Your corner of the world to get career-ready.
            </span>
          </div>
        </div>

        {/* Environmental Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Artwork Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-full bg-[#141C22]/80 border border-[#FAF6EE]/15 shadow-inner">
            <button
              onClick={() => setArtworkMode("rainy-study")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                isRainy
                  ? "bg-[#273D4B] text-[#FAF6EE] font-medium shadow-sm"
                  : "text-[#C4D2D5]/70 hover:text-[#FAF6EE]"
              }`}
              title="Rainy Study (Night & Warm Lamp)"
              aria-label="Switch to Rainy Study night mode"
            >
              <Moon className="w-3.5 h-3.5 text-[#D6A879]" />
              <span className="hidden sm:inline">Rainy Study</span>
            </button>
            <button
              onClick={() => setArtworkMode("overcast-afternoon")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                !isRainy
                  ? "bg-[#3B4D45] text-[#FAF6EE] font-medium shadow-sm"
                  : "text-[#C4D2D5]/70 hover:text-[#FAF6EE]"
              }`}
              title="Overcast Afternoon (Soft daylight)"
              aria-label="Switch to Overcast Afternoon daylight mode"
            >
              <Sun className="w-3.5 h-3.5 text-[#C4D2D5]" />
              <span className="hidden sm:inline">Overcast</span>
            </button>
          </div>

          {/* Ambience Audio Controller Button */}
          <AmbientSoundController />

          {/* Experience Mode Toggle */}
          <button
            onClick={() => {
              const next = experience === "cozy" ? "advanced" : "cozy";
              setExperience(next);
              if (next === "advanced") navigate("/dashboard");
            }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#141C22]/80 hover:bg-[#1E2E38] border border-[#FAF6EE]/15 text-[#C4D2D5] transition-colors"
            title="Switch between Illustrated Room and Compact Advanced Mode"
          >
            <Sliders className="w-3.5 h-3.5 text-[#8FA28B]" />
            <span>{experience === "cozy" ? "Advanced Mode" : "Cozy Room"}</span>
          </button>

          {/* Authentication State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF6EE]/10 hover:bg-[#FAF6EE]/15 border border-[#FAF6EE]/20 text-xs font-medium text-[#FAF6EE] transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-[#8FA28B] flex items-center justify-center text-[10px] text-[#1E252B] font-bold">
                  {user?.username ? user.username[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user?.username || "Study Desk"}
                </span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 rounded-full text-[#C4D2D5]/70 hover:text-[#FAF6EE] hover:bg-[#FAF6EE]/10 transition-colors"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalMode("signin");
                  setAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#FAF6EE] hover:bg-[#FAF6EE]/90 text-[#273D4B] text-xs font-medium transition-colors shadow-sm"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. THE ILLUSTRATED STUDY ROOM CANVAS */}
      <main className="relative flex-1 w-full max-w-[1600px] mx-auto flex items-center justify-center px-2 sm:px-6 py-2">
        <div className="relative w-full aspect-[16/9] max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-[#FAF6EE]/15">
          {/* Base Room Illustration (VANVAS Painterly Style) */}
          <img
            src={roomImage}
            alt="Illustrated study room with rainy window and warm desk lamp"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          />

          {/* Window Rain Animation Overlay (Over the large multi-pane window in the background) */}
          <div
            className="absolute top-0 left-[18%] w-[64%] h-[60%] pointer-events-none overflow-hidden opacity-75"
            aria-hidden="true"
          >
            <RainWindowEffect intensity={isRainy ? "medium" : "subtle"} />
          </div>

          {/* Warm Lamp Ambience Overlay (when lamp is on in Rainy Mode) */}
          {isRainy && lampOn && (
            <div
              className="absolute top-[20%] left-[20%] w-[45%] h-[55%] pointer-events-none rounded-full bg-[radial-gradient(ellipse_at_center,rgba(214,168,121,0.14)_0%,rgba(214,168,121,0.03)_60%,transparent_80%)] mix-blend-screen"
              aria-hidden="true"
            />
          )}

          {/* ==============================================================
              INTERACTIVE HOTSPOTS (Deliberate, painterly, accessible)
             ============================================================== */}

          {/* HOTSPOT 1: LAPTOP (Primary Study Desk Gateway) */}
          <div
            className="absolute left-[34%] top-[43%] w-[19%] h-[26%] z-20 group cursor-pointer"
            onClick={() => {
              if (isAuthenticated) {
                navigate("/dashboard");
              } else {
                setAuthModalMode("signin");
                setAuthModalOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(isAuthenticated ? "/dashboard" : "/login");
              }
            }}
            onMouseEnter={() => setActiveTooltip("laptop")}
            onMouseLeave={() => setActiveTooltip(null)}
            onFocus={() => setActiveTooltip("laptop")}
            onBlur={() => setActiveTooltip(null)}
            aria-label="Laptop screen: Enter Study Desk & Workspace"
          >
            {/* Soft Screen Glow and Live UI Peek */}
            <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:ring-2 group-hover:ring-[#D6A879]/70 group-hover:shadow-[0_0_24px_rgba(214,168,121,0.35)] flex flex-col items-center justify-center p-2">
              {/* Laptop Screen Content Card */}
              <div className="w-[84%] h-[72%] rounded-md bg-[#182026]/90 backdrop-blur-sm border border-[#FAF6EE]/15 p-2 flex flex-col justify-between text-left shadow-lg opacity-90 group-hover:opacity-100 transition-opacity">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#D6A879]">
                      Study Desk
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8FA28B] animate-pulse" />
                  </div>
                  <p className="text-[10px] font-medium text-[#FAF6EE] line-clamp-1">
                    {isAuthenticated ? `Welcome, ${user?.username}` : "Enter Your Study"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-[#C4D2D5]">
                  <LayoutDashboard className="w-2.5 h-2.5" />
                  <span>Open workspace →</span>
                </div>
              </div>
            </div>

            {/* Floating Tooltip */}
            {activeTooltip === "laptop" && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-[#FAF6EE] text-[#273D4B] text-xs font-serif shadow-lg border border-[#DFD3C1] whitespace-nowrap pointer-events-none z-30">
                <span>Enter Study Desk & Interview Dashboard</span>
              </div>
            )}
          </div>

          {/* HOTSPOT 2: OPEN NOTEBOOK (Resume Workshop) */}
          <div
            className="absolute left-[26%] top-[64%] w-[18%] h-[15%] z-20 group cursor-pointer"
            onClick={() => navigate("/resume-analyzer")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/resume-analyzer");
              }
            }}
            onMouseEnter={() => setActiveTooltip("notebook")}
            onMouseLeave={() => setActiveTooltip(null)}
            onFocus={() => setActiveTooltip("notebook")}
            onBlur={() => setActiveTooltip(null)}
            aria-label="Notebook: Open Resume Workshop"
          >
            <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:ring-2 group-hover:ring-[#8FA28B]/80 group-hover:shadow-[0_0_20px_rgba(143,162,139,0.3)]" />

            {/* Subtle floating badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#273D4B] text-[11px] font-serif shadow-md border border-[#DFD3C1] whitespace-nowrap pointer-events-none z-30 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-[#526C7A]" />
              <span>Resume Workshop</span>
            </div>
          </div>

          {/* HOTSPOT 3: BOOKSHELF & DESK BOOKS (Interview Practice) */}
          <div
            className="absolute left-[56%] top-[48%] w-[13%] h-[14%] z-20 group cursor-pointer"
            onClick={() => navigate("/practice")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/practice");
              }
            }}
            onMouseEnter={() => setActiveTooltip("books")}
            onMouseLeave={() => setActiveTooltip(null)}
            onFocus={() => setActiveTooltip("books")}
            onBlur={() => setActiveTooltip(null)}
            aria-label="Books: Open Interview Practice"
          >
            <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:ring-2 group-hover:ring-[#D6A879]/70 group-hover:shadow-[0_0_20px_rgba(214,168,121,0.3)]" />

            {/* Subtle floating badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#273D4B] text-[11px] font-serif shadow-md border border-[#DFD3C1] whitespace-nowrap pointer-events-none z-30 flex items-center gap-1.5">
              <Mic className="w-3 h-3 text-[#B66F54]" />
              <span>Interview Practice</span>
            </div>
          </div>

          {/* HOTSPOT 4: DESK LAMP (Lamp Ambient Toggle) */}
          <button
            onClick={() => setLampOn(!lampOn)}
            className="absolute left-[18%] top-[20%] w-[16%] h-[46%] z-20 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A879]"
            title={lampOn ? "Turn off desk lamp" : "Turn on desk lamp"}
            aria-label={lampOn ? "Turn off desk lamp" : "Turn on desk lamp"}
          >
            <div className="absolute top-[28%] left-[60%] w-6 h-6 rounded-full bg-transparent group-hover:bg-[#D6A879]/20 transition-colors flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#D6A879]/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* HOTSPOT 5: THE STUDY CAT (Signature Character on the chair) */}
          <div className="absolute right-[8%] bottom-[5%] w-[18%] max-w-[220px] z-30">
            <StudyCat
              onInteract={(state: CatState) => {
                setCatReaction(state);
              }}
            />
          </div>

          {/* Left Plant / Bookshelf Hotspot (Reports & Progress) */}
          <div
            className="absolute left-[1%] top-[30%] w-[14%] h-[40%] z-20 group cursor-pointer"
            onClick={() => navigate("/reports")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/reports");
              }
            }}
            aria-label="Bookshelf: View Progress & Reports"
          >
            <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:ring-1 group-hover:ring-[#8FA28B]/60" />
            <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#273D4B] text-[11px] font-serif shadow-md whitespace-nowrap pointer-events-none z-30 flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-[#314B40]" />
              <span>Career Progress</span>
            </div>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM FLOATING NAVIGATION (Accessible, Touch-Friendly) */}
      <footer className="relative z-40 w-full px-4 py-3 flex items-center justify-center">
        <nav
          className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-full bg-[#182026]/90 backdrop-blur-md border border-[#FAF6EE]/15 shadow-xl text-xs"
          aria-label="Primary product navigation"
        >
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6EE]/15 text-[#FAF6EE] font-medium"
          >
            <span>Study Room</span>
          </Link>
          <Link
            to="/resume-analyzer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#C4D2D5] hover:text-[#FAF6EE] hover:bg-[#FAF6EE]/10 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#8FA28B]" />
            <span className="hidden sm:inline">Resume</span>
          </Link>
          <Link
            to="/practice"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#C4D2D5] hover:text-[#FAF6EE] hover:bg-[#FAF6EE]/10 transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-[#B66F54]" />
            <span className="hidden sm:inline">Practice</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#C4D2D5] hover:text-[#FAF6EE] hover:bg-[#FAF6EE]/10 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#D6A879]" />
            <span className="hidden sm:inline">Desk</span>
          </Link>
          <Link
            to="/reports"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#C4D2D5] hover:text-[#FAF6EE] hover:bg-[#FAF6EE]/10 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#526C7A]" />
            <span className="hidden sm:inline">Progress</span>
          </Link>
        </nav>
      </footer>

      {/* 4. SHARED AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          navigate("/dashboard");
        }}
      />
    </div>
  );
}
