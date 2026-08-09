import { USE_MOCK_API, apiClient } from "./client";
import { mockCategories } from "./mock/data";
import type { Category } from "@/types";

const store: Category[] = [...mockCategories];

export interface CategoryInput {
  name: string;
  parentId: string | null;
  color: string;
}

export const categoryApi = {
  async list(): Promise<Category[]> {
    if (USE_MOCK_API) return [...store];
    const { data } = await apiClient.get<Category[]>("/categories");
    return data;
  },
  async create(input: CategoryInput): Promise<Category> {
    if (USE_MOCK_API) {
      const category: Category = {
        ...input,
        id: `c-${Date.now()}`,
        active: true,
        transactionCount: 0,
      };
      store.push(category);
      return category;
    }
    const { data } = await apiClient.post<Category>("/categories", input);
    return data;
  },
  async update(id: string, input: Partial<CategoryInput>): Promise<Category> {
    if (USE_MOCK_API) {
      const idx = store.findIndex((c) => c.id === id);
      if (idx < 0) throw new Error("Category not found");
      const next = { ...store[idx]!, ...input };
      store[idx] = next;
      return next;
    }
    const { data } = await apiClient.patch<Category>(`/categories/${id}`, input);
    return data;
  },
  /** Deactivating a category with transactions requires a replacement category. */
  async deactivate(id: string, replacementCategoryId?: string): Promise<void> {
    if (USE_MOCK_API) {
      const idx = store.findIndex((c) => c.id === id);
      if (idx < 0) return;
      if (store[idx]!.transactionCount > 0 && !replacementCategoryId) {
        throw new Error("Choose a replacement category before deactivating this category.");
      }
      store[idx] = { ...store[idx]!, active: false };
      return;
    }
    await apiClient.post(`/categories/${id}/deactivate`, { replacementCategoryId });
  },
};
