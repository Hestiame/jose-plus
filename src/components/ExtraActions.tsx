"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus, GraduationCap, CalendarPlus, MessageCircleHeart, Mail, Download, ChevronLeft
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { downloadICS } from "@/lib/ics";
import FlashcardModal from "@/components/FlashcardModal";
import SuggestionBox from "@/components/SuggestionBox";
import EmailSubscribe from "@/components/EmailSubscribe";

type Prova = { id: string; materia: string; conteudo: string | null };
type Item = { id: string; titulo: string; descricao: string | null; data: string; tipo: "Prova" | "Evento" };

type View = "menu" | "flashcards" | "calendario";

export default function ExtraActions() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [provas, setProvas] = useState<Prova[]>([]);
  const [calendarItems, setCalendarItems] = useState<Item[]>([]);
  const [activeProva, setActiveProva] = useState<Prova | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setView("menu");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function openFlashcards() {
    setView("flashcards");
    const { data } = await supabaseBrowser
      .from("provas")
      .select("id, materia, conteudo")
      .not("conteudo", "is", null)
      .order("data", { ascending: true });
    setProvas((data || []).filter((p) => p.conteudo));
  }

  async function openCalendario() {
    setView("calendario");
    const today = new Date().toISOString().slice(0, 10);
    const [provasRes, eventosRes] = await Promise.all([
      supabaseBrowser.from("provas").select("id, materia, conteudo, data").gte("data", today).order("data"),
      supabaseBrowser.from("eventos").select("id, titulo, descricao, data").gte("data", today).order("data")
    ]);
    const provasItems: Item[] = (provasRes.data || []).map((p) => ({
      id: p.id,
      titulo: `Prova de ${p.materia}`,
      descricao: p.conteudo,
      data: p.data,
      tipo: "Prova"
    }));
    const eventosItems: Item[] = (eventosRes.data || []).map((e) => ({
      id: e.id,
      titulo: e.titulo,
      descricao: e.descricao,
      data: e.data,
      tipo: "Evento"
    }));
    setCalendarItems([...provasItems, ...eventosItems].sort((a, b) => a.data.localeCompare(b.data)));
  }

  function formatData(iso: string) {
    const [, m, d] = iso.split("-");
    return `${d}/${m}`;
  }

  function closeAll() {
    setOpen(false);
    setView("menu");
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Mais ações"
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 cursor-pointer transition-colors"
      >
        <Plus size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeAll} />
          <div className="absolute bottom-14 left-0 w-72 max-h-80 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-xl p-2 shadow-2xl shadow-black/50 z-50 animate-fade-in">
            {view === "menu" && (
              <>
                <button
                  onClick={openFlashcards}
                  className="w-full flex items-center gap-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg px-2.5 py-2.5 transition-colors"
                >
                  <GraduationCap size={16} className="text-amber-400 shrink-0" /> Flashcards de revisão
                </button>
                <button
                  onClick={openCalendario}
                  className="w-full flex items-center gap-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg px-2.5 py-2.5 transition-colors"
                >
                  <CalendarPlus size={16} className="text-amber-400 shrink-0" /> Adicionar ao calendário
                </button>
                <button
                  onClick={() => {
                    setShowSuggestion(true);
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg px-2.5 py-2.5 transition-colors"
                >
                  <MessageCircleHeart size={16} className="text-amber-400 shrink-0" /> Sugestão anônima
                </button>
                <button
                  onClick={() => {
                    setShowEmail(true);
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg px-2.5 py-2.5 transition-colors"
                >
                  <Mail size={16} className="text-amber-400 shrink-0" /> Receber avisos por e-mail
                </button>
              </>
            )}

            {view === "flashcards" && (
              <>
                <button
                  onClick={() => setView("menu")}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 px-1 pb-1.5"
                >
                  <ChevronLeft size={12} /> Voltar
                </button>
                <p className="text-[11px] text-zinc-500 px-2 pb-1.5">Revisar pra qual prova?</p>
                {provas.length === 0 && (
                  <p className="text-xs text-zinc-600 px-2 py-2">Nenhuma prova com conteúdo cadastrado ainda.</p>
                )}
                {provas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProva(p);
                      closeAll();
                    }}
                    className="w-full text-left text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg px-2.5 py-2 transition-colors"
                  >
                    {p.materia}
                  </button>
                ))}
              </>
            )}

            {view === "calendario" && (
              <>
                <button
                  onClick={() => setView("menu")}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 px-1 pb-1.5"
                >
                  <ChevronLeft size={12} /> Voltar
                </button>
                <p className="text-[11px] text-zinc-500 px-2 pb-1.5">Adicionar ao seu calendário</p>
                {calendarItems.length === 0 && (
                  <p className="text-xs text-zinc-600 px-2 py-2">Nenhuma prova ou evento futuro cadastrado.</p>
                )}
                {calendarItems.map((it) => (
                  <div key={it.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-zinc-800">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{it.titulo}</p>
                      <p className="text-[11px] text-zinc-600">
                        {it.tipo} · {formatData(it.data)}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        downloadICS({ titulo: it.titulo, descricao: it.descricao || undefined, data: it.data })
                      }
                      className="shrink-0 text-zinc-500 hover:text-amber-400 p-1.5"
                      title="Baixar .ics"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}

      {activeProva && (
        <FlashcardModal
          materia={activeProva.materia}
          conteudo={activeProva.conteudo || ""}
          onClose={() => setActiveProva(null)}
        />
      )}
      <SuggestionBox open={showSuggestion} onClose={() => setShowSuggestion(false)} />
      <EmailSubscribe open={showEmail} onClose={() => setShowEmail(false)} />
    </div>
  );
}
