"use client";

import { useEffect, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import InstallPrompt from "@/components/InstallPrompt";
import VisitorGate from "@/components/VisitorGate";
import ExamGreeting from "@/components/ExamGreeting";
import { getAnonId } from "@/lib/anonId";

export default function PublicPage() {
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    setAnonId(getAnonId());
  }, []);

  if (!anonId) return null;

  return (
    <div className="h-screen w-full flex flex-col">
      <VisitorGate />
      <div className="flex-1 min-h-0 relative">
        <ChatPanel
          mode="publica"
          usuarioId={anonId}
          brand="José+"
          emptyTitle="Fala, José+ aqui."
          emptySubtitle="Pode perguntar sobre provas, eventos, merenda, avisos e o caixa da turma — ou pedir ajuda com qualquer atividade escolar."
          chips={[
            "Tem prova essa semana?",
            "Qual a merenda de hoje?",
            "Quanto temos em caixa?",
            "Me explica frações"
          ]}
          apiEndpoint="/api/chat"
          allowImage
        />
        <InstallPrompt />
        <ExamGreeting />
      </div>
    </div>
  );
}
