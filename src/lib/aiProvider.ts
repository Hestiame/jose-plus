import { ChatMessage } from "./types";
import { callGemini } from "./gemini";
import { callGroq } from "./groq";

type CallAIArgs = {
  system: string;
  messages: ChatMessage[];
  imageBase64?: string;
  imageMimeType?: string;
  jsonMode?: boolean;
};

type CallAIResult = {
  text: string;
  provider: "gemini" | "groq";
};

// Tenta o Gemini primeiro (é o principal, com o tier gratuito mais generoso).
// Se falhar por qualquer motivo — chave com problema, modelo aposentado, fora
// do ar, limite de uso — cai automaticamente pra Groq, desde que a mensagem
// não dependa de leitura de imagem (a Groq não tem visão confiável no plano
// gratuito). Assim uma falha de um provedor não derruba o José+ inteiro.
export async function callAI({
  system,
  messages,
  imageBase64,
  imageMimeType,
  jsonMode
}: CallAIArgs): Promise<CallAIResult> {
  try {
    const text = await callGemini({ system, messages, imageBase64, imageMimeType, jsonMode });
    if (text) return { text, provider: "gemini" };
    throw new Error("Gemini retornou resposta vazia.");
  } catch (geminiErr) {
    console.error("Gemini falhou, tentando Groq como reserva:", geminiErr);

    if (imageBase64) {
      // Sem plano B pra imagem — deixa o erro original subir.
      throw geminiErr;
    }
    if (!process.env.GROQ_API_KEY) {
      // Sem chave de reserva configurada, não tem pra onde cair.
      throw geminiErr;
    }

    const text = await callGroq({ system, messages, jsonMode });
    return { text, provider: "groq" };
  }
}
