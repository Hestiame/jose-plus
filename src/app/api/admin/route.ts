import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, fetchSchoolData } from "@/lib/supabaseServer";
import { buildAdminSystem } from "@/lib/prompts";
import { callAI } from "@/lib/aiProvider";
import { AdminAction, ChatMessage } from "@/lib/types";

const TABLE_BY_MODULO: Record<string, string> = {
  avisos: "avisos",
  eventos: "eventos",
  provas: "provas",
  trabalhos: "trabalhos",
  merenda: "merenda",
  documentos: "documentos",
  galeria: "galeria",
  caixa_lancamento: "caixa_lancamentos",
  metas: "metas"
};

function stripJsonFence(text: string) {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

async function requireAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const { messages, imageBase64, imageMimeType } = (await req.json()) as {
      messages: ChatMessage[];
      imageBase64?: string;
      imageMimeType?: string;
    };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages é obrigatório" }, { status: 400 });
    }

    const schoolData = await fetchSchoolData();
    const { text: raw, provider } = await callAI({
      system: buildAdminSystem(schoolData),
      messages,
      imageBase64,
      imageMimeType,
      jsonMode: true
    });
    if (provider === "groq") {
      console.warn("Aviso: /api/admin respondeu usando a Groq (reserva), Gemini falhou.");
    }

    let parsed: AdminAction;
    try {
      parsed = JSON.parse(stripJsonFence(raw));
    } catch {
      return NextResponse.json({
        resposta: raw || "Não entendi bem, pode repetir de outro jeito?",
        applied: false
      });
    }

    let applied = false;

    if (parsed.modulo && TABLE_BY_MODULO[parsed.modulo]) {
      const table = TABLE_BY_MODULO[parsed.modulo];

      if (parsed.acao === "criar" && parsed.dados) {
        const { error } = await supabaseAdmin.from(table).insert(parsed.dados);
        if (error) throw error;
        applied = true;
      }

      if (
        parsed.acao === "criar_lote" &&
        Array.isArray(parsed.dadosLote) &&
        parsed.dadosLote.length > 0
      ) {
        const { error } = await supabaseAdmin.from(table).insert(parsed.dadosLote);
        if (error) throw error;
        applied = true;
      }

      if (parsed.acao === "atualizar" && parsed.registro_id && parsed.dados) {
        const { error } = await supabaseAdmin
          .from(table)
          .update(parsed.dados)
          .eq("id", parsed.registro_id);
        if (error) throw error;
        applied = true;
      }

      if (parsed.acao === "excluir" && parsed.registro_id) {
        const { error } = await supabaseAdmin.from(table).delete().eq("id", parsed.registro_id);
        if (error) throw error;
        applied = true;
      }
    }

    return NextResponse.json({
      resposta: parsed.resposta || "Feito.",
      applied
    });
  } catch (err) {
    console.error("Erro no /api/admin:", err);
    return NextResponse.json(
      { resposta: "Deu um erro ao processar. Tenta de novo em instantes.", applied: false },
      { status: 500 }
    );
  }
}
