import { USE_MOCK_API, apiClient } from "./client";
import { mockStatements } from "./mock/data";
import type { Statement } from "@/types";

const store: Statement[] = [...mockStatements];

export interface UploadStatementInput {
  file: File;
  accountId: string;
  onProgress?: (percent: number) => void;
}

export const statementApi = {
  async list(): Promise<Statement[]> {
    if (USE_MOCK_API) return [...store];
    const { data } = await apiClient.get<Statement[]>("/statements");
    return data;
  },

  async get(id: string): Promise<Statement> {
    if (USE_MOCK_API) {
      const found = store.find((s) => s.id === id);
      if (!found) throw new Error("Statement not found");
      return found;
    }
    const { data } = await apiClient.get<Statement>(`/statements/${id}`);
    return data;
  },

  async upload({ file, accountId, onProgress }: UploadStatementInput): Promise<Statement> {
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
    const { data } = await apiClient.post<Statement>("/statements", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    });
    return data;
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK_API) {
      const idx = store.findIndex((s) => s.id === id);
      if (idx >= 0) store.splice(idx, 1);
      return;
    }
    await apiClient.delete(`/statements/${id}`);
  },

  downloadUrl(id: string): string {
    return `/statements/${id}/download`;
  },
};
