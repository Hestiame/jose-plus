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
  const [phase, setPhase] = useState<"oi" | "flash" | "aviso" | "escondido">("escondido");
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
          setTimeout(() => setPhase("oi"), 900);
        }
      });
  }, []);

  useEffect(() => {
    if (phase === "oi") {
      const t = setTimeout(() => setPhase("flash"), 1100);
      return () => clearTimeout(t);
    }
    if (phase === "flash") {
      const t = setTimeout(() => setPhase("aviso"), 550);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase === "escondido" || !prova) return null;

  return (
    <>
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xs">
        {phase === "oi" && (
          <div className="flex flex-col items-center animate-fade-in">
            <Mascot size={64} bounce />
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-1.5 text-xs text-zinc-300 mt-1">
              Oi! 👋
            </div>
          </div>
        )}

        {phase === "flash" && (
          <div className="flex flex-col items-center">
            <Mascot size={64} />
            <div className="fixed inset-0 bg-white animate-camera-flash pointer-events-none" />
          </div>
        )}

        {phase === "aviso" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 shadow-xl shadow-black/30 flex items-start gap-3 animate-card-drop">
            <Mascot size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Ó, capturei aqui: tem prova de <b className="text-amber-300">{prova.materia}</b> dia{" "}
                <b className="text-amber-300">{formatData(prova.data)}</b>!
              </p>
              {prova.conteudo && (
                <button
                  onClick={() => setShowFlashcards(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 mt-1.5"
                >
                  <Sparkles size={11} /> Gerar flashcards de revisão
                </button>
              )}
            </div>
            <button onClick={() => setPhase("escondido")} className="text-zinc-500 hover:text-zinc-300 shrink-0">
              <X size={14} />
            </button>
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
