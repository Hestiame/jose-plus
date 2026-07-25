"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Contrast } from "lucide-react";

const KEY = "jose-plus-theme";
type Theme = "dark" | "light" | "contraste";
const ORDER: Theme[] = ["dark", "light", "contraste"];
const LABELS: Record<Theme, string> = {
  dark: "Tema escuro",
  light: "Tema claro",
  contraste: "Alto contraste"
};

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "contraste");
  if (theme !== "dark") document.documentElement.classList.add(theme);
}

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme) || "dark";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(KEY, next);
  }

  const Icon = theme === "dark" ? Sun : theme === "light" ? Contrast : Moon;

  return (
    <button
      onClick={cycle}
      title={`${LABELS[theme]} — toque pra trocar`}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:bg-zinc-800/50 transition-colors ${className || ""}`}
    >
      <Icon size={15} />
    </button>
  );
}
