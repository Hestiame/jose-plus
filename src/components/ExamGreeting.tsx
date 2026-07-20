"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import Mascot from "@/components/Mascot";
import FlashcardModal from "@/components/FlashcardModal";

type Prova = { id: string; materia: string; conteudo: string | null; data: string };

const KEY = "jose-plus-last-greeting";

function formatData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export default function ExamGreeting() {
  const [phase, setPhase] = useState<"voando" | "oi" | "flash" | "aviso" | "escondido">("escondido");
  const [prova, setProva] = useState<Prova | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem(KEY);
    if (lastShown === today) return; // já apareceu hoje, não repete

    supabaseBrowser
      .from("provas")
      .select("id, materia, conteudo, data")
      .gte("data", today)
      .order("data", { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProva(data[0]);
          localStorage.setItem(KEY, today);
          // pequena espera pra não competir com a animação de boas-vindas do VisitorGate
          setTimeout(() => setPhase("voando"), 900);
        }
      });
  }, []);

  useEffect(() => {
    if (phase === "voando") {
      const t = setTimeout(() => setPhase("oi"), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "oi") {
      const t = setTimeout(() => setPhase("flash"), 1200);
      return () => clearTimeout(t);
    }
    if (phase === "flash") {
      const t = setTimeout(() => setPhase("aviso"), 550);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase === "escondido" || !prova) return null;

  const mascotSettled = phase !== "voando";

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none px-4">
        <button
          onClick={() => setPhase("escondido")}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 pointer-events-auto"
        >
          <X size={20} />
        </button>

        <div
          className={`w-[62vw] max-w-[280px] ${phase === "voando" ? "animate-fly-in" : ""} ${
            mascotSettled && phase !== "flash" ? "animate-mascot-idle" : ""
          }`}
        >
          <Mascot bounce={false} />
        </div>

        {phase === "flash" && <div className="fixed inset-0 bg-white animate-camera-flash pointer-events-none" />}

        {phase === "oi" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 text-sm text-zinc-200 mt-2 animate-fade-in">
            Oi! 👋
          </div>
        )}

        {phase === "aviso" && (
          <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl shadow-black/40 mt-3 animate-card-drop pointer-events-auto">
            <p className="text-sm text-zinc-200 leading-relaxed text-center">
              Ó, capturei aqui: tem prova de <b className="text-amber-300">{prova.materia}</b> dia{" "}
              <b className="text-amber-300">{formatData(prova.data)}</b>!
            </p>
            {prova.conteudo && (
              <button
                onClick={() => setShowFlashcards(true)}
                className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-zinc-900 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg py-2 mt-3 hover:brightness-110 transition-all"
              >
                <Sparkles size={12} /> Gerar flashcards de revisão
              </button>
            )}
          </div>
        )}
      </div>

      {showFlashcards && prova.conteudo && (
        <FlashcardModal
          materia={prova.materia}
          conteudo={prova.conteudo}
          onClose={() => {
            setShowFlashcards(false);
            setPhase("escondido");
          }}
        />
      )}
    </>
  );
}
