import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfidenceBadge, TypeBadge } from "@/components/badges";
import type { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

function amountTone(t: Transaction): string {
  if (t.type === "INCOME" || t.type === "REFUND") return "text-positive";
  if (t.type === "PAYMENT") return "text-primary";
  return "text-foreground";
}

function amountPrefix(t: Transaction): string {
  if (t.type === "INCOME" || t.type === "REFUND") return "+";
  if (t.type === "PAYMENT") return "";
  return "−";
}

export function TransactionTable({
  transactions,
  onSelect,
}: {
  transactions: Transaction[];
  onSelect: (transaction: Transaction) => void;
}) {
  return (
    <>
      {/* Mobile: card list */}
      <ul className="space-y-2 md:hidden">
        {transactions.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t)}
              className="surface-card w-full p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{t.merchant}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(t.date)} · {t.categoryName ?? "Uncategorized"}
                  </p>
                </div>
                <span className={cn("numeric shrink-0 font-semibold", amountTone(t))}>
                  {amountPrefix(t)}
                  {formatCurrency(t.amount)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TypeBadge type={t.type} />
                <ConfidenceBadge confidence={t.confidence} />
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <caption className="sr-only">Transactions</caption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow
                key={t.id}
                tabIndex={0}
                role="button"
                onClick={() => onSelect(t)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(t);
                  }
                }}
                className="cursor-pointer"
              >
                <TableCell className="numeric whitespace-nowrap text-muted-foreground">
                  {formatDate(t.date)}
                </TableCell>
                <TableCell className="max-w-[220px] truncate">{t.description}</TableCell>
                <TableCell className="font-medium">{t.merchant}</TableCell>
                <TableCell className={cn("numeric text-right font-semibold", amountTone(t))}>
                  {amountPrefix(t)}
                  {formatCurrency(t.amount)}
                </TableCell>
                <TableCell>
                  <TypeBadge type={t.type} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.categoryName ?? "Uncategorized"}
                </TableCell>
                <TableCell className="text-xs uppercase text-muted-foreground">
                  {t.source}
                </TableCell>
                <TableCell className="text-right">
                  <ConfidenceBadge confidence={t.confidence} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
