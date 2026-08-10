import { createContext, useContext, useEffect, useState, ReactNode, MouseEvent } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: MouseEvent<HTMLElement>) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "light";
    }
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = (e?: MouseEvent<HTMLElement>) => {
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? 60;
    const doc = document.documentElement;
    doc.style.setProperty("--reveal-x", `${x}px`);
    doc.style.setProperty("--reveal-y", `${y}px`);

    const next: Theme = theme === "light" ? "dark" : "light";
    const apply = () => setTheme(next);

    const svt = (document as any).startViewTransition;
    if (svt) {
      svt.call(document, apply);
    } else {
      apply();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}