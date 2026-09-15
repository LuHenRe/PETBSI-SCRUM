"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "petbsi-theme";

function currentTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

export function ThemeToggle({ className = "", style }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // armazenamento indisponível: mantém apenas o tema da sessão
    }
    setTheme(next);
  };

  const dark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      style={style}
      onClick={toggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={dark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {dark ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
    </button>
  );
}