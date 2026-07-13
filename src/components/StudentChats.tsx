"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Users } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Conversa = { id: string; titulo: string; usuario_id: string; atualizado_em: string };
type Mensagem = { role: "user" | "assistant"; conteudo: string };

export default function StudentChats() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
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

  return (
    <div className="flex h-full">
      <div className="w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 overflow-y-auto">
        <div className="p-3 border-b border-zinc-800 flex items-center gap-2 text-sm text-zinc-400">
          <Users size={14} /> Conversas dos alunos
          <span className="text-zinc-600">({conversas.length})</span>
        </div>
        {loading && <p className="text-xs text-zinc-600 p-3">Carregando…</p>}
        {!loading && conversas.length === 0 && (
          <p className="text-xs text-zinc-600 p-3">Nenhuma conversa pública ainda.</p>
        )}
        <div className="p-2 space-y-0.5">
          {conversas.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
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

      <div className="flex-1 overflow-y-auto p-6">
        {!activeId ? (
          <p className="text-sm text-zinc-600">Selecione uma conversa à esquerda para visualizar.</p>
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
