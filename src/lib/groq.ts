import { ChatMessage } from "./types";

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

type CallGroqArgs = {
  system: string;
  messages: ChatMessage[];
  jsonMode?: boolean;
};

// A Groq não tem um modelo gratuito com visão computacional confiável, então esse
// helper só atende texto — é usado como plano B quando o Gemini falha e a
// mensagem não envolve foto.
export async function callGroq({ system, messages, jsonMode }: CallGroqArgs): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY não configurada.");

  const body: Record<string, unknown> = {
    model: MODEL,
    messages: [{ role: "system", content: system }, ...messages.map((m) => ({ role: m.role, content: m.content }))]
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}
