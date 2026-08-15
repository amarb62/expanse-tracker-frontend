import { USE_MOCK_API, apiClient } from "./client";
import { accountApi } from "./accountApi";
import { categoryApi } from "./categoryApi";
import { statementApi } from "./statementApi";
import { mockTransactions } from "./mock/data";
import type {
  ExpenseInput,
  IncomeInput,
  Page,
  Transaction,
  TransactionQuery,
  TransactionType,
  TransactionSource,
} from "@/types";

interface BackendTransaction {
  id: string;
  accountId: string;
  statementId: string | null;
  categoryId: string | null;
  transactionDate: string;
  description: string;
  normalizedMerchant: string;
  amount: number;
  transactionType: TransactionType;
  source: TransactionSource;
  confidenceScore: number | null;
}

interface BackendPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface NameLookups {
  accountName: Map<string, string>;
  categoryName: Map<string, string>;
  statementName: Map<string, string>;
}

const EMPTY_LOOKUPS: NameLookups = {
  accountName: new Map(),
  categoryName: new Map(),
  statementName: new Map(),
};

async function buildLookups(): Promise<NameLookups> {
  const [accounts, categories, statements] = await Promise.all([
    accountApi.list(),
    categoryApi.list(),
    statementApi.list(),
  ]);
  return {
    accountName: new Map(accounts.map((a) => [a.id, a.name])),
    categoryName: new Map(categories.map((c) => [c.id, c.name])),
    statementName: new Map(statements.map((s) => [s.id, s.fileName])),
  };
}

function mapTransaction(t: BackendTransaction, lookups: NameLookups = EMPTY_LOOKUPS): Transaction {
  return {
    id: t.id,
    date: t.transactionDate,
    description: t.description,
    merchant: t.normalizedMerchant,
    amount: t.amount,
    type: t.transactionType,
    categoryId: t.categoryId,
    categoryName: t.categoryId ? (lookups.categoryName.get(t.categoryId) ?? null) : null,
    accountId: t.accountId,
    accountName: lookups.accountName.get(t.accountId) ?? "",
    source: t.source,
    confidence: t.confidenceScore,
    statementId: t.statementId,
    statementName: t.statementId ? (lookups.statementName.get(t.statementId) ?? null) : null,
  };
}

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
    const { page = 0, size = 15, from, to, accountId, categoryId, type, source, search } = query;
    const [{ data }, lookups] = await Promise.all([
      apiClient.get<BackendPage<BackendTransaction>>("/transactions", {
        params: {
          page,
          size,
          fromDate: from || undefined,
          toDate: to || undefined,
          accountId: accountId || undefined,
          categoryId: categoryId || undefined,
          transactionType: type || undefined,
          source: source || undefined,
        },
      }),
      buildLookups(),
    ]);
    let content = data.content.map((t) => mapTransaction(t, lookups));
    // The backend has no full-text search; best effort filter within the fetched page only.
    const term = search?.trim().toLowerCase();
    if (term) {
      content = content.filter(
        (t) =>
          t.merchant.toLowerCase().includes(term) || t.description.toLowerCase().includes(term),
      );
    }
    return {
      content,
      page: data.page,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
    };
  },

  async get(id: string): Promise<Transaction> {
    if (USE_MOCK_API) {
      const found = mockTransactions.find((t) => t.id === id);
      if (!found) throw new Error("Transaction not found");
      return found;
    }
    const [{ data }, lookups] = await Promise.all([
      apiClient.get<BackendTransaction>(`/transactions/${id}`),
      buildLookups(),
    ]);
    return mapTransaction(data, lookups);
  },

  async createExpense(input: ExpenseInput): Promise<Transaction> {
    if (USE_MOCK_API) {
      const transaction: Transaction = {
        id: `t-manual-${Date.now()}`,
        date: new Date(input.date).toISOString(),
        description: input.description,
        merchant: input.description,
        amount: input.amount,
        type: "DEBIT",
        categoryId: input.categoryId,
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
    const { data } = await apiClient.post<BackendTransaction>("/transactions/expenses", input);
    return mapTransaction(data);
  },

  async createIncome(input: IncomeInput): Promise<Transaction> {
    if (USE_MOCK_API) {
      const transaction: Transaction = {
        id: `t-income-${Date.now()}`,
        date: new Date(input.date).toISOString(),
        description: input.description,
        merchant: input.description,
        amount: input.amount,
        type: "CREDIT",
        categoryId: input.categoryId,
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
    const { data } = await apiClient.post<BackendTransaction>("/transactions/income", input);
    return mapTransaction(data);
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
    const { data } = await apiClient.patch<BackendTransaction>(`/transactions/${id}/category`, {
      categoryId,
      createRule: rememberForMerchant,
    });
    return mapTransaction(data);
  },
};
