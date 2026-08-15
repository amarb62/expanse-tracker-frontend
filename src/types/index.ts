export type UUID = string;

export interface User {
  id: UUID;
  name: string;
  email: string;
  currency: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type AccountType = "BANK_ACCOUNT" | "CREDIT_CARD" | "CASH" | "OTHER";

export interface Account {
  id: UUID;
  name: string;
  type: AccountType;
  institution: string;
  lastFour: string;
  currency: string;
  active: boolean;
}

export type StatementStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";

export interface Statement {
  id: UUID;
  fileName: string;
  accountId: UUID;
  accountName: string;
  periodStart: string;
  periodEnd: string;
  uploadedAt: string;
  status: StatementStatus;
  transactionCount: number;
  categorizedCount: number;
  needsReviewCount: number;
  errorMessage?: string | undefined;
}

export type TransactionType =
  "DEBIT" | "CREDIT" | "TRANSFER" | "REFUND" | "PAYMENT" | "FEE" | "INTEREST" | "CASH_WITHDRAWAL";

export type TransactionSource = "PDF" | "MANUAL" | "AI" | "RULE" | "SYSTEM";

export interface Transaction {
  id: UUID;
  date: string;
  description: string;
  merchant: string;
  amount: number;
  type: TransactionType;
  categoryId: UUID | null;
  categoryName: string | null;
  accountId: UUID;
  accountName: string;
  source: TransactionSource;
  confidence: number | null;
  statementId: UUID | null;
  statementName: string | null;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TransactionQuery {
  page?: number | undefined;
  size?: number | undefined;
  from?: string | undefined;
  to?: string | undefined;
  accountId?: string | undefined;
  categoryId?: string | undefined;
  type?: TransactionType | "" | undefined;
  source?: TransactionSource | "" | undefined;
  search?: string | undefined;
}

export type CategoryType = "EXPENSE" | "INCOME" | "TRANSFER";

export interface Category {
  id: UUID;
  name: string;
  parentId: UUID | null;
  color: string;
  active: boolean;
  transactionCount: number;
  categoryType: CategoryType;
}

export interface CategorySummary {
  categoryId: UUID;
  categoryName: string;
  color: string;
  amount: number;
  percentageOfExpenses: number;
  percentageOfCredit: number;
}

export interface MonthlyPoint {
  month: string;
  credited: number;
  expenses: number;
  remaining: number;
}

export interface MonthlyDashboard {
  month: string;
  totalCredited: number;
  totalExpenses: number;
  remaining: number;
  spentPercentage: number;
  categories: CategorySummary[];
  trend: MonthlyPoint[];
}

export interface YearlyDashboard {
  year: number;
  totalCredited: number;
  totalExpenses: number;
  remaining: number;
  averageMonthlyExpenses: number;
  categories: CategorySummary[];
  months: MonthlyPoint[];
}

export interface AIReviewTransaction extends Transaction {
  suggestedCategoryId: UUID | null;
  suggestedCategoryName: string | null;
}

export interface ExpenseInput {
  amount: number;
  date: string;
  description: string;
  categoryId: string;
  accountId: string;
}

export interface IncomeInput {
  amount: number;
  date: string;
  description: string;
  categoryId: string;
  accountId: string;
}
