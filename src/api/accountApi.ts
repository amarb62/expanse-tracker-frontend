import { USE_MOCK_API, apiClient } from "./client";
import { mockAccounts } from "./mock/data";
import type { Account } from "@/types";

const store: Account[] = [...mockAccounts];

export type AccountInput = Omit<Account, "id">;

export const accountApi = {
  async list(): Promise<Account[]> {
    if (USE_MOCK_API) return [...store];
    const { data } = await apiClient.get<Account[]>("/accounts");
    return data;
  },
  async create(input: AccountInput): Promise<Account> {
    if (USE_MOCK_API) {
      const account: Account = { ...input, id: `a-${store.length + 1}-${Date.now()}` };
      store.unshift(account);
      return account;
    }
    const { data } = await apiClient.post<Account>("/accounts", input);
    return data;
  },
  async update(id: string, input: Partial<AccountInput>): Promise<Account> {
    if (USE_MOCK_API) {
      const idx = store.findIndex((a) => a.id === id);
      if (idx < 0) throw new Error("Account not found");
      const next = { ...store[idx]!, ...input };
      store[idx] = next;
      return next;
    }
    const { data } = await apiClient.patch<Account>(`/accounts/${id}`, input);
    return data;
  },
  async deactivate(id: string): Promise<void> {
    if (USE_MOCK_API) {
      const idx = store.findIndex((a) => a.id === id);
      if (idx >= 0) store[idx] = { ...store[idx]!, active: false };
      return;
    }
    await apiClient.post(`/accounts/${id}/deactivate`);
  },
};
