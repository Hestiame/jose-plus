import Link from "next/link";
import {
  Megaphone, CalendarDays, ClipboardList, UtensilsCrossed, Wallet,
  ShieldCheck, Sparkles, ArrowLeft
} from "lucide-react";

export const metadata = {
  title: "Sobre o José+ | Assistente escolar"
};

const ITENS = [
  { icon: Megaphone, texto: "Avisos e comunicados da escola, sempre atualizados" },
  { icon: CalendarDays, texto: "Provas, trabalhos e eventos, tudo num só lugar" },
  { icon: UtensilsCrossed, texto: "Cardápio da merenda do dia" },
  { icon: Wallet, texto: "Transparência total do caixa da turma: rifas, vaquinhas e meta da formatura" },
  { icon: Sparkles, texto: "Também ajuda nos estudos: explica conteúdo, resolve exercícios, ajuda com redação" }
];

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-12">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft size={14} /> Voltar para o chat
        </Link>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-zinc-900 font-black text-2xl mb-6 shadow-lg shadow-amber-500/20">
          +
        </div>

        <h1 className="font-display text-3xl font-bold mb-3">O que é o José+?</h1>
        <p className="text-zinc-400 leading-relaxed mb-8">
          O José+ é um assistente escolar inteligente, feito pra deixar a comunicação da escola mais fácil
          e mais transparente. Qualquer aluno pode conversar com ele, sem precisar de cadastro nem login —
          é só abrir e perguntar, como num chat comum.
        </p>

        <h2 className="font-display text-lg font-semibold mb-3 text-zinc-200">O que ele sabe responder</h2>
        <div className="space-y-3 mb-8">
          {ITENS.map(({ icon: Icon, texto }) => (
            <div key={texto} className="flex items-start gap-3 text-sm text-zinc-300">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                <Icon size={15} />
              </div>
              <p className="pt-1.5">{texto}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 text-sm text-zinc-500 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 mb-8">
          <ShieldCheck size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <p>
            Todas as informações que o José+ usa vêm diretamente da administração da escola. Ele nunca
            inventa datas, valores ou avisos — se algo ainda não foi cadastrado, ele avisa que não sabe em
            vez de chutar uma resposta.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-gradient-to-br from-amber-400 to-orange-500 text-zinc-900 font-semibold rounded-xl px-5 py-2.5 text-sm hover:brightness-110 transition-all"
        >
          Voltar para o chat
        </Link>
      </div>
    </div>
  );
}
