"use client";

import { useEffect, useState } from "react";
import { MessageCircleHeart, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Sugestao = { id: string; texto: string; criado_em: string };

export default function SuggestionsAdmin() {
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: session } = await supabaseBrowser.auth.getSession();
    const res = await fetch("/api/sugestoes", {
      headers: { Authorization: `Bearer ${session.session?.access_token || ""}` }
    });
    const data = await res.json();
    setSugestoes(data.sugestoes || []);
    setLoading(false);
  }

  function formatData(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4 text-zinc-400">
        <MessageCircleHeart size={16} />
        <p className="text-sm">Sugestões anônimas dos alunos ({sugestoes.length})</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 size={14} className="animate-spin" /> Carregando...
        </div>
      )}

      {!loading && sugestoes.length === 0 && (
        <p className="text-sm text-zinc-600">Nenhuma sugestão ainda.</p>
      )}

      <div className="space-y-2">
        {sugestoes.map((s) => (
          <div key={s.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5">
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{s.texto}</p>
            <p className="text-[11px] text-zinc-600 mt-1.5">{formatData(s.criado_em)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
