import {
  createContext,
  useContext,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

type ThemeContextType = {
  darkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext =
  createContext<
    ThemeContextType | undefined
  >(undefined);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [darkMode, setDarkMode] =
    useState(true);

  const toggleTheme = () => {

    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
      }}
    >

      {children}

    </ThemeContext.Provider>
  );
}

export function useTheme() {

  const context =
    useContext(ThemeContext);

  if (!context) {

    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}