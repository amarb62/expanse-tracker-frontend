import { USE_MOCK_API, apiClient } from "./client";
import { mockTransactions } from "./mock/data";
import type {
  ExpenseInput,
  IncomeInput,
  Page,
  Transaction,
  TransactionQuery,
} from "@/types";

function applyFilters(query: TransactionQuery): Transaction[] {
  const search = query.search?.trim().toLowerCase() ?? "";
  return mockTransactions.filter((t) => {
    if (query.from && t.date < new Date(query.from).toISOString()) return false;
    if (query.to && t.date > new Date(`${query.to}T23:59:59`).toISOString()) return false;
    if (query.accountId && t.accountId !== query.accountId) return false;
    if (query.categoryId && t.categoryId !== query.categoryId) return false;
    if (query.type && t.type !== query.type) return false;
    if (query.source && t.source !== query.source) return false;
    if (
      search &&
      !t.merchant.toLowerCase().includes(search) &&
      !t.description.toLowerCase().includes(search)
    ) {
      return false;
    }
    return true;
  });
}

export const transactionApi = {
  async list(query: TransactionQuery): Promise<Page<Transaction>> {
    if (USE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      const size = query.size ?? 15;
      const page = query.page ?? 0;
      const all = applyFilters(query);
      return {
        content: all.slice(page * size, page * size + size),
        page,
        size,
        totalElements: all.length,
        totalPages: Math.max(1, Math.ceil(all.length / size)),
      };
    }
    const { data } = await apiClient.get<Page<Transaction>>("/transactions", { params: query });
    return data;
  },

  async get(id: string): Promise<Transaction> {
    if (USE_MOCK_API) {
      const found = mockTransactions.find((t) => t.id === id);
      if (!found) throw new Error("Transaction not found");
      return found;
    }
    const { data } = await apiClient.get<Transaction>(`/transactions/${id}`);
    return data;
  },

  async createExpense(input: ExpenseInput): Promise<Transaction> {
    if (USE_MOCK_API) {
      const transaction: Transaction = {
        id: `t-manual-${Date.now()}`,
        date: new Date(input.date).toISOString(),
        description: input.description,
        merchant: input.description,
        amount: input.amount,
        type: "PURCHASE",
        categoryId: input.categoryId,
        categoryName: null,
        accountId: input.accountId,
        accountName: "",
        source: "MANUAL",
        confidence: null,
        statementId: null,
        statementName: null,
        ...(input.notes ? { notes: input.notes } : {}),
      };
      mockTransactions.unshift(transaction);
      return transaction;
    }
    const { data } = await apiClient.post<Transaction>("/transactions/expenses", input);
    return data;
  },

  async createIncome(input: IncomeInput): Promise<Transaction> {
    if (USE_MOCK_API) {
      const transaction: Transaction = {
        id: `t-income-${Date.now()}`,
        date: new Date(input.date).toISOString(),
        description: input.description,
        merchant: input.incomeType,
        amount: input.amount,
        type: "INCOME",
        categoryId: null,
        categoryName: null,
        accountId: input.accountId,
        accountName: "",
        source: "MANUAL",
        confidence: null,
        statementId: null,
        statementName: null,
      };
      mockTransactions.unshift(transaction);
      return transaction;
    }
    const { data } = await apiClient.post<Transaction>("/transactions/income", input);
    return data;
  },

  async updateCategory(
    id: string,
    categoryId: string,
    rememberForMerchant: boolean,
  ): Promise<Transaction> {
    if (USE_MOCK_API) {
      const idx = mockTransactions.findIndex((t) => t.id === id);
      if (idx < 0) throw new Error("Transaction not found");
      const updated: Transaction = {
        ...mockTransactions[idx]!,
        categoryId,
        confidence: 1,
        source: "MANUAL",
      };
      mockTransactions[idx] = updated;
      if (rememberForMerchant) {
        mockTransactions.forEach((t, i) => {
          if (t.merchant === updated.merchant) {
            mockTransactions[i] = { ...t, categoryId, confidence: 1 };
          }
        });
      }
      return updated;
    }
    const { data } = await apiClient.patch<Transaction>(`/transactions/${id}/category`, {
      categoryId,
      rememberForMerchant,
    });
    return data;
  },
};
