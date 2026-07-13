"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard, FolderOpen, TrendingUp, TrendingDown, Target,
  Megaphone, CalendarDays, ClipboardList, GraduationCap, UtensilsCrossed, Images
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Lancamento = { id: string; tipo: "receita" | "despesa"; descricao: string; valor: number; categoria: string | null };
type Meta = { id: string; nome: string; tipo: string; meta: number };

const MODULOS = [
  { key: "avisos", label: "Avisos", icon: Megaphone, color: "text-sky-400", campo: "texto" },
  { key: "eventos", label: "Eventos", icon: CalendarDays, color: "text-violet-400", campo: "titulo" },
  { key: "provas", label: "Provas", icon: ClipboardList, color: "text-rose-400", campo: "materia" },
  { key: "trabalhos", label: "Trabalhos", icon: GraduationCap, color: "text-indigo-400", campo: "titulo" },
  { key: "merenda", label: "Merenda", icon: UtensilsCrossed, color: "text-lime-400", campo: "itens" },
  { key: "galeria", label: "Galeria", icon: Images, color: "text-fuchsia-400", campo: "descricao" }
] as const;

const brl = (v: number) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Dashboard({ refreshKey }: { refreshKey: number }) {
  const [tab, setTab] = useState<"dashboard" | "modulos">("dashboard");
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [modulosData, setModulosData] = useState<Record<string, { id: string; [k: string]: unknown }[]>>({});

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function load() {
    const [lanc, met] = await Promise.all([
      supabaseBrowser.from("caixa_lancamentos").select("*"),
      supabaseBrowser.from("metas").select("*")
    ]);
    setLancamentos((lanc.data || []) as Lancamento[]);
    setMetas((met.data || []) as Meta[]);

    const results = await Promise.all(
      MODULOS.map((m) => supabaseBrowser.from(m.key).select("*").order("criado_em", { ascending: false }).limit(4))
    );
    const obj: Record<string, { id: string; [k: string]: unknown }[]> = {};
    MODULOS.forEach((m, i) => (obj[m.key] = results[i].data || []));
    setModulosData(obj);
  }

  const totalReceitas = lancamentos.filter((l) => l.tipo === "receita").reduce((s, l) => s + Number(l.valor), 0);
  const totalDespesas = lancamentos.filter((l) => l.tipo === "despesa").reduce((s, l) => s + Number(l.valor), 0);
  const saldo = totalReceitas - totalDespesas;
  const metaFormatura = metas.find((m) => m.tipo === "formatura");
  const progresso = metaFormatura ? Math.min(100, Math.round((saldo / metaFormatura.meta) * 100)) : 0;

  const arrecadadoPorCategoria = (categoria: string) =>
    lancamentos.filter((l) => l.tipo === "receita" && l.categoria === categoria).reduce((s, l) => s + Number(l.valor), 0);

  return (
    <div className="w-full max-w-xs shrink-0 border-l border-zinc-800 bg-zinc-950 h-full overflow-y-auto hidden lg:block">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex gap-1.5">
          <button
            onClick={() => setTab("dashboard")}
            className={`flex-1 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 ${
              tab === "dashboard" ? "bg-zinc-800 text-amber-300" : "text-zinc-500"
            }`}
          >
            <LayoutDashboard size={13} /> Painel
          </button>
          <button
            onClick={() => setTab("modulos")}
            className={`flex-1 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 ${
              tab === "modulos" ? "bg-zinc-800 text-amber-300" : "text-zinc-500"
            }`}
          >
            <FolderOpen size={13} /> Módulos
          </button>
        </div>
      </div>

      {tab === "dashboard" ? (
        <div className="p-4 space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <p className="text-[11px] text-zinc-500 mb-1">Caixa atual</p>
            <p className="font-display text-2xl font-bold text-amber-300">{brl(saldo)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="flex items-center gap-1 text-emerald-400 text-[11px] mb-1">
                <TrendingUp size={12} /> Arrecadado
              </div>
              <p className="font-semibold text-zinc-100 text-sm">{brl(totalReceitas)}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <div className="flex items-center gap-1 text-rose-400 text-[11px] mb-1">
                <TrendingDown size={12} /> Gasto
              </div>
              <p className="font-semibold text-zinc-100 text-sm">{brl(totalDespesas)}</p>
            </div>
          </div>

          {metaFormatura && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Target size={12} /> Meta da formatura
                </div>
                <span className="text-[11px] text-zinc-400">{progresso}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">
                {brl(saldo)} de {brl(metaFormatura.meta)}
              </p>
            </div>
          )}

          <p className="text-[11px] uppercase tracking-wider text-zinc-600 pt-1">Rifas e vaquinhas</p>
          {metas
            .filter((m) => m.tipo !== "formatura")
            .map((m) => {
              const arrecadado = arrecadadoPorCategoria(m.tipo);
              const pct = m.meta ? Math.min(100, Math.round((arrecadado / m.meta) * 100)) : 0;
              return (
                <div key={m.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-300 mb-1">{m.nome}</div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-1">
                    <div className="h-full bg-amber-500/70 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {brl(arrecadado)} de {brl(m.meta)}
                  </p>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {MODULOS.map((m) => {
            const Icon = m.icon;
            const items = modulosData[m.key] || [];
            return (
              <div key={m.key}>
                <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${m.color}`}>
                  <Icon size={13} /> {m.label} <span className="text-zinc-600 font-normal">({items.length})</span>
                </div>
                <div className="space-y-1">
                  {items.length === 0 && <p className="text-[11px] text-zinc-600 pl-1">Nada cadastrado.</p>}
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="text-[12px] text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-lg px-2.5 py-1.5 truncate"
                    >
                      {Array.isArray(it[m.campo]) ? (it[m.campo] as string[]).join(", ") : String(it[m.campo] ?? "")}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
