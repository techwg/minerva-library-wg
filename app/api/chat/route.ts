/**
 * POST /api/chat — 미네르바 도서관 AI 패널
 *
 * 요청:
 * {
 *   personaId: string,
 *   messages: Array<{ role: 'user' | 'assistant', content: string }>,
 *   mode: 'library',
 *   context: LibraryContext
 * }
 *
 * 응답: SSE
 *   data: { type: 'delta', text: string }  — 스트리밍 텍스트
 *   data: { type: 'done' }                 — 완료
 *   data: { type: 'error', message: string }
 */

import { NextRequest } from "next/server";
import { streamLibraryChat } from "@/lib/gemini";
import { buildLibrarySystemPrompt } from "@/lib/libraryPersonas";
import type { LibraryContext, ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  personaId: string;
  messages: ChatMessage[];
  mode: "library";
  context: LibraryContext;
}

const encoder = new TextEncoder();
function sse(payload: object): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { personaId, messages, context } = body;

  if (!personaId || !Array.isArray(messages) || messages.length === 0 || !context) {
    return new Response(
      JSON.stringify({ error: "personaId, messages[], context are required" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const systemPrompt = buildLibrarySystemPrompt(personaId, context);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const geminiStream = await streamLibraryChat({ systemPrompt, messages });

        for await (const chunk of geminiStream) {
          const deltaText =
            chunk.candidates?.[0]?.content?.parts
              ?.map((p) => ("text" in p ? (p.text ?? "") : ""))
              .join("") ?? "";

          if (deltaText) {
            controller.enqueue(sse({ type: "delta", text: deltaText }));
          }
        }

        controller.enqueue(sse({ type: "done" }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[library /api/chat] Gemini 호출 실패:", err);
        controller.enqueue(sse({ type: "error", message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
