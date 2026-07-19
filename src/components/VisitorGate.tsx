"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

const KEY = "jose-plus-visitor-type";

export default function VisitorGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (!saved) setShow(true);
  }, []);

  async function choose(tipo: "aluno" | "visitante") {
    localStorage.setItem(KEY, tipo);
    setShow(false);
    try {
      await supabaseBrowser.from("visitantes").insert({ tipo });
    } catch {
      // não bloqueia o uso do chat se esse registro falhar
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center animate-fade-in">
        <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-black text-xl mb-4">
          +
        </div>
        <h2 className="font-display text-base font-bold text-zinc-100 mb-1">Bem-vindo(a) ao José+</h2>
        <p className="text-zinc-500 text-sm mb-5">Você é aluno(a) desta escola?</p>
        <div className="flex gap-2">
          <button
            onClick={() => choose("aluno")}
            className="flex-1 bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-900 font-semibold rounded-xl py-2 text-sm hover:brightness-110 transition-all"
          >
            Sim, sou aluno
          </button>
          <button
            onClick={() => choose("visitante")}
            className="flex-1 border border-zinc-700 text-zinc-300 rounded-xl py-2 text-sm hover:bg-zinc-800 transition-colors"
          >
            Só visitando
          </button>
        </div>
      </div>
    </div>
  );
}
