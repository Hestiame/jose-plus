"use client";

import { useEffect, useState } from "react";
import Mascot from "@/components/Mascot";

export type ReactionType = "risada" | "matematica" | "elogio" | "despedida" | "duvida" | "normal";

type MascotReactionProps = {
  tipo: ReactionType;
  quadro?: string | null;
  onDone: () => void;
};

const DURATIONS: Record<ReactionType, number> = {
  risada: 2800,
  matematica: 4500,
  elogio: 3000,
  despedida: 2600,
  duvida: 2600,
  normal: 0
};

export default function MascotReaction({ tipo, quadro, onDone }: MascotReactionProps) {
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (tipo === "normal") return;
    setLanded(false);
    const landTimer = setTimeout(() => setLanded(true), 900);
    const doneTimer = setTimeout(onDone, DURATIONS[tipo]);
    return () => {
      clearTimeout(landTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  if (tipo === "normal") return null;

  let mascotAnim = "animate-fly-in";
  if (landed) {
    mascotAnim = tipo === "despedida" ? "animate-fly-out" : "animate-mascot-idle";
    if (landed && tipo === "risada") mascotAnim += " animate-wiggle";
  }

  return (
    <div className="fixed inset-x-0 bottom-28 z-40 flex flex-col items-center pointer-events-none px-4">
      <div className={`w-32 h-32 sm:w-36 sm:h-36 ${mascotAnim}`}>
        <Mascot />
      </div>

      {landed && tipo === "risada" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 text-base -mt-2 animate-fade-in shadow-xl shadow-black/30">
          kkkkk 😂
        </div>
      )}

      {landed && tipo === "matematica" && (
        <div className="bg-zinc-950 border-4 border-[#5c3a21] rounded-xl px-5 py-4 shadow-2xl shadow-black/50 -mt-3 max-w-[280px] animate-card-drop">
          <p
            className="text-white text-lg leading-snug text-center"
            style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}
          >
            {quadro || "calculando..."}
          </p>
        </div>
      )}

      {landed && tipo === "elogio" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 text-base -mt-2 animate-fade-in shadow-xl shadow-black/30">
          🎉 Isaa! 🎉
        </div>
      )}

      {landed && tipo === "despedida" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 text-base -mt-2 animate-fade-in shadow-xl shadow-black/30">
          até mais! 👋
        </div>
      )}

      {landed && tipo === "duvida" && (
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 text-base -mt-2 animate-fade-in shadow-xl shadow-black/30">
          hmm... 🤔
        </div>
      )}
    </div>
  );
}
