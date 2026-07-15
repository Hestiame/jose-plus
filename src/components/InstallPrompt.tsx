"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "jose-plus-install-dismissed";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const dismissed = localStorage.getItem(DISMISS_KEY);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (dismissed || standalone) return;

    const ua = window.navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) && !("MSStream" in window);
    setIsIos(ios);

    if (ios) {
      // iOS não dispara beforeinstallprompt — mostramos a instrução manual direto.
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 shadow-xl shadow-black/30 flex items-start gap-3">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-black">
          +
        </div>
        <div className="flex-1 min-w-0">
          {isIos ? (
            <p className="text-xs text-zinc-300 leading-relaxed">
              Instale o José+: toque em <Share size={12} className="inline -mt-0.5" /> (Compartilhar) e depois em{" "}
              <b>"Adicionar à Tela de Início"</b>.
            </p>
          ) : (
            <>
              <p className="text-xs text-zinc-300 mb-2">Instale o José+ na tela inicial pra acessar mais rápido.</p>
              <button
                onClick={install}
                className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-900 px-3 py-1.5 rounded-lg"
              >
                <Download size={13} /> Instalar
              </button>
            </>
          )}
        </div>
        <button onClick={dismiss} className="text-zinc-500 hover:text-zinc-300 shrink-0">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
