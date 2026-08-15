import { USE_MOCK_API, apiClient } from "./client";
import { categoryApi } from "./categoryApi";
import { mockTransactions, monthKey, summarize, trendFor } from "./mock/data";
import type { CategorySummary, MonthlyDashboard, MonthlyPoint, YearlyDashboard } from "@/types";

interface BackendCategoryBreakdown {
  category: string;
  amount: number;
  percentageOfExpenses: number;
  percentageOfCredit: number;
}

interface BackendMonthlyDashboard {
  period: string;
  totalCredited: number;
  totalExpenses: number;
  remaining: number;
  expensePercentage: number;
  categories: BackendCategoryBreakdown[];
}

interface BackendMonthlyBreakdownItem {
  month: number;
  totalCredited: number;
  totalExpenses: number;
  remaining: number;
  expensePercentage: number;
}

interface BackendYearlyDashboard {
  year: number;
  totalCredited: number;
  totalExpenses: number;
  remaining: number;
  expensePercentage: number;
  categories: BackendCategoryBreakdown[];
  months: BackendMonthlyBreakdownItem[];
}

interface BackendTrendPoint {
  period: string;
  totalCredited: number;
  totalExpenses: number;
}

interface NameColorLookup {
  idByName: Map<string, string>;
  colorByName: Map<string, string>;
}

async function buildCategoryLookup(): Promise<NameColorLookup> {
  const categories = await categoryApi.list();
  const idByName = new Map<string, string>();
  const colorByName = new Map<string, string>();
  for (const c of categories) {
    idByName.set(c.name, c.id);
    colorByName.set(c.name, c.color);
  }
  return { idByName, colorByName };
}

function mapCategoryBreakdown(
  items: BackendCategoryBreakdown[],
  lookup: NameColorLookup,
): CategorySummary[] {
  return items.map((c) => ({
    categoryId: lookup.idByName.get(c.category) ?? c.category,
    categoryName: c.category,
    color: lookup.colorByName.get(c.category) ?? "#64748b",
    amount: c.amount,
    percentageOfExpenses: c.percentageOfExpenses,
    percentageOfCredit: c.percentageOfCredit,
  }));
}

async function fetchTrend(): Promise<BackendTrendPoint[]> {
  const { data } = await apiClient.get<{ trends: BackendTrendPoint[] }>("/dashboard/trends");
  return data.trends;
}

function toMonthlyPoint(t: BackendTrendPoint): MonthlyPoint {
  return {
    month: t.period,
    credited: t.totalCredited,
    expenses: t.totalExpenses,
    remaining: t.totalCredited - t.totalExpenses,
  };
}

function monthsOfYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
}

function lastMonths(month: string, count: number): string[] {
  const parts = month.split("-").map(Number);
  const year = parts[0] ?? new Date().getFullYear();
  const m = (parts[1] ?? 1) - 1;
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(year, m - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export const dashboardApi = {
  async monthly(month: string, accountId?: string): Promise<MonthlyDashboard> {
    if (USE_MOCK_API) {
      const scoped = mockTransactions.filter(
        (t) => monthKey(t.date) === month && (!accountId || t.accountId === accountId),
      );
      const { credited, expenses, categories } = summarize(scoped);
      const trend: MonthlyPoint[] = trendFor(lastMonths(month, 6));
      return {
        month,
        totalCredited: credited,
        totalExpenses: expenses,
        remaining: credited - expenses,
        spentPercentage: credited > 0 ? (expenses / credited) * 100 : 0,
        categories,
        trend,
      };
    }
    const [year, monthNum] = month.split("-").map(Number);
    const [{ data }, lookup, trend] = await Promise.all([
      apiClient.get<BackendMonthlyDashboard>("/dashboard/monthly", {
        params: { year, month: monthNum, accountId },
      }),
      buildCategoryLookup(),
      fetchTrend(),
    ]);
    const trailing = new Set(lastMonths(month, 6));
    const trendPoints = trend
      .filter((t) => trailing.has(t.period))
      .map(toMonthlyPoint)
      .sort((a, b) => a.month.localeCompare(b.month));
    return {
      month,
      totalCredited: data.totalCredited,
      totalExpenses: data.totalExpenses,
      remaining: data.remaining,
      spentPercentage: data.expensePercentage,
      categories: mapCategoryBreakdown(data.categories, lookup),
      trend: trendPoints,
    };
  },

  async yearly(year: number, accountId?: string): Promise<YearlyDashboard> {
    if (USE_MOCK_API) {
      const scoped = mockTransactions.filter(
        (t) => new Date(t.date).getFullYear() === year && (!accountId || t.accountId === accountId),
      );
      const { credited, expenses, categories } = summarize(scoped);
      const months = trendFor(monthsOfYear(year));
      const active = months.filter((m) => m.expenses > 0).length || 1;
      return {
        year,
        totalCredited: credited,
        totalExpenses: expenses,
        remaining: credited - expenses,
        averageMonthlyExpenses: expenses / active,
        categories,
        months,
      };
    }
    const [{ data }, lookup] = await Promise.all([
      apiClient.get<BackendYearlyDashboard>("/dashboard/yearly", { params: { year, accountId } }),
      buildCategoryLookup(),
    ]);
    const months: MonthlyPoint[] = data.months.map((m) => ({
      month: `${data.year}-${String(m.month).padStart(2, "0")}`,
      credited: m.totalCredited,
      expenses: m.totalExpenses,
      remaining: m.remaining,
    }));
    const activeMonths = months.filter((m) => m.expenses > 0).length || 1;
    return {
      year: data.year,
      totalCredited: data.totalCredited,
      totalExpenses: data.totalExpenses,
      remaining: data.remaining,
      averageMonthlyExpenses: data.totalExpenses / activeMonths,
      categories: mapCategoryBreakdown(data.categories, lookup),
      months,
    };
  },
};
