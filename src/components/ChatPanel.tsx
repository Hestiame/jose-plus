"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus, MessageSquare, Send, Trash2, Pencil, Check, X, Loader2,
  ChevronLeft, ImagePlus, Camera
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Conversa = { id: string; titulo: string };
type Mensagem = { id?: string; role: "user" | "assistant"; conteudo: string };

type ChatPanelProps = {
  mode: "publica" | "admin";
  usuarioId: string;
  brand: string;
  emptyTitle: string;
  emptySubtitle: string;
  chips: string[];
  apiEndpoint: string;
  allowImage?: boolean;
  getAuthHeaders?: () => Promise<Record<string, string>>;
  onDataChanged?: () => void;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function Avatar({ isUser }: { isUser: boolean }) {
  if (!isUser) {
    return (
      <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-black text-sm shadow-lg shadow-amber-500/20">
        +
      </div>
    );
  }
  return (
    <div className="w-8 h-8 shrink-0 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-semibold">
      EU
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
    </div>
  );
}

export default function ChatPanel({
  mode,
  usuarioId,
  brand,
  emptyTitle,
  emptySubtitle,
  chips,
  apiEndpoint,
  allowImage,
  getAuthHeaders,
  onDataChanged
}: ChatPanelProps) {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ b64: string; mime: string; name: string } | null>(
    null
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversas();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setCollapsed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeId) loadMensagens(activeId);
    else setMensagens([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensagens, loading]);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  async function loadConversas() {
    const { data } = await supabaseBrowser
      .from("conversas")
      .select("id, titulo")
      .eq("usuario_id", usuarioId)
      .eq("tipo", mode)
      .order("atualizado_em", { ascending: false });
    setConversas(data || []);
    if (data && data.length > 0) setActiveId(data[0].id);
  }

  async function loadMensagens(conversaId: string) {
    const { data } = await supabaseBrowser
      .from("mensagens")
      .select("role, conteudo")
      .eq("conversa_id", conversaId)
      .order("criado_em", { ascending: true });
    setMensagens((data || []) as Mensagem[]);
  }

  async function newConversation(): Promise<string> {
    const { data, error } = await supabaseBrowser
      .from("conversas")
      .insert({ tipo: mode, usuario_id: usuarioId, titulo: "Nova conversa" })
      .select("id, titulo")
      .single();
    if (error || !data) return "";
    setConversas((prev) => [data, ...prev]);
    setActiveId(data.id);
    return data.id;
  }

  async function renameConversation(id: string, titulo: string) {
    setConversas((prev) => prev.map((c) => (c.id === id ? { ...c, titulo } : c)));
    await supabaseBrowser.from("conversas").update({ titulo }).eq("id", id);
  }

  async function deleteConversation(id: string) {
    setConversas((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
    await supabaseBrowser.from("conversas").delete().eq("id", id);
  }

  async function onImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setPendingImage({ b64, mime: file.type, name: file.name });
  }

  async function send(textArg?: string) {
    const text = (textArg ?? input).trim();
    if ((!text && !pendingImage) || loading) return;

    let convId = activeId;
    let isFirstMessage = mensagens.length === 0;
    if (!convId) {
      convId = await newConversation();
      isFirstMessage = true;
      if (!convId) return;
    }

    const displayText = text || `📷 ${pendingImage!.name}`;
    const userMsg: Mensagem = { role: "user", conteudo: displayText };
    const newMensagens = [...mensagens, userMsg];
    setMensagens(newMensagens);
    setInput("");
    const img = pendingImage;
    setPendingImage(null);
    setLoading(true);

    await supabaseBrowser.from("mensagens").insert({ conversa_id: convId, role: "user", conteudo: displayText });
    if (isFirstMessage) await renameConversation(convId, displayText.slice(0, 40));
    await supabaseBrowser.from("conversas").update({ atualizado_em: new Date().toISOString() }).eq("id", convId);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (getAuthHeaders) Object.assign(headers, await getAuthHeaders());

      const apiMessages = newMensagens.map((m) => ({ role: m.role, content: m.conteudo }));
      if (img) apiMessages[apiMessages.length - 1] = { role: "user", content: text || "Aqui está a foto." };

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: apiMessages,
          imageBase64: img?.b64,
          imageMimeType: img?.mime
        })
      });
      const data = await res.json();
      const reply: string = data.reply || data.resposta || "Não consegui responder agora, tenta de novo?";

      setMensagens((prev) => [...prev, { role: "assistant", conteudo: reply }]);
      await supabaseBrowser
        .from("mensagens")
        .insert({ conversa_id: convId, role: "assistant", conteudo: reply });

      if (data.applied && onDataChanged) onDataChanged();
    } catch {
      const errMsg = "Deu um erro ao me conectar agora. Tenta de novo em instantes.";
      setMensagens((prev) => [...prev, { role: "assistant", conteudo: errMsg }]);
      await supabaseBrowser.from("mensagens").insert({ conversa_id: convId, role: "assistant", conteudo: errMsg });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-full relative">
      {/* backdrop (mobile only) */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* sidebar */}
      <div
        className={`${collapsed ? "hidden" : "flex"} md:flex fixed md:static inset-y-0 left-0 z-40
        w-72 shrink-0 overflow-hidden border-r border-zinc-800 bg-zinc-950 flex-col h-full`}
      >
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-black text-sm">
              +
            </div>
            <span className="font-display font-bold text-zinc-100 tracking-tight">{brand}</span>
          </div>
          <button onClick={() => setCollapsed(true)} className="text-zinc-500 hover:text-zinc-200 p-1">
            <ChevronLeft size={16} />
          </button>
        </div>

        <button
          onClick={() => {
            setActiveId(null);
            setMensagens([]);
          }}
          className="mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700 transition-colors text-sm"
        >
          <Plus size={15} /> Nova conversa
        </button>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {conversas.map((c) => (
            <div
              key={c.id}
              onClick={() => renamingId !== c.id && setActiveId(c.id)}
              className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                activeId === c.id ? "bg-zinc-800/80 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900"
              }`}
            >
              <MessageSquare size={14} className="shrink-0 opacity-60" />
              {renamingId === c.id ? (
                <input
                  autoFocus
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renameConversation(c.id, renameVal.trim() || "Conversa");
                      setRenamingId(null);
                    }
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  onBlur={() => {
                    renameConversation(c.id, renameVal.trim() || "Conversa");
                    setRenamingId(null);
                  }}
                  className="flex-1 bg-zinc-800 rounded px-1 outline-none text-zinc-100 min-w-0"
                />
              ) : (
                <span className="flex-1 truncate">{c.titulo}</span>
              )}

              {renamingId !== c.id && deletingId !== c.id && (
                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingId(c.id);
                      setRenameVal(c.titulo);
                    }}
                    className="text-zinc-500 hover:text-zinc-200 p-0.5"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(c.id);
                    }}
                    className="text-zinc-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
              {deletingId === c.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                      setDeletingId(null);
                    }}
                    className="text-rose-400 hover:text-rose-300 p-0.5"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(null);
                    }}
                    className="text-zinc-500 hover:text-zinc-200 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="m-3 text-zinc-500 hover:text-zinc-200 w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-800"
          >
            <ChevronLeft size={14} className="rotate-180" />
          </button>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-0">
          {mensagens.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-black text-2xl mb-5 shadow-lg shadow-amber-500/20">
                +
              </div>
              <h2 className="font-display text-2xl font-bold text-zinc-100 mb-2">{emptyTitle}</h2>
              <p className="text-zinc-500 text-sm mb-6 max-w-sm">{emptySubtitle}</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="text-xs px-3 py-2 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-6 space-y-5">
              {mensagens.map((m, i) => (
                <div key={i} className={`flex gap-3 animate-fade-in ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar isUser={m.role === "user"} />
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-zinc-800 text-zinc-100 rounded-tr-sm"
                        : "bg-zinc-900/70 border border-zinc-800 text-zinc-200 rounded-tl-sm"
                    }`}
                  >
                    {m.conteudo}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <Avatar isUser={false} />
                  <TypingDots />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-2xl w-full mx-auto p-4">
          {pendingImage && (
            <div className="flex items-center gap-2 mb-2 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 w-fit">
              <Camera size={12} /> {pendingImage.name}
              <button onClick={() => setPendingImage(null)} className="text-zinc-500 hover:text-rose-400">
                <X size={12} />
              </button>
            </div>
          )}
          <div className="border border-zinc-800 bg-zinc-900/80 backdrop-blur rounded-2xl p-2 flex items-end gap-2 shadow-xl shadow-black/20">
            {allowImage && (
              <label
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 cursor-pointer transition-colors"
                title="Enviar foto"
              >
                <ImagePlus size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={onImagePick} />
              </label>
            )}
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                mode === "publica"
                  ? "Pergunte qualquer coisa sobre a escola, ou peça ajuda nos estudos…"
                  : "Diga o que aconteceu — receita, gasto, aviso, prova, evento…"
              }
              className="flex-1 bg-transparent resize-none outline-none text-[15px] text-zinc-100 placeholder-zinc-500 py-1.5 max-h-40"
            />
            <button
              onClick={() => send()}
              disabled={loading || (!input.trim() && !pendingImage)}
              className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 disabled:opacity-30 disabled:grayscale flex items-center justify-center text-zinc-900 transition-all hover:brightness-110 active:scale-95"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          {mode === "publica" && (
            <p className="text-center text-[11px] text-zinc-600 mt-2">
              José+ pode cometer erros. Confirme informações importantes com a coordenação.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
