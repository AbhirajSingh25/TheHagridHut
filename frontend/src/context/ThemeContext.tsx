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

type ThemeContextType = {
  theme: ThemeMode;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: ThemeMode, persist?: boolean) => void;
  // Kept for any existing code still calling the old boolean API.
  darkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

const STORAGE_KEY = "hiresense-theme";

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

function applyToDocument(resolved: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light" || stored === "system") {
      return stored;
    }
    return "dark";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(
    () => resolve(theme)
  );

  // Apply immediately (and on every change) so there's no flash of
  // the wrong theme, and so the effect works even before the
  // backend has responded.
  useEffect(() => {
    const resolved = resolve(theme);
    setResolvedTheme(resolved);
    applyToDocument(resolved);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Follow OS theme changes live when in "system" mode.
  useEffect(() => {
    if (theme !== "system" || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const resolved = resolve("system");
      setResolvedTheme(resolved);
      applyToDocument(resolved);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  // On first load, if the user is signed in, prefer whatever theme
  // is saved on their account over the local device default -
  // that's what makes it a real per-account preference rather than
  // just a per-browser one.
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
      })
      .catch(() => {
        // Not signed in yet, or backend unreachable - the local/
        // default theme set above still applies, so the UI never
        // breaks because of this.
      });
    // Only ever run once per app load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = (next: ThemeMode, persist: boolean = true) => {
    setThemeState(next);

    if (persist && localStorage.getItem("token")) {
      updateAppearanceSettings({ theme: next }).catch(() => {
        // Theme still applies visually even if the save fails -
        // it'll just fall back to the local value next reload.
      });
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
