import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { accountApi, type AccountInput } from "@/api/accountApi";
import { categorizationApi } from "@/api/categorizationApi";
import { categoryApi, type CategoryInput } from "@/api/categoryApi";
import { dashboardApi } from "@/api/dashboardApi";
import { statementApi, type UploadStatementInput } from "@/api/statementApi";
import { transactionApi } from "@/api/transactionApi";
import type {
  Account,
  AIReviewTransaction,
  Category,
  ExpenseInput,
  IncomeInput,
  MonthlyDashboard,
  Page,
  Statement,
  Transaction,
  TransactionQuery,
  YearlyDashboard,
} from "@/types";

export const queryKeys = {
  accounts: ["accounts"] as const,
  categories: ["categories"] as const,
  statements: ["statements"] as const,
  statement: (id: string) => ["statements", id] as const,
  transactions: (query: TransactionQuery) => ["transactions", query] as const,
  monthly: (month: string, accountId?: string) =>
    ["dashboard", "monthly", month, accountId] as const,
  yearly: (year: number, accountId?: string) => ["dashboard", "yearly", year, accountId] as const,
  pending: ["categorization", "pending"] as const,
};

function useInvalidateFinancials() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: ["categorization"] });
    void queryClient.invalidateQueries({ queryKey: ["statements"] });
  };
}

export function useAccounts(): UseQueryResult<Account[]> {
  return useQuery({ queryKey: queryKeys.accounts, queryFn: () => accountApi.list() });
}

export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({ queryKey: queryKeys.categories, queryFn: () => categoryApi.list() });
}

export function useMonthlyDashboard(
  month: string,
  accountId?: string,
): UseQueryResult<MonthlyDashboard> {
  return useQuery({
    queryKey: queryKeys.monthly(month, accountId),
    queryFn: () => dashboardApi.monthly(month, accountId),
  });
}

export function useYearlyDashboard(
  year: number,
  accountId?: string,
): UseQueryResult<YearlyDashboard> {
  return useQuery({
    queryKey: queryKeys.yearly(year, accountId),
    queryFn: () => dashboardApi.yearly(year, accountId),
  });
}

export function useTransactions(query: TransactionQuery): UseQueryResult<Page<Transaction>> {
  return useQuery({
    queryKey: queryKeys.transactions(query),
    queryFn: () => transactionApi.list(query),
  });
}

export function useStatements(): UseQueryResult<Statement[]> {
  return useQuery({
    queryKey: queryKeys.statements,
    queryFn: () => statementApi.list(),
    refetchInterval: (query) => {
      const data = query.state.data as Statement[] | undefined;
      const processing = data?.some((s) => s.status === "PROCESSING" || s.status === "UPLOADED");
      return processing ? 3000 : false;
    },
  });
}

export function useStatement(id: string): UseQueryResult<Statement> {
  return useQuery({
    queryKey: queryKeys.statement(id),
    queryFn: () => statementApi.get(id),
    refetchInterval: (query) => {
      const data = query.state.data as Statement | undefined;
      return data && (data.status === "PROCESSING" || data.status === "UPLOADED") ? 3000 : false;
    },
  });
}

export function usePendingCategorization(): UseQueryResult<AIReviewTransaction[]> {
  return useQuery({ queryKey: queryKeys.pending, queryFn: () => categorizationApi.pending() });
}

export function useCreateExpense(): UseMutationResult<Transaction, Error, ExpenseInput> {
  const invalidate = useInvalidateFinancials();
  return useMutation({
    mutationFn: (input: ExpenseInput) => transactionApi.createExpense(input),
    onSuccess: invalidate,
  });
}

export function useCreateIncome(): UseMutationResult<Transaction, Error, IncomeInput> {
  const invalidate = useInvalidateFinancials();
  return useMutation({
    mutationFn: (input: IncomeInput) => transactionApi.createIncome(input),
    onSuccess: invalidate,
  });
}

export interface CategoryChange {
  transactionId: string;
  categoryId: string;
  rememberForMerchant: boolean;
}

export function useUpdateTransactionCategory(): UseMutationResult<
  Transaction,
  Error,
  CategoryChange
> {
  const invalidate = useInvalidateFinancials();
  return useMutation({
    mutationFn: ({ transactionId, categoryId, rememberForMerchant }: CategoryChange) =>
      transactionApi.updateCategory(transactionId, categoryId, rememberForMerchant),
    onSuccess: invalidate,
  });
}

export function useApproveCategorization(): UseMutationResult<void, Error, string[]> {
  const invalidate = useInvalidateFinancials();
  return useMutation({
    mutationFn: (ids: string[]) => categorizationApi.approve(ids),
    onSuccess: invalidate,
  });
}

export function useUploadStatement(): UseMutationResult<Statement, Error, UploadStatementInput> {
  const invalidate = useInvalidateFinancials();
  return useMutation({
    mutationFn: (input: UploadStatementInput) => statementApi.upload(input),
    onSuccess: invalidate,
  });
}

export function useDeleteStatement(): UseMutationResult<void, Error, string> {
  const invalidate = useInvalidateFinancials();
  return useMutation({
    mutationFn: (id: string) => statementApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useDownloadStatement(): UseMutationResult<
  void,
  Error,
  { id: string; fileName: string }
> {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName: string }) =>
      statementApi.download(id, fileName),
  });
}

export function useSaveAccount(): UseMutationResult<
  Account,
  Error,
  { id?: string; input: AccountInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: AccountInput }) =>
      id ? accountApi.update(id, input) : accountApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}

export function useDeactivateAccount(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountApi.deactivate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}

export function useSaveCategory(): UseMutationResult<
  Category,
  Error,
  { id?: string; input: CategoryInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CategoryInput }) =>
      id ? categoryApi.update(id, input) : categoryApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}

export function useDeactivateCategory(): UseMutationResult<
  void,
  Error,
  { id: string; replacementCategoryId?: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, replacementCategoryId }: { id: string; replacementCategoryId?: string }) =>
      categoryApi.deactivate(id, replacementCategoryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
}
