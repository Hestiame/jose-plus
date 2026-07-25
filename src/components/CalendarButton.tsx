"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Download } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { downloadICS } from "@/lib/ics";

type Item = { id: string; titulo: string; descricao: string | null; data: string; tipo: "Prova" | "Evento" };

export default function CalendarButton() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      supabaseBrowser.from("provas").select("id, materia, conteudo, data").gte("data", today).order("data"),
      supabaseBrowser.from("eventos").select("id, titulo, descricao, data").gte("data", today).order("data")
    ]).then(([provas, eventos]) => {
      const provasItems: Item[] = (provas.data || []).map((p) => ({
        id: p.id,
        titulo: `Prova de ${p.materia}`,
        descricao: p.conteudo,
        data: p.data,
        tipo: "Prova"
      }));
      const eventosItems: Item[] = (eventos.data || []).map((e) => ({
        id: e.id,
        titulo: e.titulo,
        descricao: e.descricao,
        data: e.data,
        tipo: "Evento"
      }));
      setItems([...provasItems, ...eventosItems].sort((a, b) => a.data.localeCompare(b.data)));
    });
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function formatData(iso: string) {
    const [, m, d] = iso.split("-");
    return `${d}/${m}`;
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Adicionar datas ao calendário"
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 cursor-pointer transition-colors"
      >
        <CalendarPlus size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-14 left-0 w-72 max-h-80 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-xl p-2 shadow-2xl shadow-black/50 z-50 animate-fade-in">
            <p className="text-[11px] text-zinc-500 px-2 pb-1.5">Adicionar ao seu calendário</p>
            {items.length === 0 && (
              <p className="text-xs text-zinc-600 px-2 py-2">Nenhuma prova ou evento futuro cadastrado.</p>
            )}
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-zinc-800">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{it.titulo}</p>
                  <p className="text-[11px] text-zinc-600">
                    {it.tipo} · {formatData(it.data)}
                  </p>
                </div>
                <button
                  onClick={() => downloadICS({ titulo: it.titulo, descricao: it.descricao || undefined, data: it.data })}
                  className="shrink-0 text-zinc-500 hover:text-amber-400 p-1.5"
                  title="Baixar .ics"
                >
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
