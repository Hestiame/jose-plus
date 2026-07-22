"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Users, ChevronLeft, Menu } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Conversa = { id: string; titulo: string; usuario_id: string; atualizado_em: string };
type Mensagem = { role: "user" | "assistant"; conteudo: string };

export default function StudentChats() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    load();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (activeId) loadMensagens(activeId);
    else setMensagens([]);
  }, [activeId]);

  async function load() {
    setLoading(true);
    const { data } = await supabaseBrowser
      .from("conversas")
      .select("id, titulo, usuario_id, atualizado_em")
      .eq("tipo", "publica")
      .order("atualizado_em", { ascending: false })
      .limit(100);
    setConversas(data || []);
    setLoading(false);
  }

  async function loadMensagens(conversaId: string) {
    const { data } = await supabaseBrowser
      .from("mensagens")
      .select("role, conteudo")
      .eq("conversa_id", conversaId)
      .order("criado_em", { ascending: true });
    setMensagens((data || []) as Mensagem[]);
  }

  function selectConversa(id: string) {
    setActiveId(id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setCollapsed(true);
    }
  }

  return (
    <div className="flex h-full relative">
      {/* backdrop (mobile only) */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setCollapsed(true)} />
      )}

      {/* sidebar */}
      <div
        className={`${collapsed ? "hidden" : "flex"} md:flex fixed md:static inset-y-0 left-0 z-40
        w-72 shrink-0 flex-col h-full border-r border-zinc-800 bg-zinc-950 overflow-y-auto`}
      >
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Users size={14} /> Conversas dos alunos
            <span className="text-zinc-600">({conversas.length})</span>
          </div>
          <button onClick={() => setCollapsed(true)} className="text-zinc-500 hover:text-zinc-200 p-1 md:hidden">
            <ChevronLeft size={16} />
          </button>
        </div>
        {loading && <p className="text-xs text-zinc-600 p-3">Carregando…</p>}
        {!loading && conversas.length === 0 && (
          <p className="text-xs text-zinc-600 p-3">Nenhuma conversa pública ainda.</p>
        )}
        <div className="p-2 space-y-0.5">
          {conversas.map((c) => (
            <button
              key={c.id}
              onClick={() => selectConversa(c.id)}
              className={`w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                activeId === c.id ? "bg-zinc-800/80 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900"
              }`}
            >
              <MessageSquare size={13} className="shrink-0 opacity-60" />
              <span className="flex-1 truncate">{c.titulo}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mb-3 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 border border-zinc-800 rounded-lg px-2.5 py-1.5"
          >
            <Menu size={13} /> Conversas
          </button>
        )}
        {!activeId ? (
          <p className="text-sm text-zinc-600">Selecione uma conversa pra visualizar.</p>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {mensagens.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-zinc-800 text-zinc-100"
                      : "bg-zinc-900/70 border border-zinc-800 text-zinc-200"
                  }`}
                >
                  {m.conteudo}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
