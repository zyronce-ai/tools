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
  const [reveal, setReveal] = useState<{ x: number; y: number; to: Theme } | null>(null);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = (e?: MouseEvent<HTMLElement>) => {
    const x = e?.clientX ?? window.innerWidth - 60;
    const y = e?.clientY ?? 30;
    const to: Theme = theme === "light" ? "dark" : "light";
    setReveal({ x, y, to });
  };

  const handleAnimationEnd = () => {
    if (reveal) {
      setTheme(reveal.to);
      setReveal(null);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
      {reveal && (
        <div
          key={reveal.to}
          className="fixed inset-0 z-[9999] pointer-events-none theme-reveal"
          style={{
            background: reveal.to === "dark" ? "#0F0F13" : "#F5F5F5",
            clipPath: `circle(0px at ${reveal.x}px ${reveal.y}px)`,
            // @ts-expect-error -- custom CSS property for keyframes
            "--reveal-x": `${reveal.x}px`,
            "--reveal-y": `${reveal.y}px`,
          }}
          onAnimationEnd={handleAnimationEnd}
        />
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}