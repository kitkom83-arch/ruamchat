import OpenAI from "openai";
import {
  aiDecisionJsonSchema,
  createFallbackAiDecision,
  createMockAiDecision,
  parseAiDecisionWithFallback,
  type AIDecision
} from "@ai-omni/shared";

export type AiMessageInput = {
  sender: string;
  text: string | null;
};

export type AiAnalysisInput = {
  conversationId: string;
  roomName?: string;
  messages: AiMessageInput[];
};

export type AiAnalysisResult = {
  decision: AIDecision;
  mode: "mock" | "openai";
  model: string;
  error?: string;
};

type ResponsesClient = {
  responses: {
    create(input: unknown): Promise<{ output_text?: string }>;
  };
};

export const defaultOpenAIModel = "gpt-5.4-mini";

// When OPENAI_BASE_URL is set (e.g. Azure AI Foundry v1 endpoint
// https://<resource>.services.ai.azure.com/openai/v1/) route through it with the
// standard OpenAI client; otherwise use the default api.openai.com behavior.
function createResponsesClient(apiKey: string): OpenAI {
  const baseURL = process.env.OPENAI_BASE_URL?.trim();
  if (baseURL) {
    return new OpenAI({ apiKey, baseURL });
  }
  return new OpenAI({ apiKey });
}

export class WorkerAiService {
  constructor(
    private readonly client: ResponsesClient | null,
    private readonly model = process.env.OPENAI_MODEL || defaultOpenAIModel
  ) {}

  static fromEnvironment() {
    const forcedMock = process.env.AI_MODE === "mock";
    if (forcedMock || !process.env.OPENAI_API_KEY) {
      return new WorkerAiService(null);
    }

    return new WorkerAiService(createResponsesClient(process.env.OPENAI_API_KEY) as unknown as ResponsesClient);
  }

  async analyze(input: AiAnalysisInput): Promise<AiAnalysisResult> {
    if (!this.client) {
      return {
        decision: createMockAiDecision(latestCustomerText(input.messages)),
        mode: "mock",
        model: "local-mock-ai"
      };
    }

    try {
      const response = await this.client.responses.create({
        model: this.model,
        input: [
          {
            role: "system",
            content: [
              "You are an AI support router for an omnichannel chat inbox.",
              ...(process.env.AI_BUSINESS_CONTEXT ? ["Business facts (authoritative). Only answer product, price, shipping, hours, payment, or contact questions using these facts. If the needed info is NOT in these facts, do not guess: use suggest_reply or handoff. FACTS: " + process.env.AI_BUSINESS_CONTEXT] : []),
              "Return JSON only through the supplied structured output schema.",
              "Never approve refunds, complaints, human requests, account deletion, payment actions, or personal-data changes without a human.",
              "Choose nextAction carefully based on the latest customer message:",
              "- Use auto_reply when you can fully and confidently answer a general question (greeting, product or service info, pricing, opening hours, FAQ, how-to) that does NOT involve refunds, complaints, requests to talk to a human, payments, account deletion, or personal-data changes.",
              "- Use handoff and set requiresHuman true for refunds, complaints, requests to talk to a human, payments, account deletion, or personal-data changes.",
              "- Use suggest_reply only when you are genuinely uncertain or missing information to answer safely.",
              "Prefer auto_reply for confident, safe answers so the customer gets an instant response.",
              "Use Thai for reply and summary when the visitor writes Thai."
            ].join("\n")
          },
          {
            role: "user",
            content: JSON.stringify({
              roomName: input.roomName,
              conversationId: input.conversationId,
              messages: input.messages
            })
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "omnichannel_ai_decision",
            strict: true,
            schema: aiDecisionJsonSchema
          }
        }
      });

      const parsed = safeJsonParse(response.output_text ?? "{}");
      return {
        decision: parseAiDecisionWithFallback(parsed, "OpenAI output did not match AI schema"),
        mode: "openai",
        model: this.model
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "OpenAI analysis failed";
      return {
        decision: createFallbackAiDecision(message),
        mode: "openai",
        model: this.model,
        error: message
      };
    }
  }
}

function latestCustomerText(messages: AiMessageInput[]) {
  return [...messages].reverse().find((message) => message.sender === "user" || message.sender === "customer")?.text ?? "";
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
