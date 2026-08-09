import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/states";
import { Pagination } from "@/components/Pagination";
import { TransactionFilters } from "@/features/transactions/TransactionFilters";
import { TransactionTable } from "@/features/transactions/TransactionTable";
import { TransactionDetails } from "@/features/transactions/TransactionDetails";
import { useAccounts, useCategories, useTransactions } from "@/hooks/queries";
import { errorMessage } from "@/api/client";
import type { Transaction, TransactionQuery, TransactionSource, TransactionType } from "@/types";

interface Search {
  categoryId?: string | undefined;
  accountId?: string | undefined;
  type?: TransactionType | "" | undefined;
  source?: TransactionSource | "" | undefined;
}

export const Route = createFileRoute("/_shell/transactions")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    categoryId: typeof search["categoryId"] === "string" ? search["categoryId"] : undefined,
    accountId: typeof search["accountId"] === "string" ? search["accountId"] : undefined,
    type: typeof search["type"] === "string" ? (search["type"] as TransactionType) : undefined,
    source:
      typeof search["source"] === "string" ? (search["source"] as TransactionSource) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Transactions — Ledgerly" },
      {
        name: "description",
        content: "Search, filter and review every imported and manual transaction.",
      },
      { property: "og:title", content: "Transactions — Ledgerly" },
      {
        property: "og:description",
        content: "Search, filter and review every imported and manual transaction.",
      },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const search = Route.useSearch();
  const [query, setQuery] = useState<TransactionQuery>({
    page: 0,
    size: 15,
    categoryId: search.categoryId,
    accountId: search.accountId,
    type: search.type,
    source: search.source,
  });
  const [selected, setSelected] = useState<Transaction | null>(null);

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data, isPending, isError, error, refetch } = useTransactions(query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Every purchase, payment, refund and credit in one place.
        </p>
      </div>

      <section className="surface-card p-5">
        <h2 className="sr-only">Filters</h2>
        <TransactionFilters
          value={query}
          onChange={setQuery}
          accounts={accounts}
          categories={categories}
        />
      </section>

      <section className="surface-card p-5">
        {isPending ? (
          <LoadingSkeleton rows={8} />
        ) : isError ? (
          <ErrorState
            message={errorMessage(error, "Unable to load transactions.")}
            onRetry={() => void refetch()}
          />
        ) : data.content.length === 0 ? (
          <EmptyState
            title="No transactions found."
            description="Try widening your filters or upload a new statement."
          />
        ) : (
          <>
            <TransactionTable transactions={data.content} onSelect={setSelected} />
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={(page) => setQuery({ ...query, page })}
            />
          </>
        )}
      </section>

      <TransactionDetails
        transaction={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
