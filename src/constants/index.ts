import type { StatementStatus, TransactionType } from "@/types";

export const APP_NAME = "Expensify";

export const CONFIDENCE_THRESHOLDS = {
  high: 0.9,
  medium: 0.7,
} as const;

export const TRANSACTION_TYPES: TransactionType[] = [
  "DEBIT",
  "CREDIT",
  "TRANSFER",
  "REFUND",
  "PAYMENT",
  "FEE",
  "INTEREST",
  "CASH_WITHDRAWAL",
];

export const STATEMENT_STATUS_LABEL: Record<StatementStatus, string> = {
  UPLOADED: "Uploaded",
  PROCESSING: "Processing",
  PROCESSED: "Processed",
  FAILED: "Failed",
};

export const MAX_STATEMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { to: "/transactions", label: "Transactions", icon: "receipt" },
  { to: "/statements", label: "Statements", icon: "file-text" },
  { to: "/accounts", label: "Accounts", icon: "wallet" },
  { to: "/categories", label: "Categories", icon: "tags" },
  { to: "/ai-review", label: "AI Review", icon: "sparkles" },
  { to: "/settings", label: "Settings", icon: "settings" },
] as const;
