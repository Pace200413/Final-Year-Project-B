import { NextResponse } from "next/server";
import { z } from "zod";

import type { AssistantResponse, HistoryItem } from "@/lib/assistant/types";
import { interpretAssistantMessage, normalize, isLowInformationMessage } from "@/lib/assistant/interpret";
import { ground, capabilityResponse, responseForEntryId, lowInformationResponse } from "@/lib/assistant/ground";
import { classifyMessage, getSafetyResponse } from "@/lib/assistant/safety";
import { checkRateLimit, getClientIdentifier } from "@/lib/assistant/rate-limit";

const BodySchema = z.object({
  message: z.string().optional(),
  targetEntryId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
  currentTopic: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema>;

  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({
        reply: "I couldn't read that request properly.",
        sources: [],
        actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
        currentTopic: null,
      } satisfies AssistantResponse);
    }

    body = parsed.data;
  } catch {
    return NextResponse.json({
      reply: "I couldn't read that request properly.",
      sources: [],
      actions: [{ type: "OPEN_SUPPORT", label: "Open Support" }],
      currentTopic: null,
    } satisfies AssistantResponse);
  }

  const message = (body.message || "").trim();
  const history: HistoryItem[] = body.history || [];
  const isDebug = process.env.ASSISTANT_DEBUG === "1";

  // Apply a simple per-client rate limit before any expensive work.
  const clientId = getClientIdentifier(req);
  const { allowed } = checkRateLimit(clientId);
  if (!allowed) {
    const response: AssistantResponse = {
      reply: "Too many requests right now. Please wait a moment and try again.",
      sources: [],
      actions: [],
      currentTopic: null,
    };

    if (isDebug) {
      (response as any).debug = {
        mode: "rate_limited",
        clientId,
      };
    }

    return NextResponse.json(response, { status: 429 });
  }

  if (body.targetEntryId) {
    const response = responseForEntryId(body.targetEntryId);
    if (response) {
      if (isDebug) {
        response.debug = {
          mode: "targetEntryId",
          targetEntryId: body.targetEntryId,
        };
      }
      return NextResponse.json(response);
    }
  }

  if (!message) {
    const response = capabilityResponse();
    if (isDebug) {
      response.debug = { mode: "empty_message" };
    }
    return NextResponse.json(response);
  }

  const safetyCategory = classifyMessage(message);
  if (safetyCategory !== "SAFE_IN_DOMAIN") {
    return NextResponse.json(getSafetyResponse(safetyCategory));
  }

  if (isLowInformationMessage(message, history, body.currentTopic ?? null)) {
    const response = lowInformationResponse();
    if (isDebug) {
      response.debug = {
        mode: "low_information",
        normalizedMessage: normalize(message),
      };
    }
    return NextResponse.json(response);
  }

  const { interpretation, heuristic, ai } = await interpretAssistantMessage(
    message,
    body.currentTopic,
    history,
    { openaiApiKey: process.env.OPENAI_API_KEY }
  );

  const response = ground(interpretation, message);

  if (isDebug) {
    response.debug = {
      normalizedMessage: normalize(message),
      heuristic,
      ai,
      final: interpretation,
    };
  }

  return NextResponse.json(response);
}