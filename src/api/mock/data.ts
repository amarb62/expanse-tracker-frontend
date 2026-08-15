/**
 * DEMO DATASET ONLY.
 *
 * This module is the single place where non-API financial data lives. It is
 * used when `VITE_API_BASE_URL` is not configured so the UI can be developed
 * and demoed without the Spring Boot backend. No production component may
 * import from here directly — always go through `src/api/*Api.ts`.
 */
import type {
  Account,
  Category,
  CategorySummary,
  MonthlyPoint,
  Statement,
  Transaction,
  TransactionType,
  User,
} from "@/types";

export const mockUser: User = {
  id: "u-1",
  name: "Aarav Sharma",
  email: "aarav@example.com",
  currency: "INR",
};

export const mockAccounts: Account[] = [
  {
    id: "a-1",
    name: "HDFC Salary Account",
    type: "BANK_ACCOUNT",
    institution: "HDFC Bank",
    lastFour: "4412",
    currency: "INR",
    active: true,
  },
  {
    id: "a-2",
    name: "HDFC Credit Card",
    type: "CREDIT_CARD",
    institution: "HDFC Bank",
    lastFour: "9081",
    currency: "INR",
    active: true,
  },
  {
    id: "a-3",
    name: "ICICI Credit Card",
    type: "CREDIT_CARD",
    institution: "ICICI Bank",
    lastFour: "2276",
    currency: "INR",
    active: false,
  },
];

interface SeedCategory {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
}

const seedCategories: SeedCategory[] = [
  { id: "c-food", name: "Food", parentId: null, color: "var(--chart-1)" },
  { id: "c-food-rest", name: "Restaurants", parentId: "c-food", color: "var(--chart-1)" },
  { id: "c-food-delivery", name: "Food Delivery", parentId: "c-food", color: "var(--chart-1)" },
  { id: "c-food-cafe", name: "Cafes", parentId: "c-food", color: "var(--chart-1)" },
  { id: "c-shopping", name: "Shopping", parentId: null, color: "var(--chart-2)" },
  { id: "c-shop-elec", name: "Electronics", parentId: "c-shopping", color: "var(--chart-2)" },
  { id: "c-shop-cloth", name: "Clothing", parentId: "c-shopping", color: "var(--chart-2)" },
  { id: "c-shop-online", name: "Online Shopping", parentId: "c-shopping", color: "var(--chart-2)" },
  { id: "c-rent", name: "Rent", parentId: null, color: "var(--chart-3)" },
  { id: "c-travel", name: "Travel", parentId: null, color: "var(--chart-4)" },
  { id: "c-utilities", name: "Utilities", parentId: null, color: "var(--chart-5)" },
  { id: "c-other", name: "Other", parentId: null, color: "var(--chart-6)" },
];

export const mockCategories: Category[] = seedCategories.map((c) => ({
  ...c,
  active: true,
  transactionCount: c.parentId === null ? 12 : 4,
  categoryType: "EXPENSE",
}));

const merchants: Array<{
  merchant: string;
  description: string;
  categoryId: string;
  type: TransactionType;
  min: number;
  max: number;
}> = [
  {
    merchant: "Swiggy",
    description: "SWIGGY*ORDER BLR",
    categoryId: "c-food-delivery",
    type: "DEBIT",
    min: 250,
    max: 1200,
  },
  {
    merchant: "Zomato",
    description: "ZOMATO ONLINE ORDER",
    categoryId: "c-food-delivery",
    type: "DEBIT",
    min: 200,
    max: 1400,
  },
  {
    merchant: "Third Wave Coffee",
    description: "POS THIRD WAVE COFFEE",
    categoryId: "c-food-cafe",
    type: "DEBIT",
    min: 180,
    max: 700,
  },
  {
    merchant: "Amazon",
    description: "AMAZON.IN RETAIL",
    categoryId: "c-shop-online",
    type: "DEBIT",
    min: 400,
    max: 9000,
  },
  {
    merchant: "Croma",
    description: "CROMA ELECTRONICS",
    categoryId: "c-shop-elec",
    type: "DEBIT",
    min: 1500,
    max: 22000,
  },
  {
    merchant: "Landlord Transfer",
    description: "NEFT RENT PAYMENT",
    categoryId: "c-rent",
    type: "DEBIT",
    min: 20000,
    max: 20000,
  },
  {
    merchant: "IndiGo",
    description: "INDIGO AIR TICKET",
    categoryId: "c-travel",
    type: "DEBIT",
    min: 2500,
    max: 12000,
  },
  {
    merchant: "Uber",
    description: "UBER INDIA TRIP",
    categoryId: "c-travel",
    type: "DEBIT",
    min: 120,
    max: 900,
  },
  {
    merchant: "BESCOM",
    description: "ELECTRICITY BILL",
    categoryId: "c-utilities",
    type: "DEBIT",
    min: 900,
    max: 3200,
  },
  {
    merchant: "Airtel",
    description: "AIRTEL BROADBAND",
    categoryId: "c-utilities",
    type: "DEBIT",
    min: 799,
    max: 1499,
  },
  {
    merchant: "XYZ Services",
    description: "XYZ SERVICES PVT LTD",
    categoryId: "c-other",
    type: "DEBIT",
    min: 400,
    max: 1800,
  },
  {
    merchant: "Card Payment",
    description: "CREDIT CARD PAYMENT RECEIVED",
    categoryId: "c-other",
    type: "PAYMENT",
    min: 5000,
    max: 25000,
  },
  {
    merchant: "Amazon",
    description: "AMAZON REFUND",
    categoryId: "c-shop-online",
    type: "REFUND",
    min: 300,
    max: 2500,
  },
  {
    merchant: "HDFC Bank",
    description: "LATE PAYMENT FEE",
    categoryId: "c-other",
    type: "FEE",
    min: 200,
    max: 600,
  },
  {
    merchant: "HDFC Bank",
    description: "FINANCE CHARGES",
    categoryId: "c-other",
    type: "INTEREST",
    min: 150,
    max: 900,
  },
];

// Deterministic pseudo-random generator so the demo dataset is stable.
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function categoryName(id: string): string {
  return seedCategories.find((c) => c.id === id)?.name ?? "Other";
}

function buildTransactions(): Transaction[] {
  const random = rng(20260809);
  const out: Transaction[] = [];
  const now = new Date();
  let n = 0;

  for (let monthBack = 0; monthBack < 13; monthBack += 1) {
    const base = new Date(now.getFullYear(), now.getMonth() - monthBack, 1);
    const year = base.getFullYear();
    const month = base.getMonth();

    out.push({
      id: `t-inc-${year}-${month}`,
      date: new Date(year, month, 1).toISOString(),
      description: "SALARY CREDIT",
      merchant: "Acme Technologies",
      amount: 100000,
      type: "CREDIT",
      categoryId: null,
      categoryName: null,
      accountId: "a-1",
      accountName: "HDFC Salary Account",
      source: "PDF",
      confidence: 0.99,
      statementId: "s-1",
      statementName: "HDFC-Salary-Statement.pdf",
    });

    const count = 22 + Math.floor(random() * 10);
    for (let i = 0; i < count; i += 1) {
      const spec = merchants[Math.floor(random() * merchants.length)]!;
      const day = 1 + Math.floor(random() * 27);
      const amount = Math.round(spec.min + random() * (spec.max - spec.min));
      const confidence = Math.round((0.5 + random() * 0.5) * 100) / 100;
      const isCard = spec.type !== "CREDIT" && random() > 0.45;
      n += 1;
      out.push({
        id: `t-${n}`,
        date: new Date(year, month, day).toISOString(),
        description: spec.description,
        merchant: spec.merchant,
        amount,
        type: spec.type,
        categoryId: spec.categoryId,
        categoryName: categoryName(spec.categoryId),
        accountId: isCard ? "a-2" : "a-1",
        accountName: isCard ? "HDFC Credit Card" : "HDFC Salary Account",
        source: random() > 0.9 ? "MANUAL" : "PDF",
        confidence: random() > 0.9 ? null : confidence,
        statementId: "s-1",
        statementName: "HDFC-Salary-Statement.pdf",
      });
    }
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const mockTransactions: Transaction[] = buildTransactions();

export const mockStatements: Statement[] = [
  {
    id: "s-1",
    fileName: "HDFC-Salary-Statement-Jul-2026.pdf",
    accountId: "a-1",
    accountName: "HDFC Salary Account",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    uploadedAt: "2026-08-02T09:12:00.000Z",
    status: "PROCESSED",
    transactionCount: 124,
    categorizedCount: 117,
    needsReviewCount: 7,
  },
  {
    id: "s-2",
    fileName: "HDFC-Credit-Card-Jul-2026.pdf",
    accountId: "a-2",
    accountName: "HDFC Credit Card",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    uploadedAt: "2026-08-03T18:40:00.000Z",
    status: "PROCESSING",
    transactionCount: 0,
    categorizedCount: 0,
    needsReviewCount: 0,
  },
  {
    id: "s-3",
    fileName: "ICICI-Credit-Card-Jun-2026.pdf",
    accountId: "a-3",
    accountName: "ICICI Credit Card",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-30",
    uploadedAt: "2026-07-05T11:05:00.000Z",
    status: "FAILED",
    transactionCount: 0,
    categorizedCount: 0,
    needsReviewCount: 0,
    errorMessage: "The PDF appears to be password protected.",
  },
];

export function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function isExpense(t: Transaction): boolean {
  return t.type === "DEBIT" || t.type === "FEE" || t.type === "INTEREST";
}

export function isCredit(t: Transaction): boolean {
  return t.type === "CREDIT" || t.type === "REFUND";
}

export function summarize(transactions: Transaction[]): {
  credited: number;
  expenses: number;
  categories: CategorySummary[];
} {
  const credited = transactions.filter(isCredit).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(isExpense).reduce((s, t) => s + t.amount, 0);

  const byRoot = new Map<string, number>();
  for (const t of transactions.filter(isExpense)) {
    const cat = seedCategories.find((c) => c.id === t.categoryId);
    const rootId = cat?.parentId ?? cat?.id ?? "c-other";
    byRoot.set(rootId, (byRoot.get(rootId) ?? 0) + t.amount);
  }

  const categories: CategorySummary[] = [...byRoot.entries()]
    .map(([categoryId, amount]) => {
      const cat = seedCategories.find((c) => c.id === categoryId);
      return {
        categoryId,
        categoryName: cat?.name ?? "Other",
        color: cat?.color ?? "var(--chart-6)",
        amount,
        percentageOfExpenses: expenses > 0 ? (amount / expenses) * 100 : 0,
        percentageOfCredit: credited > 0 ? (amount / credited) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return { credited, expenses, categories };
}

export function trendFor(months: string[]): MonthlyPoint[] {
  return months.map((month) => {
    const inMonth = mockTransactions.filter((t) => monthKey(t.date) === month);
    const { credited, expenses } = summarize(inMonth);
    return { month, credited, expenses, remaining: credited - expenses };
  });
}
