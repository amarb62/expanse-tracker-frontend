import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfidenceBadge } from "@/components/badges";
import { CategorySelector } from "@/components/CategorySelector";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/states";
import {
  useApproveCategorization,
  useCategories,
  usePendingCategorization,
  useUpdateTransactionCategory,
} from "@/hooks/queries";
import { errorMessage } from "@/api/client";
import { formatCurrency, formatDate } from "@/utils/format";

export const Route = createFileRoute("/_shell/ai-review")({
  head: () => ({
    meta: [
      { title: "AI Review — Expensify" },
      {
        name: "description",
        content: "Review and correct low-confidence AI category suggestions.",
      },
      { property: "og:title", content: "AI Review — Expensify" },
      {
        property: "og:description",
        content: "Review and correct low-confidence AI category suggestions.",
      },
    ],
  }),
  component: AIReviewPage,
});

function AIReviewPage() {
  const { data, isPending, isError, error, refetch } = usePendingCategorization();
  const { data: categories = [] } = useCategories();
  const approve = useApproveCategorization();
  const updateCategory = useUpdateTransactionCategory();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const approveIds = (ids: string[]) =>
    approve.mutate(ids, {
      onSuccess: () => {
        toast.success(ids.length > 1 ? `${ids.length} transactions approved` : "Approved");
        setSelected([]);
      },
      onError: (e) => toast.error(errorMessage(e, "We couldn't approve those transactions.")),
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">AI category review</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.length} transactions need review` : "Checking suggestions…"} · AI
            confidence is an estimate, not guaranteed accuracy.
          </p>
        </div>
        {selected.length > 0 ? (
          <Button onClick={() => approveIds(selected)} disabled={approve.isPending}>
            Approve {selected.length} selected
          </Button>
        ) : null}
      </div>

      {isPending ? (
        <LoadingSkeleton rows={5} />
      ) : isError ? (
        <ErrorState
          message={errorMessage(error, "Unable to load AI suggestions.")}
          onRetry={() => void refetch()}
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="You're all caught up."
          description="No low-confidence categorizations to review."
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      ) : (
        <ul className="space-y-3">
          {data.map((t) => (
            <li key={t.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <Checkbox
                checked={selected.includes(t.id)}
                onCheckedChange={() => toggle(t.id)}
                aria-label={`Select ${t.merchant}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.merchant}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(t.date)} · {t.description}
                </p>
              </div>
              <span className="numeric font-semibold">{formatCurrency(t.amount)}</span>
              <span className="text-sm text-muted-foreground">
                {t.suggestedCategoryName ?? "Other"}
              </span>
              <ConfidenceBadge confidence={t.confidence} />
              <div className="flex items-center gap-2">
                <div className="w-44">
                  <CategorySelector
                    categories={categories}
                    value={undefined}
                    placeholder="Change category"
                    onChange={(categoryId) =>
                      updateCategory.mutate(
                        { transactionId: t.id, categoryId, rememberForMerchant: true },
                        {
                          onSuccess: () => toast.success("Category updated for this merchant"),
                          onError: (e) =>
                            toast.error(errorMessage(e, "We couldn't update that category.")),
                        },
                      )
                    }
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => approveIds([t.id])}>
                  Approve
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
