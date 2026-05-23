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

    return new WorkerAiService(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) as unknown as ResponsesClient);
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
              "Return JSON only through the supplied structured output schema.",
              "Never approve refunds, complaints, human requests, account deletion, payment actions, or personal-data changes without a human.",
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
