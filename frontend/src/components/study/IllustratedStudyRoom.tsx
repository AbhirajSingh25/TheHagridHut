import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Mic,
  LayoutDashboard,
  BarChart3,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  LogOut,
  ChevronRight,
  Coffee,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import HagridsLogo from "../shared/HagridsLogo";
import RainWindowEffect from "../shared/RainWindowEffect";
import AmbientSoundController from "../shared/AmbientSoundController";
import StudyCat, { CatState, CatSpot } from "./StudyCat";
import AuthModal from "../auth/AuthModal";

export default function IllustratedStudyRoom() {
  const { user, isAuthenticated, logout } = useAuth();
  const { artworkMode, setArtworkMode, experience, setExperience } = useTheme();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isRainy = artworkMode === "rainy-study";
  const roomImage = isRainy
    ? "/images/room/rainy_study_mode_a.jpg"
    : "/images/room/overcast_afternoon_mode_b.jpg";

  const handleNavigateWithTransition = (to: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(to);
    }, 280);
  };

  return (
    <div className="relative w-full h-screen min-h-[600px] bg-[#141C22] text-[#FAF6EE] select-none overflow-hidden flex flex-col justify-between">
      {/* 1. TOP HEADER: Clean, restrained, storybook editorial feel */}
      <header className="relative z-40 w-full px-5 sm:px-8 py-3.5 flex items-center justify-between bg-gradient-to-b from-[#141C22]/95 via-[#141C22]/70 to-transparent backdrop-blur-[2px]">
        {/* Brand & subtle endorsement */}
        <div className="flex items-center gap-3">
          <HagridsLogo to="/" />
          <div className="hidden sm:flex flex-col border-l border-[#FAF6EE]/15 pl-3">
            <span className="text-[11px] font-sans tracking-wide text-[#C4D2D5]/90">
              The Illustrated Study
            </span>
            <span className="text-[10px] font-serif italic text-[#C4D2D5]/60">
              A product of The Sorted Club
            </span>
          </div>
        </div>

        {/* Environmental Controls & Sign In */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Artwork Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-full bg-[#18232B]/90 border border-[#FAF6EE]/15 shadow-sm">
            <button
              onClick={() => setArtworkMode("rainy-study")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                isRainy
                  ? "bg-[#273D4B] text-[#FAF6EE] font-medium shadow-sm"
                  : "text-[#C4D2D5]/70 hover:text-[#FAF6EE]"
              }`}
              title="Rainy Study (Night & Warm Lamp)"
              aria-label="Switch to Rainy Study night mode"
            >
              <Moon className="w-3.5 h-3.5 text-[#D6A879]" />
              <span className="hidden sm:inline">Rainy Night</span>
            </button>
            <button
              onClick={() => setArtworkMode("overcast-afternoon")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                !isRainy
                  ? "bg-[#33463D] text-[#FAF6EE] font-medium shadow-sm"
                  : "text-[#C4D2D5]/70 hover:text-[#FAF6EE]"
              }`}
              title="Overcast Afternoon (Soft daylight)"
              aria-label="Switch to Overcast Afternoon daylight mode"
            >
              <Sun className="w-3.5 h-3.5 text-[#C4D2D5]" />
              <span className="hidden sm:inline">Overcast</span>
            </button>
          </div>

          {/* Ambience Audio Toggle */}
          <AmbientSoundController />

          {/* Advanced Mode Switcher */}
          <button
            onClick={() => {
              const next = experience === "cozy" ? "advanced" : "cozy";
              setExperience(next);
              if (next === "advanced") navigate("/dashboard");
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#18232B]/80 hover:bg-[#1E2E38] border border-[#FAF6EE]/15 text-[#C4D2D5] transition-colors"
            title="Toggle between Cozy Room and Analytical Advanced Mode"
          >
            <Sliders className="w-3.5 h-3.5 text-[#8FA28B]" />
            <span>{experience === "cozy" ? "Advanced Mode" : "Cozy Room"}</span>
          </button>

          {/* User Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigateWithTransition("/dashboard")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF6EE]/10 hover:bg-[#FAF6EE]/15 border border-[#FAF6EE]/20 text-xs font-medium text-[#FAF6EE] transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-[#8FA28B] flex items-center justify-center text-[10px] text-[#1E252B] font-bold">
                  {user?.username ? user.username[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline max-w-[110px] truncate">
                  {user?.username || "Study Desk"}
                </span>
              </button>
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
            <button
              onClick={() => {
                setAuthModalMode("signin");
                setAuthModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-full bg-[#FAF6EE] hover:bg-[#FAF6EE]/90 text-[#273D4B] text-xs font-medium transition-colors shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* 2. THE LIVING STUDY ROOM ENVIRONMENT (Full Viewport Immersive Scene) */}
      <main
        className={`relative flex-1 w-full h-full overflow-hidden transition-opacity duration-300 ${
          isTransitioning ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
        }`}
      >
        {/* Layer 0: Base Room Illustration (Clean room, NO CAT in background) */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <div className="relative w-full h-full max-w-[1920px] aspect-[16/9] max-h-screen">
            <img
              src={roomImage}
              alt="Illustrated rainy study room with warm desk and open window"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            />

            {/* Layer 1: Window Rain Animation Overlay (precisely mapped over the large window) */}
            <div
              className="absolute top-0 left-[20%] w-[62%] h-[62%] pointer-events-none overflow-hidden opacity-80"
              aria-hidden="true"
            >
              <RainWindowEffect intensity={isRainy ? "medium" : "subtle"} />
            </div>

            {/* Layer 2: Lamp Light Glow (when lamp is on in Rainy Mode) */}
            {isRainy && lampOn && (
              <div
                className="absolute top-[22%] left-[24%] w-[38%] h-[56%] pointer-events-none rounded-full bg-[radial-gradient(ellipse_at_center,rgba(214,168,121,0.18)_0%,rgba(214,168,121,0.05)_55%,transparent_75%)] mix-blend-screen transition-opacity duration-500"
                aria-hidden="true"
              />
            )}

            {/* Gentle Coffee Steam effect */}
            <div
              className="absolute left-[48.5%] top-[57%] w-6 h-10 pointer-events-none opacity-40 animate-pulse"
              style={{ animationDuration: "3.5s" }}
              aria-hidden="true"
            >
              <div className="w-1.5 h-6 mx-auto rounded-full bg-gradient-to-t from-white/20 to-transparent blur-[1px]" />
            </div>

            {/* ==============================================================
                NATURAL INTERACTIVE ROOM OBJECTS (Aligned directly to art)
               ============================================================== */}

            {/* 1. LAPTOP SCREEN: Naturally integrated at perspective */}
            <div
              style={{
                position: "absolute",
                left: "27.2%",
                top: "52.8%",
                width: "12.2%",
                height: "17%",
                transform: "perspective(500px) rotateY(-3.5deg) rotateX(1deg)",
                transformOrigin: "center bottom",
                zIndex: 22,
              }}
              className="group cursor-pointer"
              onClick={() => {
                if (isAuthenticated) {
                  handleNavigateWithTransition("/dashboard");
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
                  if (isAuthenticated) handleNavigateWithTransition("/dashboard");
                  else setAuthModalOpen(true);
                }
              }}
              onMouseEnter={() => setActiveTooltip("laptop")}
              onMouseLeave={() => setActiveTooltip(null)}
              onFocus={() => setActiveTooltip("laptop")}
              onBlur={() => setActiveTooltip(null)}
              aria-label="Laptop screen: Enter Study Desk & Workspace"
            >
              {/* Screen Bezel Glow & Interface */}
              <div className="w-full h-full rounded-sm bg-[#121A20]/95 backdrop-blur-sm border border-[#C4D2D5]/20 p-2 flex flex-col justify-between text-left shadow-[0_0_16px_rgba(214,168,121,0.15)] group-hover:shadow-[0_0_24px_rgba(214,168,121,0.4)] group-hover:border-[#D6A879]/60 transition-all">
                <div>
                  <div className="flex items-center justify-between border-b border-[#FAF6EE]/10 pb-1 mb-1">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-[#D6A879]">
                      Study Desk
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8FA28B] animate-ping" />
                  </div>
                  <p className="text-[9px] font-serif font-medium text-[#FAF6EE] line-clamp-1">
                    {isAuthenticated ? `Welcome back, ${user?.username}` : "Your Career Desk"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[8px] text-[#C4D2D5]/90 pt-1 border-t border-[#FAF6EE]/10">
                  <span className="flex items-center gap-1 font-sans">
                    <LayoutDashboard className="w-2.5 h-2.5 text-[#8FA28B]" />
                    <span>Open Desk</span>
                  </span>
                  <ChevronRight className="w-2.5 h-2.5 text-[#D6A879] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Tooltip */}
              {activeTooltip === "laptop" && (
                <div className="absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-[#FAF6EE] text-[#273D4B] text-[11px] font-serif shadow-lg border border-[#DFD3C1] whitespace-nowrap pointer-events-none z-30">
                  <span>Enter Study Desk & Interview Dashboard</span>
                </div>
              )}
            </div>

            {/* 2. THE OPEN NOTEBOOK: Resume Workshop */}
            <div
              style={{
                position: "absolute",
                left: "24.5%",
                top: "76%",
                width: "17%",
                height: "14%",
                zIndex: 23,
              }}
              className="group cursor-pointer"
              onClick={() => handleNavigateWithTransition("/resume-analyzer")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigateWithTransition("/resume-analyzer");
                }
              }}
              onMouseEnter={() => setActiveTooltip("notebook")}
              onMouseLeave={() => setActiveTooltip(null)}
              onFocus={() => setActiveTooltip("notebook")}
              onBlur={() => setActiveTooltip(null)}
              aria-label="Open Notebook: Resume Workshop"
            >
              <div className="w-full h-full rounded-lg transition-all duration-300 group-hover:ring-2 group-hover:ring-[#8FA28B]/80 group-hover:shadow-[0_0_20px_rgba(143,162,139,0.35)]" />

              {/* Discreet floating badge on hover */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#273D4B] text-[11px] font-serif shadow-md border border-[#DFD3C1] whitespace-nowrap pointer-events-none z-30 flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-[#526C7A]" />
                <span>Resume Workshop</span>
              </div>
            </div>

            {/* 3. BOOK STACK (Interview Practice) */}
            <div
              style={{
                position: "absolute",
                left: "11.5%",
                top: "70%",
                width: "15%",
                height: "16%",
                zIndex: 23,
              }}
              className="group cursor-pointer"
              onClick={() => handleNavigateWithTransition("/practice")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigateWithTransition("/practice");
                }
              }}
              onMouseEnter={() => setActiveTooltip("books")}
              onMouseLeave={() => setActiveTooltip(null)}
              onFocus={() => setActiveTooltip("books")}
              onBlur={() => setActiveTooltip(null)}
              aria-label="Books: Interview Practice"
            >
              <div className="w-full h-full rounded-lg transition-all duration-300 group-hover:ring-2 group-hover:ring-[#D6A879]/70 group-hover:shadow-[0_0_20px_rgba(214,168,121,0.3)]" />

              <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#273D4B] text-[11px] font-serif shadow-md border border-[#DFD3C1] whitespace-nowrap pointer-events-none z-30 flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-[#B66F54]" />
                <span>Interview Practice</span>
              </div>
            </div>

            {/* 4. BRASS DESK LAMP: Light Switch */}
            <button
              style={{
                position: "absolute",
                left: "26%",
                top: "28%",
                width: "14%",
                height: "36%",
                zIndex: 24,
              }}
              onClick={() => setLampOn(!lampOn)}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A879]"
              title={lampOn ? "Turn off desk lamp" : "Turn on desk lamp"}
              aria-label={lampOn ? "Turn off desk lamp" : "Turn on desk lamp"}
            >
              <div className="absolute top-[24%] left-[62%] w-7 h-7 rounded-full bg-transparent group-hover:bg-[#D6A879]/20 transition-colors flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#D6A879]/80 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* 5. LEFT BOOKSHELF: Progress & Reports */}
            <div
              style={{
                position: "absolute",
                left: "0%",
                top: "20%",
                width: "15%",
                height: "55%",
                zIndex: 22,
              }}
              className="group cursor-pointer"
              onClick={() => handleNavigateWithTransition("/reports")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigateWithTransition("/reports");
                }
              }}
              aria-label="Bookshelf: View Career Progress & Reports"
            >
              <div className="w-full h-full transition-all group-hover:bg-[#8FA28B]/5" />
              <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#273D4B] text-[11px] font-serif shadow-md whitespace-nowrap pointer-events-none z-30 flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3 text-[#314B40]" />
                <span>Career Reports</span>
              </div>
            </div>

            {/* 6. THE LIVING STUDY CAT: Exactly ONE cat, moving between chair, rug, and desk */}
            <StudyCat
              onInteract={(state: CatState, spot: CatSpot) => {
                // User interacted with the cat
              }}
            />
          </div>
        </div>
      </main>

      {/* 3. BOTTOM FLOATING NAVIGATION: Unobtrusive, accessible dock */}
      <footer className="relative z-40 w-full px-4 py-3 flex items-center justify-center bg-gradient-to-t from-[#141C22]/95 via-[#141C22]/60 to-transparent">
        <nav
          className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-full bg-[#18232B]/90 backdrop-blur-md border border-[#FAF6EE]/15 shadow-xl text-xs"
          aria-label="Primary room navigation"
        >
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6EE]/15 text-[#FAF6EE] font-medium"
          >
            <span>Study Room</span>
          </Link>
          <button
            onClick={() => handleNavigateWithTransition("/resume-analyzer")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#C4D2D5] hover:text-[#FAF6EE] hover:bg-[#FAF6EE]/10 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#8FA28B]" />
            <span className="hidden sm:inline">Resume</span>
          </button>
          <button
            onClick={() => handleNavigateWithTransition("/practice")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#C4D2D5] hover:text-[#FAF6EE] hover:bg-[#FAF6EE]/10 transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-[#B66F54]" />
            <span className="hidden sm:inline">Practice</span>
          </button>
          <button
            onClick={() => handleNavigateWithTransition("/dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#C4D2D5] hover:text-[#FAF6EE] hover:bg-[#FAF6EE]/10 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#D6A879]" />
            <span className="hidden sm:inline">Desk</span>
          </button>
          <button
            onClick={() => handleNavigateWithTransition("/reports")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#C4D2D5] hover:text-[#FAF6EE] hover:bg-[#FAF6EE]/10 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#526C7A]" />
            <span className="hidden sm:inline">Progress</span>
          </button>
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
