import { NextRequest, NextResponse } from "next/server";
import { fetchSchoolData } from "@/lib/supabaseServer";
import { buildPublicSystem } from "@/lib/prompts";
import { callAI } from "@/lib/aiProvider";
import { ChatMessage } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages é obrigatório" }, { status: 400 });
    }

    const schoolData = await fetchSchoolData();
    const { text } = await callAI({ system: buildPublicSystem(schoolData), messages });

    return NextResponse.json({ reply: text || "Não consegui responder agora, tenta de novo?" });
  } catch (err) {
    console.error("Erro no /api/chat:", err);
    return NextResponse.json(
      { error: "Deu um erro ao processar. Tenta de novo em instantes." },
      { status: 500 }
    );
  }
}
