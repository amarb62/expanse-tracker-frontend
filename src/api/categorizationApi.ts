import { USE_MOCK_API, apiClient } from "./client";
import { mockTransactions } from "./mock/data";
import { CONFIDENCE_THRESHOLDS } from "@/constants";
import type { AIReviewTransaction } from "@/types";

const approved = new Set<string>();

interface BackendReviewItem {
  transactionId: string;
  accountId: string;
  transactionDate: string;
  description: string;
  normalizedMerchant: string;
  amount: number;
  suggestedCategoryId: string | null;
  suggestedCategoryName: string | null;
  confidence: number | null;
  reason: string;
}

function mapReviewItem(t: BackendReviewItem): AIReviewTransaction {
  return {
    id: t.transactionId,
    date: t.transactionDate,
    description: t.description,
    merchant: t.normalizedMerchant,
    amount: t.amount,
    type: "DEBIT",
    categoryId: null,
    categoryName: null,
    accountId: t.accountId,
    accountName: "",
    source: "AI",
    confidence: t.confidence,
    statementId: null,
    statementName: null,
    suggestedCategoryId: t.suggestedCategoryId,
    suggestedCategoryName: t.suggestedCategoryName,
  };
}

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
    const { data } = await apiClient.get<BackendReviewItem[]>("/categorization/review");
    return data.map(mapReviewItem);
  },

  async approve(transactionIds: string[]): Promise<void> {
    if (USE_MOCK_API) {
      transactionIds.forEach((id) => approved.add(id));
      return;
    }
    // The backend only exposes a per-transaction approve endpoint.
    await Promise.all(transactionIds.map((id) => apiClient.post(`/categorization/${id}/approve`)));
  },
};
