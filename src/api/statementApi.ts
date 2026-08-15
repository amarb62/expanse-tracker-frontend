import { USE_MOCK_API, apiClient } from "./client";
import { accountApi } from "./accountApi";
import { mockStatements } from "./mock/data";
import { CONFIDENCE_THRESHOLDS } from "@/constants";
import type { Statement, StatementStatus } from "@/types";

const store: Statement[] = [...mockStatements];

export interface UploadStatementInput {
  file: File;
  accountId: string;
  password?: string;
  onProgress?: (percent: number) => void;
}

interface BackendStatement {
  id: string;
  accountId: string;
  fileName: string;
  statementStartDate: string | null;
  statementEndDate: string | null;
  status: StatementStatus;
  uploadedAt: string;
  processedAt: string | null;
  errorMessage: string | null;
}

interface StatementStats {
  transactionCount: number;
  categorizedCount: number;
  needsReviewCount: number;
}

const EMPTY_STATS: StatementStats = {
  transactionCount: 0,
  categorizedCount: 0,
  needsReviewCount: 0,
};

/**
 * The backend has no per-statement counters and no way to filter /transactions
 * by statementId, so derive them by scanning a large page of transactions once.
 */
async function buildStatementStats(): Promise<Map<string, StatementStats>> {
  interface MinimalTransaction {
    statementId: string | null;
    categoryId: string | null;
    confidenceScore: number | null;
  }
  const { data } = await apiClient.get<{ content: MinimalTransaction[] }>("/transactions", {
    params: { page: 0, size: 2000 },
  });
  const stats = new Map<string, StatementStats>();
  for (const t of data.content) {
    if (!t.statementId) continue;
    const current = stats.get(t.statementId) ?? { ...EMPTY_STATS };
    current.transactionCount += 1;
    if (t.categoryId) current.categorizedCount += 1;
    if (t.confidenceScore !== null && t.confidenceScore < CONFIDENCE_THRESHOLDS.medium) {
      current.needsReviewCount += 1;
    }
    stats.set(t.statementId, current);
  }
  return stats;
}

function mapStatement(s: BackendStatement, accountName: string, stats: StatementStats): Statement {
  return {
    id: s.id,
    fileName: s.fileName,
    accountId: s.accountId,
    accountName,
    periodStart: s.statementStartDate ?? "",
    periodEnd: s.statementEndDate ?? "",
    uploadedAt: s.uploadedAt,
    status: s.status,
    transactionCount: stats.transactionCount,
    categorizedCount: stats.categorizedCount,
    needsReviewCount: stats.needsReviewCount,
    ...(s.errorMessage ? { errorMessage: s.errorMessage } : {}),
  };
}

export const statementApi = {
  async list(): Promise<Statement[]> {
    if (USE_MOCK_API) return [...store];
    const [{ data }, accounts, stats] = await Promise.all([
      apiClient.get<BackendStatement[]>("/statements"),
      accountApi.list(),
      buildStatementStats(),
    ]);
    const nameById = new Map(accounts.map((a) => [a.id, a.name]));
    return data.map((s) =>
      mapStatement(s, nameById.get(s.accountId) ?? "", stats.get(s.id) ?? EMPTY_STATS),
    );
  },

  async get(id: string): Promise<Statement> {
    if (USE_MOCK_API) {
      const found = store.find((s) => s.id === id);
      if (!found) throw new Error("Statement not found");
      return found;
    }
    const [{ data }, accounts, stats] = await Promise.all([
      apiClient.get<BackendStatement>(`/statements/${id}`),
      accountApi.list(),
      buildStatementStats(),
    ]);
    const accountName = accounts.find((a) => a.id === data.accountId)?.name ?? "";
    return mapStatement(data, accountName, stats.get(id) ?? EMPTY_STATS);
  },

  async upload({
    file,
    accountId,
    password,
    onProgress,
  }: UploadStatementInput): Promise<Statement> {
    if (USE_MOCK_API) {
      for (let p = 20; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 180));
        onProgress?.(p);
      }
      const statement: Statement = {
        id: `s-${Date.now()}`,
        fileName: file.name,
        accountId,
        accountName: "",
        periodStart: new Date().toISOString().slice(0, 10),
        periodEnd: new Date().toISOString().slice(0, 10),
        uploadedAt: new Date().toISOString(),
        status: "PROCESSING",
        transactionCount: 0,
        categorizedCount: 0,
        needsReviewCount: 0,
      };
      store.unshift(statement);
      // Simulate backend processing completing shortly after upload.
      setTimeout(() => {
        const idx = store.findIndex((s) => s.id === statement.id);
        if (idx >= 0) {
          store[idx] = {
            ...store[idx]!,
            status: "PROCESSED",
            transactionCount: 124,
            categorizedCount: 117,
            needsReviewCount: 7,
          };
        }
      }, 6000);
      return statement;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("accountId", accountId);
    if (password) form.append("password", password);
    const { data } = await apiClient.post<BackendStatement>("/statements/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    });
    const accounts = await accountApi.list();
    const accountName = accounts.find((a) => a.id === data.accountId)?.name ?? "";
    return mapStatement(data, accountName, EMPTY_STATS);
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      const idx = store.findIndex((s) => s.id === id);
      if (idx >= 0) store.splice(idx, 1);
      return;
    }
    await apiClient.delete(`/statements/${id}`);
  },

  async download(id: string, fileName: string): Promise<void> {
    if (USE_MOCK_API) return;
    const response = await apiClient.get(`/statements/${id}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
