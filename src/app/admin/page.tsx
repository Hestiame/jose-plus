"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import ChatPanel from "@/components/ChatPanel";
import Dashboard from "@/components/Dashboard";

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id || null);
      setChecking(false);
    });
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function login() {
    setErr("");
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    if (error) setErr("E-mail ou senha incorretos.");
  }

  async function logout() {
    await supabaseBrowser.auth.signOut();
  }

  async function getAuthHeaders() {
    const { data } = await supabaseBrowser.auth.getSession();
    return { Authorization: `Bearer ${data.session?.access_token || ""}` };
  }

  if (checking) return null;

  if (!userId) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-sm border border-zinc-800 rounded-2xl p-8 bg-zinc-900/60">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-black text-xl mb-5">
            +
          </div>
          <h1 className="font-display text-xl font-bold text-zinc-100 mb-1">Painel do José+</h1>
          <p className="text-zinc-500 text-sm mb-6">Acesso restrito à administração da escola.</p>

          <div className="space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full bg-zinc-800/70 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Senha"
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="w-full bg-zinc-800/70 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
            />
            {err && <p className="text-rose-400 text-xs">{err}</p>}
            <button
              onClick={login}
              className="w-full bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-900 font-semibold rounded-xl py-2.5 text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={15} /> Entrar
            </button>
          </div>
          <p className="text-[11px] text-zinc-600 mt-5 text-center">
            O usuário administrador é criado no painel do Supabase (Authentication → Users).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <ShieldCheck size={13} className="text-amber-400" /> Painel administrativo
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-400 transition-colors">
          <LogOut size={13} /> Sair
        </button>
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0">
          <ChatPanel
            mode="admin"
            usuarioId={userId}
            brand="José+ Admin"
            emptyTitle="O que vamos organizar hoje?"
            emptySubtitle="Fale naturalmente: registre gastos e recebimentos, marque provas e eventos, publique avisos ou envie uma foto da merenda."
            chips={[
              "Recebemos R$500 da rifa",
              "Dia 20 terá prova de matemática",
              "Amanhã não haverá aula",
              "Quanto temos em caixa?"
            ]}
            apiEndpoint="/api/admin"
            allowImage
            getAuthHeaders={getAuthHeaders}
            onDataChanged={() => setRefreshKey((k) => k + 1)}
          />
        </div>
        <Dashboard refreshKey={refreshKey} />
      </div>
    </div>
  );
}
