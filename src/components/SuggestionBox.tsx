"use client";

import { useState } from "react";
import { MessageCircleHeart, X, Check } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function SuggestionBox() {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function enviar() {
    if (!texto.trim() || sending) return;
    setSending(true);
    try {
      await supabaseBrowser.from("sugestoes").insert({ texto: texto.trim() });
      setSent(true);
      setTexto("");
      setTimeout(() => {
        setSent(false);
        setOpen(false);
      }, 1800);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Mandar uma sugestão anônima"
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 cursor-pointer transition-colors"
      >
        <MessageCircleHeart size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-semibold text-zinc-100">Caixinha de sugestões</p>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-200">
                <X size={18} />
              </button>
            </div>

            {sent ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Check size={28} className="text-emerald-400 mb-2" />
                <p className="text-sm text-zinc-300">Enviado! Obrigado pela sugestão 🙂</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-500 mb-3">
                  100% anônimo — a escola não sabe quem mandou. Use pra sugestões, críticas ou ideias sobre a escola.
                </p>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={4}
                  placeholder="Escreva aqui..."
                  className="w-full bg-zinc-800/70 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/50 resize-none"
                />
                <button
                  onClick={enviar}
                  disabled={!texto.trim() || sending}
                  className="w-full mt-3 bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-900 font-semibold rounded-xl py-2.5 text-sm disabled:opacity-40 hover:brightness-110 transition-all"
                >
                  {sending ? "Enviando..." : "Enviar anonimamente"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
