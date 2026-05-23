import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AiCenterApiKnowledgeList } from "./ai-center/api-knowledge-list";

describe("AI Center API view", () => {
  it("renders API knowledge base data without mock fallback text", () => {
    const html = renderToString(React.createElement(AiCenterApiKnowledgeList, {
      knowledgeBases: [{
        id: "kb-api",
        tenantId: "00000000-0000-4000-8000-000000000001",
        name: "Backend API Knowledge",
        description: "Persisted from API",
        status: "active",
        documentCount: 2,
        updatedAt: "2026-05-21T04:00:00.000Z"
      }],
      selectedKnowledgeBaseId: "kb-api"
    }));

    expect(html).toContain("Backend API Knowledge");
    expect(html).toContain("2 documents");
    expect(html).not.toContain("No knowledge bases returned by the API");
  });
});
