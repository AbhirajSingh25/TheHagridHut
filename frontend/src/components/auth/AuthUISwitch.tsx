import { useEffect, useState } from "react";

type AuthUITheme = "advanced" | "hiresense";

interface AuthUISwitchProps {
  onThemeChange?: (theme: AuthUITheme) => void;
}

const STORAGE_KEY = "hiresense_auth_ui";

export default function AuthUISwitch({
  onThemeChange,
}: AuthUISwitchProps) {
  const [theme, setTheme] = useState<AuthUITheme>(() => {
    const savedTheme = localStorage.getItem(
      STORAGE_KEY,
    );

    return savedTheme === "hiresense"
      ? "hiresense"
      : "advanced";
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      theme,
    );

    onThemeChange?.(
      theme,
    );
  }, [
    theme,
    onThemeChange,
  ]);

  const handleSwitch = () => {
    setTheme(
      (currentTheme) =>
        currentTheme === "advanced"
          ? "hiresense"
          : "advanced",
    );
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      className="
        fixed
        top-6
        right-6
        z-[100]
        inline-flex
        items-center
        gap-2
        rounded-xl
        border
        border-slate-700/70
        bg-slate-950/80
        px-4
        py-2.5
        text-sm
        font-medium
        text-slate-200
        shadow-xl
        backdrop-blur-md
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-cyan-400/50
        hover:bg-slate-900
        hover:text-white
        focus:outline-none
        focus:ring-2
        focus:ring-cyan-400/50
      "
    >
      <span className="text-base">
        {theme === "advanced"
          ? "◈"
          : "✦"}
      </span>

      {theme === "advanced"
        ? "Switch to HireSense UI"
        : "Switch to Modern UI"}
    </button>
  );
}