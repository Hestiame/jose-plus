import { ChatMessage } from "./types";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type CallGeminiArgs = {
  system: string;
  messages: ChatMessage[];
  imageBase64?: string;
  imageMimeType?: string;
  jsonMode?: boolean;
};

export async function callGemini({
  system,
  messages,
  imageBase64,
  imageMimeType,
  jsonMode
}: CallGeminiArgs): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const contents = messages.map((m, i) => {
    const isLast = i === messages.length - 1;
    const parts: Record<string, unknown>[] = [{ text: m.content }];
    if (isLast && imageBase64 && m.role === "user") {
      parts.unshift({
        inline_data: { mime_type: imageMimeType || "image/jpeg", data: imageBase64 }
      });
    }
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const body: Record<string, unknown> = {
    system_instruction: { parts: [{ text: system }] },
    contents
  };

  if (jsonMode) {
    body.generationConfig = { responseMimeType: "application/json" };
  }

  const res = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") ||
    "";
  return text;
}
