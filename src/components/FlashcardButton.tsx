"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import FlashcardModal from "@/components/FlashcardModal";

type Prova = { id: string; materia: string; conteudo: string | null };

export default function FlashcardButton() {
  const [open, setOpen] = useState(false);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [active, setActive] = useState<Prova | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabaseBrowser
      .from("provas")
      .select("id, materia, conteudo")
      .not("conteudo", "is", null)
      .order("data", { ascending: true })
      .then(({ data }) => setProvas((data || []).filter((p) => p.conteudo)));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Gerar flashcards de revisão"
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 cursor-pointer transition-colors"
      >
        <GraduationCap size={18} />
      </button>

      {open && (
        <div className="absolute bottom-11 left-0 w-64 bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-xl shadow-black/30 z-50">
          <p className="text-[11px] text-zinc-500 px-2 pb-1.5">Revisar pra qual prova?</p>
          {provas.length === 0 && (
            <p className="text-xs text-zinc-600 px-2 py-2">Nenhuma prova com conteúdo cadastrado ainda.</p>
          )}
          {provas.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActive(p);
                setOpen(false);
              }}
              className="w-full text-left text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg px-2.5 py-2 transition-colors"
            >
              {p.materia}
            </button>
          ))}
        </div>
      )}

      {active && (
        <FlashcardModal materia={active.materia} conteudo={active.conteudo || ""} onClose={() => setActive(null)} />
      )}
    </div>
  );
}
