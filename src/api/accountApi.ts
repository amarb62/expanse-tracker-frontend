import { USE_MOCK_API, apiClient } from "./client";
import { mockAccounts } from "./mock/data";
import type { Account } from "@/types";

const store: Account[] = [...mockAccounts];

export type AccountInput = Omit<Account, "id">;

interface BackendAccount {
  id: string;
  name: string;
  institution: string;
  accountType: Account["type"];
  lastFourDigits: string;
  currency: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

function fromBackend(a: BackendAccount): Account {
  return {
    id: a.id,
    name: a.name,
    type: a.accountType,
    institution: a.institution,
    lastFour: a.lastFourDigits,
    currency: a.currency,
    active: a.active,
  };
}

function toBackendRequest(input: AccountInput) {
  return {
    name: input.name,
    institution: input.institution,
    accountType: input.type,
    lastFourDigits: input.lastFour,
    currency: input.currency,
    active: input.active,
  };
}

export const accountApi = {
  async list(): Promise<Account[]> {
    if (USE_MOCK_API) return [...store];
    const { data } = await apiClient.get<BackendAccount[]>("/accounts");
    return data.map(fromBackend);
  },
  async create(input: AccountInput): Promise<Account> {
    if (USE_MOCK_API) {
      const account: Account = { ...input, id: `a-${store.length + 1}-${Date.now()}` };
      store.unshift(account);
      return account;
    }
    const { data } = await apiClient.post<BackendAccount>("/accounts", toBackendRequest(input));
    return fromBackend(data);
  },
  async update(id: string, input: Partial<AccountInput>): Promise<Account> {
    if (USE_MOCK_API) {
      const idx = store.findIndex((a) => a.id === id);
      if (idx < 0) throw new Error("Account not found");
      const next = { ...store[idx]!, ...input };
      store[idx] = next;
      return next;
    }
    // The backend's PUT replaces the whole account, so merge onto the current record first.
    const { data: current } = await apiClient.get<BackendAccount>(`/accounts/${id}`);
    const base = fromBackend(current);
    const merged: AccountInput = {
      name: input.name ?? base.name,
      institution: input.institution ?? base.institution,
      type: input.type ?? base.type,
      lastFour: input.lastFour ?? base.lastFour,
      currency: input.currency ?? base.currency,
      active: input.active ?? base.active,
    };
    const { data } = await apiClient.put<BackendAccount>(
      `/accounts/${id}`,
      toBackendRequest(merged),
    );
    return fromBackend(data);
  },
  async deactivate(id: string): Promise<void> {
    if (USE_MOCK_API) {
      const idx = store.findIndex((a) => a.id === id);
      if (idx >= 0) store[idx] = { ...store[idx]!, active: false };
      return;
    }
    const { data: current } = await apiClient.get<BackendAccount>(`/accounts/${id}`);
    const base = fromBackend(current);
    const merged: AccountInput = {
      name: base.name,
      institution: base.institution,
      type: base.type,
      lastFour: base.lastFour,
      currency: base.currency,
      active: false,
    };
    await apiClient.put(`/accounts/${id}`, toBackendRequest(merged));
  },
};
