"use client";

import React from "react";
import type { KnowledgeBase } from "@ai-omni/shared";

export function AiCenterApiKnowledgeList({
  knowledgeBases,
  selectedKnowledgeBaseId,
  onSelect,
  onEdit,
  onArchive
}: {
  knowledgeBases: KnowledgeBase[];
  selectedKnowledgeBaseId?: string;
  onSelect?: (knowledgeBase: KnowledgeBase) => void;
  onEdit?: (knowledgeBase: KnowledgeBase) => void;
  onArchive?: (knowledgeBase: KnowledgeBase) => void;
}) {
  if (knowledgeBases.length === 0) {
    return React.createElement("p", { className: "emptyState" }, "No knowledge bases returned by the API.");
  }

  return React.createElement(
    "div",
    { className: "knowledgeCards" },
    knowledgeBases.map((knowledgeBase) =>
      React.createElement(
        "article",
        {
          key: knowledgeBase.id,
          className: `knowledgeCard ${knowledgeBase.id === selectedKnowledgeBaseId ? "selected" : ""}`
        },
        React.createElement(
          "div",
          { className: "knowledgeCardTop" },
          React.createElement(
            "div",
            null,
            React.createElement("span", { className: `statusPill ${knowledgeBase.status}` }, knowledgeBase.status),
            React.createElement("h3", null, knowledgeBase.name),
            React.createElement("p", null, `${knowledgeBase.documentCount} documents`)
          ),
          React.createElement("time", null, new Date(knowledgeBase.updatedAt).toLocaleDateString("th-TH"))
        ),
        React.createElement("p", { className: "knowledgeBody" }, knowledgeBase.description || "No description"),
        React.createElement(
          "div",
          { className: "knowledgeActions" },
          React.createElement("button", { type: "button", onClick: () => onSelect?.(knowledgeBase) }, "Select"),
          React.createElement("button", { type: "button", onClick: () => onEdit?.(knowledgeBase) }, "Edit"),
          React.createElement("button", { type: "button", onClick: () => onArchive?.(knowledgeBase) }, "Archive")
        )
      )
    )
  );
}
