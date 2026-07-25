"use client";

import { useState } from "react";
import { Mail, X, Check } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function EmailSubscribe() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "erro">("idle");

  async function inscrever() {
    if (!email.trim() || sending) return;
    setSending(true);
    setStatus("idle");
    const { error } = await supabaseBrowser.from("inscritos_email").insert({ email: email.trim() });
    setSending(false);
    if (error) {
      setStatus(error.code === "23505" ? "ok" : "erro"); // já cadastrado conta como sucesso
    } else {
      setStatus("ok");
    }
    if (!error || error.code === "23505") {
      setEmail("");
      setTimeout(() => setOpen(false), 1800);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Receber avisos por e-mail"
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 cursor-pointer transition-colors"
      >
        <Mail size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-semibold text-zinc-100">Receber avisos por e-mail</p>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-200">
                <X size={18} />
              </button>
            </div>

            {status === "ok" ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Check size={28} className="text-emerald-400 mb-2" />
                <p className="text-sm text-zinc-300">Prontinho! Você vai receber os próximos avisos.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-500 mb-3">
                  Toda vez que um aviso novo for publicado, você recebe no e-mail.
                </p>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  onKeyDown={(e) => e.key === "Enter" && inscrever()}
                  className="w-full bg-zinc-800/70 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
                />
                {status === "erro" && (
                  <p className="text-rose-400 text-xs mt-2">Não consegui cadastrar, tenta de novo.</p>
                )}
                <button
                  onClick={inscrever}
                  disabled={!email.trim() || sending}
                  className="w-full mt-3 bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-900 font-semibold rounded-xl py-2.5 text-sm disabled:opacity-40 hover:brightness-110 transition-all"
                >
                  {sending ? "Cadastrando..." : "Quero receber"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
