import { useTheme } from "../../context/ThemeContext";
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
        className={`touch-target px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
          isCozy
            ? "bg-[#FAF5EC] dark:bg-[#342C25] border-[#AC7256]/30 text-[#AC7256]"
            : "bg-[#282C30] border-[#7A8065]/40 text-[#ADB09A]"
        } ${className}`}
        title={`Current mode: ${isCozy ? "Cozy Experience" : "Advanced Mode"}. Click to toggle.`}
        aria-label={`Current mode: ${isCozy ? "Cozy Experience" : "Advanced Mode"}. Click to toggle.`}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCozy ? "bg-[#AC7256]" : "bg-[#7A8065]"
            }`}
          />
          <span>{isCozy ? "Cozy" : "Advanced"}</span>
        </div>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-lg bg-[#F0E9DC] dark:bg-[#2A231C] border border-[#49372B]/12 dark:border-[#E5D6BE]/12 ${className}`}
      role="group"
      aria-label="Experience switcher"
    >
      <button
        type="button"
        onClick={() => setExperience("cozy")}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
          isCozy
            ? "bg-[#FAF5EC] dark:bg-[#342C25] text-[#302820] dark:text-[#FAF5EC] shadow-sm font-semibold"
            : "text-[#6B5D50] dark:text-[#B8AFA3] hover:text-[#302820] dark:hover:text-[#FAF5EC]"
        }`}
      >
        <Sparkles className={`w-3.5 h-3.5 ${isCozy ? "text-[#AC7256]" : "text-[#9B8D7F]"}`} />
        <span>Cozy Experience</span>
      </button>

      <button
        type="button"
        onClick={() => setExperience("advanced")}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
          !isCozy
            ? "bg-[#282C30] text-[#ECEEF0] shadow-sm font-semibold"
            : "text-[#6B5D50] dark:text-[#B8AFA3] hover:text-[#302820] dark:hover:text-[#FAF5EC]"
        }`}
      >
        <Terminal className={`w-3.5 h-3.5 ${!isCozy ? "text-[#7A8065]" : "text-[#9B8D7F]"}`} />
        <span>Advanced Mode</span>
      </button>
    </div>
  );
}
