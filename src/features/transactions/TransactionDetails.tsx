import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ConfidenceBadge, TypeBadge } from "@/components/badges";
import { CategorySelector } from "@/components/CategorySelector";
import { useCategories, useUpdateTransactionCategory } from "@/hooks/queries";
import { errorMessage } from "@/api/client";
import type { Transaction } from "@/types";
import { CONFIDENCE_LABEL, confidenceLevel, formatCurrency, formatDate } from "@/utils/format";

interface Props {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function TransactionDetails({ transaction, onOpenChange }: Props) {
  const { data: categories = [] } = useCategories();
  const updateCategory = useUpdateTransactionCategory();
  const [editing, setEditing] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [remember, setRemember] = useState(true);

  if (!transaction) return null;
  const level = confidenceLevel(transaction.confidence);

  const submit = () => {
    if (!categoryId) return;
    updateCategory.mutate(
      { transactionId: transaction.id, categoryId, rememberForMerchant: remember },
      {
        onSuccess: () => {
          toast.success("Category updated");
          setEditing(false);
          onOpenChange(false);
        },
        onError: (error) => toast.error(errorMessage(error, "We couldn't update this category.")),
      },
    );
  };

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="px-0">
          <SheetTitle className="text-left">{transaction.merchant}</SheetTitle>
          <SheetDescription className="text-left">
            {formatDate(transaction.date)} · {transaction.accountName || "Account"}
          </SheetDescription>
        </SheetHeader>

        <p className="numeric text-3xl font-semibold text-foreground">
          {formatCurrency(transaction.amount)}
        </p>

        <Separator className="my-4" />

        <dl className="divide-y divide-border">
          <Row label="Raw description" value={transaction.description} />
          <Row label="Normalized merchant" value={transaction.merchant} />
          <Row label="Type" value={<TypeBadge type={transaction.type} />} />
          <Row label="Category" value={transaction.categoryName ?? "Uncategorized"} />
          <Row label="Source" value={transaction.source} />
          <Row
            label="AI confidence"
            value={<ConfidenceBadge confidence={transaction.confidence} />}
          />
          <Row label="Statement" value={transaction.statementName ?? "—"} />
        </dl>

        {transaction.confidence !== null && level ? (
          <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            AI categorized this transaction with {Math.round(transaction.confidence * 100)}%
            confidence ({CONFIDENCE_LABEL[level].toLowerCase()}). Confidence is an estimate, not a
            guarantee of accuracy.
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {editing ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="detail-category">New category</Label>
                <CategorySelector
                  id="detail-category"
                  categories={categories}
                  value={categoryId}
                  onChange={setCategoryId}
                />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="remember-merchant"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                />
                <Label htmlFor="remember-merchant" className="text-sm font-normal leading-snug">
                  Remember this category for future {transaction.merchant} transactions
                </Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={submit} disabled={!categoryId || updateCategory.isPending}>
                  {updateCategory.isPending ? "Saving…" : "Save category"}
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Change category
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
