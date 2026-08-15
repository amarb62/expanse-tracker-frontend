import { USE_MOCK_API, apiClient } from "./client";
import { mockCategories } from "./mock/data";
import type { Category, CategoryType } from "@/types";

const store: Category[] = [...mockCategories];

export interface CategoryInput {
  name: string;
  parentId: string | null;
  color: string;
}

interface BackendCategoryNode {
  id: string;
  name: string;
  categoryType: CategoryType;
  parentId: string | null;
  active: boolean;
  color: string;
  transactionCount: number;
  children: BackendCategoryNode[];
}

function flatten(nodes: BackendCategoryNode[], out: Category[] = []): Category[] {
  for (const node of nodes) {
    out.push({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      color: node.color,
      active: node.active,
      transactionCount: node.transactionCount,
      categoryType: node.categoryType,
    });
    if (node.children.length > 0) flatten(node.children, out);
  }
  return out;
}

export const categoryApi = {
  async list(): Promise<Category[]> {
    if (USE_MOCK_API) return [...store];
    const { data } = await apiClient.get<BackendCategoryNode[]>("/categories", {
      params: { includeInactive: true },
    });
    return flatten(data);
  },
  async create(input: CategoryInput): Promise<Category> {
    if (USE_MOCK_API) {
      const category: Category = {
        ...input,
        id: `c-${Date.now()}`,
        active: true,
        transactionCount: 0,
        categoryType: "EXPENSE",
      };
      store.push(category);
      return category;
    }
    // The category management UI only ever creates spending categories today;
    // income categories are pre-seeded (SALARY/BONUS/FREELANCE_INCOME/OTHER_INCOME).
    const { data } = await apiClient.post<BackendCategoryNode>("/categories", {
      name: input.name,
      parentId: input.parentId,
      color: input.color,
      categoryType: "EXPENSE",
    });
    return flatten([data])[0]!;
  },
  async update(id: string, input: Partial<CategoryInput>): Promise<Category> {
    if (USE_MOCK_API) {
      const idx = store.findIndex((c) => c.id === id);
      if (idx < 0) throw new Error("Category not found");
      const next = { ...store[idx]!, ...input };
      store[idx] = next;
      return next;
    }
    const { data } = await apiClient.patch<BackendCategoryNode>(`/categories/${id}`, input);
    return flatten([data])[0]!;
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
