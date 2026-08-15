import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, CalendarRange, Wallet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardCard } from "@/components/DashboardCard";
import { CardsSkeleton, ErrorState, LoadingSkeleton } from "@/components/states";
import { DonutChart } from "@/features/dashboard/DonutChart";
import { MonthlyTrendChart } from "@/features/dashboard/MonthlyTrendChart";
import { useYearlyDashboard } from "@/hooks/queries";
import { formatCurrency } from "@/utils/format";
import { errorMessage } from "@/api/client";

export const Route = createFileRoute("/_shell/dashboard/yearly")({
  head: () => ({
    meta: [
      { title: "Yearly Dashboard — Expensify" },
      {
        name: "description",
        content: "Compare credited income and expenses month by month across the whole year.",
      },
      { property: "og:title", content: "Yearly Dashboard — Expensify" },
      {
        property: "og:description",
        content: "Yearly totals, averages and month-by-month spending comparison.",
      },
    ],
  }),
  component: YearlyPage,
});

function YearlyPage() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const { data, isPending, isError, error, refetch } = useYearlyDashboard(year);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Yearly dashboard</h1>
          <p className="text-sm text-muted-foreground">Long-term view of income and spending</p>
        </div>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-32" aria-label="Select year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[thisYear, thisYear - 1, thisYear - 2].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <>
          <CardsSkeleton />
          <LoadingSkeleton rows={4} />
        </>
      ) : isError ? (
        <ErrorState
          message={errorMessage(error, "Unable to load the yearly dashboard.")}
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              label="Total credited"
              value={formatCurrency(data.totalCredited)}
              icon={ArrowDownCircle}
              tone="positive"
            />
            <DashboardCard
              label="Total expenses"
              value={formatCurrency(data.totalExpenses)}
              icon={ArrowUpCircle}
              tone="negative"
            />
            <DashboardCard
              label="Remaining"
              value={formatCurrency(data.remaining)}
              icon={Wallet}
              tone="primary"
            />
            <DashboardCard
              label="Avg monthly expenses"
              value={formatCurrency(data.averageMonthlyExpenses)}
              icon={CalendarRange}
            />
          </div>

          <section className="surface-card p-5">
            <h2 className="mb-4 text-lg font-semibold">Expenses vs credited by month</h2>
            <MonthlyTrendChart
              data={data.months}
              variant="bar"
              description={`Monthly comparison of credited and spent amounts in ${year}.`}
            />
          </section>

          <section className="surface-card p-5">
            <h2 className="mb-4 text-lg font-semibold">Category distribution</h2>
            <DonutChart
              categories={data.categories}
              totalExpenses={data.totalExpenses}
              spentPercentage={
                data.totalCredited > 0 ? (data.totalExpenses / data.totalCredited) * 100 : 0
              }
            />
          </section>

          <section className="surface-card p-5">
            <h2 className="mb-4 text-lg font-semibold">Monthly trend</h2>
            <MonthlyTrendChart data={data.months} description="Credited, expenses and remaining." />
          </section>
        </>
      )}
    </div>
  );
}
