/**
 * Gemini SDK 래퍼 — 미네르바 도서관 (/library/*)
 *
 * 도서관 전용 streamLibraryChat() 제공.
 * 본 플랫폼의 lib/llm/gemini.ts(미네르바 대화)와 분리되어 있음.
 * Google Search 그라운딩 없음 (원전-인지형 로컬 컨텍스트 대화).
 */

import { GoogleGenAI } from "@google/genai";
import type { Content } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
export const LIBRARY_DEFAULT_MODEL =
  process.env.GEMINI_LIBRARY_MODEL ??
  process.env.GEMINI_MODEL ??
  "gemini-3.1-flash-lite";

function getClient(): GoogleGenAI {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey: API_KEY, vertexai: false });
}

export type LibChatRole = "user" | "assistant";

export interface LibChatMessage {
  role: LibChatRole;
  content: string;
}

function toGeminiContents(messages: LibChatMessage[]): Content[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export async function streamLibraryChat(params: {
  systemPrompt: string;
  messages: LibChatMessage[];
}) {
  const client = getClient();
  const contents = toGeminiContents(params.messages);

  return client.models.generateContentStream({
    model: LIBRARY_DEFAULT_MODEL,
    contents,
    config: {
      systemInstruction: params.systemPrompt,
      temperature: 0.75,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });
}
