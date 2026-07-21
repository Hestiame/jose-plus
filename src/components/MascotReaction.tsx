"use client";

import { useEffect } from "react";
import Mascot from "@/components/Mascot";

export type ReactionType = "risada" | "matematica" | "elogio" | "despedida" | "duvida" | "normal";

type MascotReactionProps = {
  tipo: ReactionType;
  quadro?: string | null;
  onDone: () => void;
};

const DURATIONS: Record<ReactionType, number> = {
  risada: 2400,
  matematica: 4200,
  elogio: 2800,
  despedida: 2200,
  duvida: 2400,
  normal: 0
};

export default function MascotReaction({ tipo, quadro, onDone }: MascotReactionProps) {
  useEffect(() => {
    if (tipo === "normal") return;
    const t = setTimeout(onDone, DURATIONS[tipo]);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  if (tipo === "normal") return null;

  return (
    <div className="fixed bottom-24 left-3 z-40 pointer-events-none select-none">
      {tipo === "risada" && (
        <div className="flex items-end gap-1.5 animate-wiggle">
          <div className="w-14 h-14">
            <Mascot bounce />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-2.5 py-1 text-sm mb-2 animate-fade-in">
            kkkkk 😂
          </div>
        </div>
      )}

      {tipo === "matematica" && (
        <div className="flex items-end gap-2 animate-card-drop">
          <div className="w-12 h-12 shrink-0">
            <Mascot />
          </div>
          <div className="bg-zinc-950 border-4 border-[#5c3a21] rounded-lg px-3 py-2.5 shadow-xl shadow-black/40 mb-1 max-w-[220px]">
            <p
              className="text-white text-sm leading-snug"
              style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
            >
              {quadro || "calculando..."}
            </p>
          </div>
        </div>
      )}

      {tipo === "elogio" && (
        <div className="relative w-16 h-16 animate-bounce">
          <Mascot />
          <span className="absolute -top-2 -right-1 text-lg">🎉</span>
        </div>
      )}

      {tipo === "despedida" && (
        <div className="flex items-center gap-1.5 animate-fly-out">
          <div className="w-14 h-14">
            <Mascot />
          </div>
          <span className="text-lg mb-1">👋</span>
        </div>
      )}

      {tipo === "duvida" && (
        <div className="relative w-14 h-14 animate-fade-in">
          <Mascot />
          <span className="absolute -top-3 -right-2 text-xl animate-bounce">❓</span>
        </div>
      )}
    </div>
  );
}
