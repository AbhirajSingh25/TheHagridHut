import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import { Sparkles, Terminal } from "lucide-react";

type ExperienceToggleProps = {
  className?: string;
  variant?: "pill" | "compact" | "expanded";
};

export default function ExperienceToggle({
  className = "",
  variant = "pill",
}: ExperienceToggleProps) {
  const { experience, setExperience } = useTheme();

  const isCozy = experience === "cozy";

  if (variant === "compact") {
    return (
      <button
        onClick={() => setExperience(isCozy ? "advanced" : "cozy")}
        className={`touch-target relative px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 text-xs font-medium ${
          isCozy
            ? "bg-[#2E231C]/90 border-[#E8AD62]/40 text-[#F6CD8B] hover:border-[#E8AD62]"
            : "bg-[#121824]/90 border-[#10B981]/40 text-[#34D399] hover:border-[#10B981]"
        } ${className}`}
        title={`Switch to ${isCozy ? "Advanced Mode" : "Cozy Experience"}`}
        aria-label={`Current mode: ${isCozy ? "Cozy Experience" : "Advanced Mode"}. Click to toggle.`}
      >
        {isCozy ? (
          <>
            <span className="w-2 h-2 rounded-full bg-[#E8AD62] animate-pulse" />
            <span>Cozy</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Advanced</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl bg-[#1A1512]/90 border border-[rgba(232,173,98,0.18)] shadow-inner ${className}`}
      role="group"
      aria-label="Experience switcher"
    >
      <button
        type="button"
        onClick={() => setExperience("cozy")}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
          isCozy
            ? "text-[#FFF7E9] shadow-sm"
            : "text-[#B9AB97] hover:text-[#FFF7E9]"
        }`}
      >
        {isCozy && (
          <motion.div
            layoutId="activeExperienceTab"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#35251D] to-[#4B3024] border border-[#E8AD62]/40 shadow-md"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <Sparkles className={`w-3.5 h-3.5 ${isCozy ? "text-[#E8AD62]" : "text-gray-400"}`} />
          <span>Cozy Experience</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => setExperience("advanced")}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
          !isCozy
            ? "text-[#FFFFFF] shadow-sm"
            : "text-[#B9AB97] hover:text-[#FFF7E9]"
        }`}
      >
        {!isCozy && (
          <motion.div
            layoutId="activeExperienceTab"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#121824] to-[#182030] border border-[#10B981]/50 shadow-md"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <Terminal className={`w-3.5 h-3.5 ${!isCozy ? "text-[#10B981]" : "text-gray-400"}`} />
          <span>Advanced Mode</span>
        </span>
      </button>
    </div>
  );
}
