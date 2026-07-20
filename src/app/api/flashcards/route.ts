import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/aiProvider";

function stripJsonFence(text: string) {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { materia, conteudo } = (await req.json()) as { materia: string; conteudo: string };
    if (!materia || !conteudo) {
      return NextResponse.json({ error: "materia e conteudo são obrigatórios" }, { status: 400 });
    }

    const system = `Você cria flashcards de revisão pra um aluno do ensino básico, em português do Brasil.
Gere exatamente 6 flashcards curtos sobre o conteúdo abaixo, cada um com uma pergunta direta de um lado e
uma resposta curta e clara do outro. Não invente conteúdo que não tenha relação com o que foi passado.

Matéria: ${materia}
Conteúdo da prova: ${conteudo}

Responda APENAS com um JSON válido, sem markdown, no formato exato:
{ "cards": [ { "pergunta": string, "resposta": string } ] }`;

    const { text } = await callAI({
      system,
      messages: [{ role: "user", content: "Gera os flashcards." }],
      jsonMode: true
    });

    let parsed: { cards?: { pergunta: string; resposta: string }[] };
    try {
      parsed = JSON.parse(stripJsonFence(text));
    } catch {
      return NextResponse.json({ error: "Não consegui gerar os flashcards agora." }, { status: 500 });
    }

    return NextResponse.json({ cards: parsed.cards || [] });
  } catch (err) {
    console.error("Erro no /api/flashcards:", err);
    return NextResponse.json({ error: "Deu um erro ao gerar os flashcards." }, { status: 500 });
  }
}
