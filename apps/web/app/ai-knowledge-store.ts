import {
  knowledgeItemSchema,
  sampleKnowledgeItems,
  type KnowledgeCategory,
  type KnowledgeItem,
  type KnowledgeStatus
} from "@ai-omni/shared";

export const knowledgeStorageKey = "ai-omni-knowledge-demo-v1";

export const knowledgeCategories: Array<{ id: KnowledgeCategory; label: string }> = [
  { id: "business_info", label: "Business Info" },
  { id: "faq", label: "FAQ" },
  { id: "product_service", label: "Product / Service" },
  { id: "price_rules", label: "Price Rules" },
  { id: "sales_script", label: "Sales Script" },
  { id: "support_policy", label: "Support Policy" },
  { id: "forbidden_answers", label: "Forbidden Answers" },
  { id: "ai_persona", label: "AI Persona" }
];

export const knowledgeStatuses: KnowledgeStatus[] = ["draft", "active", "archived"];

export function getKnowledgeCategoryLabel(category: KnowledgeCategory) {
  return knowledgeCategories.find((item) => item.id === category)?.label ?? category;
}

export function getStoredKnowledgeItems(): KnowledgeItem[] {
  if (typeof window === "undefined") return sampleKnowledgeItems;

  try {
    const raw = window.localStorage.getItem(knowledgeStorageKey);
    if (!raw) {
      saveStoredKnowledgeItems(sampleKnowledgeItems);
      return sampleKnowledgeItems;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return sampleKnowledgeItems;

    const validItems = parsed
      .map((item) => knowledgeItemSchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data);

    return validItems.length > 0 ? validItems : sampleKnowledgeItems;
  } catch {
    return sampleKnowledgeItems;
  }
}

export function saveStoredKnowledgeItems(items: KnowledgeItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(knowledgeStorageKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(knowledgeStorageKey, { detail: items }));
}

export function subscribeStoredKnowledgeItems(callback: (items: KnowledgeItem[]) => void) {
  if (typeof window === "undefined") return () => {};

  const notify = () => callback(getStoredKnowledgeItems());
  const handleStorage = (event: StorageEvent) => {
    if (event.key === knowledgeStorageKey) notify();
  };
  const handleCustom = () => notify();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(knowledgeStorageKey, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(knowledgeStorageKey, handleCustom);
  };
}

export function createEmptyKnowledgeItem(category: KnowledgeCategory = "faq"): KnowledgeItem {
  return {
    id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    category,
    body: "",
    status: "draft",
    tags: [],
    updatedAt: new Date().toISOString()
  };
}
