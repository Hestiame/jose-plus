"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const KEY = "jose-plus-theme";

export default function ThemeToggle({ className }: { className?: string }) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const isLight = saved === "light";
    setLight(isLight);
    document.documentElement.classList.toggle("light", isLight);
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem(KEY, next ? "light" : "dark");
  }

  return (
    <button
      onClick={toggle}
      title={light ? "Mudar para tema escuro" : "Mudar para tema claro"}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:bg-zinc-800/50 transition-colors ${className || ""}`}
    >
      {light ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}
