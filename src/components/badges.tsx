import { Badge } from "@/components/ui/badge";
import { CONFIDENCE_LABEL, confidenceLevel } from "@/utils/format";
import type { StatementStatus, TransactionType } from "@/types";
import { STATEMENT_STATUS_LABEL } from "@/constants";
import { cn } from "@/lib/utils";

export function StatementStatusBadge({ status }: { status: StatementStatus }) {
  const tone: Record<StatementStatus, string> = {
    UPLOADED: "bg-muted text-muted-foreground",
    PROCESSING: "bg-warning/15 text-warning-foreground",
    PROCESSED: "bg-positive/15 text-positive",
    FAILED: "bg-destructive/15 text-destructive",
  };
  return (
    <Badge variant="outline" className={cn("border-transparent", tone[status])}>
      {STATEMENT_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: number | null }) {
  const level = confidenceLevel(confidence);
  if (level === null || confidence === null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const tone = {
    high: "bg-positive/15 text-positive",
    medium: "bg-warning/15 text-warning-foreground",
    review: "bg-destructive/15 text-destructive",
  }[level];
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", tone)}
      title={CONFIDENCE_LABEL[level]}
    >
      {Math.round(confidence * 100)}%
    </Badge>
  );
}

export function TypeBadge({ type }: { type: TransactionType }) {
  const tone: Record<TransactionType, string> = {
    PURCHASE: "bg-muted text-foreground",
    PAYMENT: "bg-primary/12 text-primary",
    REFUND: "bg-positive/15 text-positive",
    FEE: "bg-warning/15 text-warning-foreground",
    INTEREST: "bg-warning/15 text-warning-foreground",
    INCOME: "bg-positive/15 text-positive",
  };
  const label = type.charAt(0) + type.slice(1).toLowerCase();
  return (
    <Badge variant="outline" className={cn("border-transparent", tone[type])}>
      {label}
    </Badge>
  );
}
