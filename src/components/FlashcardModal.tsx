"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, RotateCw, Loader2 } from "lucide-react";
import Mascot from "@/components/Mascot";

type Card = { pergunta: string; resposta: string };

type FlashcardModalProps = {
  materia: string;
  conteudo: string;
  onClose: () => void;
};

export default function FlashcardModal({ materia, conteudo, onClose }: FlashcardModalProps) {
  const [phase, setPhase] = useState<"flash" | "loading" | "cards" | "erro">("flash");
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    // fase 1: flash da câmera (rápido, só efeito visual)
    const flashTimer = setTimeout(() => setPhase("loading"), 550);
    return () => clearTimeout(flashTimer);
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    (async () => {
      try {
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ materia, conteudo })
        });
        const data = await res.json();
        if (!data.cards || data.cards.length === 0) throw new Error("sem cards");
        setCards(data.cards);
        setPhase("cards");
      } catch {
        setPhase("erro");
      }
    })();
  }, [phase, materia, conteudo]);

  function next() {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, cards.length - 1));
  }
  function prev() {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
        <X size={22} />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center">
        {phase === "flash" && (
          <div className="relative flex flex-col items-center">
            <Mascot size={110} bounce />
            <p className="text-zinc-400 text-sm mt-4">Tirando uma foto da matéria...</p>
            <div className="fixed inset-0 bg-white animate-camera-flash pointer-events-none" />
          </div>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center">
            <Mascot size={90} />
            <div className="flex items-center gap-2 text-zinc-400 text-sm mt-4">
              <Loader2 size={14} className="animate-spin" /> Revelando os flashcards de {materia}...
            </div>
          </div>
        )}

        {phase === "erro" && (
          <div className="flex flex-col items-center text-center">
            <Mascot size={80} />
            <p className="text-zinc-400 text-sm mt-4">
              Não consegui gerar os flashcards agora. Tenta de novo em instantes.
            </p>
          </div>
        )}

        {phase === "cards" && cards.length > 0 && (
          <div className="w-full animate-card-drop">
            <p className="text-center text-xs text-zinc-500 mb-3">
              Flashcard {index + 1} de {cards.length} · {materia}
            </p>

            <div
              onClick={() => setFlipped((f) => !f)}
              className="relative w-full aspect-[4/3] cursor-pointer select-none"
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
                }}
              >
                {/* frente: pergunta */}
                <div
                  className="absolute inset-0 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-6 text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 mb-3">Pergunta</span>
                  <p className="text-zinc-100 text-base leading-relaxed">{cards[index].pergunta}</p>
                  <span className="text-[11px] text-zinc-600 mt-4">toque pra virar</span>
                </div>
                {/* verso: resposta */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex flex-col items-center justify-center p-6 text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="text-[10px] uppercase tracking-wider text-zinc-900/70 mb-3">Resposta</span>
                  <p className="text-zinc-900 text-base leading-relaxed font-medium">{cards[index].resposta}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={prev}
                disabled={index === 0}
                className="w-9 h-9 rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setFlipped((f) => !f)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400"
              >
                <RotateCw size={13} /> Virar
              </button>
              <button
                onClick={next}
                disabled={index === cards.length - 1}
                className="w-9 h-9 rounded-lg border border-zinc-800 text-zinc-400 disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
