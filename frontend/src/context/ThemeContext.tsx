import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  getSettings,
  updateAppearanceSettings,
} from "../services/api";

export type ThemeMode = "dark" | "light" | "system";
export type ExperienceMode = "cozy" | "advanced";

type ThemeContextType = {
  theme: ThemeMode;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: ThemeMode, persist?: boolean) => void;
  experience: ExperienceMode;
  setExperience: (exp: ExperienceMode, persist?: boolean) => void;
  // Kept for any existing code still calling the old boolean API.
  darkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

const THEME_STORAGE_KEY = "hagrids-theme";
const EXPERIENCE_STORAGE_KEY = "hagrids-experience-mode";

function getSystemPrefersDark() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return true;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(theme: ThemeMode): "dark" | "light" {
  if (theme === "system") {
    return getSystemPrefersDark() ? "dark" : "light";
  }
  return theme;
}

function applyToDocument(resolved: "dark" | "light", experience: ExperienceMode) {
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-experience", experience);
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem("hiresense-theme");
    if (stored === "dark" || stored === "light" || stored === "system") {
      return stored;
    }
    return "dark";
  });

  const [experience, setExperienceState] = useState<ExperienceMode>(() => {
    const stored = localStorage.getItem(EXPERIENCE_STORAGE_KEY);
    if (stored === "cozy" || stored === "advanced") {
      return stored;
    }
    // The Cozy Experience is the default for Hagrid's Hut!
    return "cozy";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(
    () => resolve(theme)
  );

  // Apply immediately (and on every change) so there's no flash
  useEffect(() => {
    const resolved = resolve(theme);
    setResolvedTheme(resolved);
    applyToDocument(resolved, experience);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(EXPERIENCE_STORAGE_KEY, experience);
  }, [theme, experience]);

  // Follow OS theme changes live when in "system" mode
  useEffect(() => {
    if (theme !== "system" || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const resolved = resolve("system");
      setResolvedTheme(resolved);
      applyToDocument(resolved, experience);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme, experience]);

  // Sync with user's backend profile settings if signed in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    getSettings()
      .then((data) => {
        const savedTheme = data?.appearance?.theme;
        if (
          savedTheme === "dark" ||
          savedTheme === "light" ||
          savedTheme === "system"
        ) {
          setThemeState(savedTheme);
        }
        const savedExp = data?.appearance?.experience;
        if (savedExp === "cozy" || savedExp === "advanced") {
          setExperienceState(savedExp);
        }
      })
      .catch(() => {
        // Safe fallback to local preference
      });
  }, []);

  const setTheme = (next: ThemeMode, persist: boolean = true) => {
    setThemeState(next);

    if (persist && localStorage.getItem("token")) {
      updateAppearanceSettings({ theme: next }).catch(() => {});
    }
  };

  const setExperience = (next: ExperienceMode, persist: boolean = true) => {
    setExperienceState(next);

    if (persist && localStorage.getItem("token")) {
      updateAppearanceSettings({ experience: next } as any).catch(() => {});
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        experience,
        setExperience,
        darkMode: resolvedTheme === "dark",
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
