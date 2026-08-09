import { USE_MOCK_API, apiClient } from "./client";
import { mockTransactions } from "./mock/data";
import { CONFIDENCE_THRESHOLDS } from "@/constants";
import type { AIReviewTransaction } from "@/types";

const approved = new Set<string>();

export const categorizationApi = {
  async pending(): Promise<AIReviewTransaction[]> {
    if (USE_MOCK_API) {
      return mockTransactions
        .filter(
          (t) =>
            t.confidence !== null &&
            t.confidence < CONFIDENCE_THRESHOLDS.medium &&
            !approved.has(t.id),
        )
        .slice(0, 12)
        .map((t) => ({
          ...t,
          suggestedCategoryId: t.categoryId,
          suggestedCategoryName: t.categoryName,
        }));
    }
    const { data } = await apiClient.get<AIReviewTransaction[]>("/categorization/pending");
    return data;
  },

  async approve(transactionIds: string[]): Promise<void> {
    if (USE_MOCK_API) {
      transactionIds.forEach((id) => approved.add(id));
      return;
    }
    await apiClient.post("/categorization/approve", { transactionIds });
  },
};
