import { USE_MOCK_API, apiClient } from "./client";
import { mockTransactions, monthKey, summarize, trendFor } from "./mock/data";
import type { MonthlyDashboard, MonthlyPoint, YearlyDashboard } from "@/types";

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
    const { data } = await apiClient.get<MonthlyDashboard>("/dashboard/monthly", {
      params: { month, accountId },
    });
    return data;
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
    const { data } = await apiClient.get<YearlyDashboard>("/dashboard/yearly", {
      params: { year, accountId },
    });
    return data;
  },
};
