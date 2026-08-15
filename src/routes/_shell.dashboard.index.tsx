import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, PieChart, Upload, Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardCard } from "@/components/DashboardCard";
import { CardsSkeleton, EmptyState, ErrorState, LoadingSkeleton } from "@/components/states";
import { DonutChart } from "@/features/dashboard/DonutChart";
import { CategoryTable } from "@/features/dashboard/CategoryTable";
import { MonthlyTrendChart } from "@/features/dashboard/MonthlyTrendChart";
import { ExpenseModal } from "@/features/transactions/ExpenseModal";
import { IncomeModal } from "@/features/transactions/IncomeModal";
import { useAccounts, useMonthlyDashboard } from "@/hooks/queries";
import { currentMonth, formatCurrency, formatMonthLabel, formatPercent, monthOptions } from "@/utils/format";
import { errorMessage } from "@/api/client";

export const Route = createFileRoute("/_shell/dashboard/")({
  head: () => ({
    meta: [
      { title: "Monthly Dashboard — Expensify" },
      {
        name: "description",
        content:
          "See credited income, expenses, remaining balance and category spending for the month.",
      },
      { property: "og:title", content: "Monthly Dashboard — Expensify" },
      {
        property: "og:description",
        content: "Track monthly income, expenses and category spending in one view.",
      },
    ],
  }),
  component: DashboardPage,
});

const ALL = "__all__";

function DashboardPage() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonth());
  const [accountId, setAccountId] = useState<string>(ALL);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);

  const { data: accounts = [] } = useAccounts();
  const scopedAccount = accountId === ALL ? undefined : accountId;
  const { data, isPending, isError, error, refetch } = useMonthlyDashboard(month, scopedAccount);

  const goToCategory = (categoryId: string) =>
    void navigate({ to: "/transactions", search: { categoryId } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{formatMonthLabel(month)} overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/statements">
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              Upload statement
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setIncomeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add income
          </Button>
          <Button onClick={() => setExpenseOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add expense
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-48" aria-label="Select month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions().map((m) => (
              <SelectItem key={m} value={m}>
                {formatMonthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger className="w-52" aria-label="Select account">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild variant="ghost">
          <Link to="/dashboard/yearly">View yearly</Link>
        </Button>
      </div>

      {isPending ? (
        <>
          <CardsSkeleton />
          <LoadingSkeleton rows={5} />
        </>
      ) : isError ? (
        <ErrorState
          message={errorMessage(error, "Unable to load your dashboard.")}
          onRetry={() => void refetch()}
        />
      ) : data.totalCredited === 0 && data.totalExpenses === 0 ? (
        <EmptyState
          title={`No transactions for ${formatMonthLabel(month)}.`}
          description="Upload your first statement to see your spending."
          action={
            <Button asChild>
              <Link to="/statements">Upload statement</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              label="Credited"
              value={formatCurrency(data.totalCredited)}
              icon={ArrowDownCircle}
              tone="positive"
            />
            <DashboardCard
              label="Expenses"
              value={formatCurrency(data.totalExpenses)}
              icon={ArrowUpCircle}
              tone="negative"
              onClick={() => void navigate({ to: "/transactions", search: { type: "PURCHASE" } })}
            />
            <DashboardCard
              label="Remaining"
              value={formatCurrency(data.remaining)}
              icon={Wallet}
              tone="primary"
              hint={`${formatPercent(100 - data.spentPercentage, 0)} of credited amount left`}
            />
            <DashboardCard
              label="Spent"
              value={formatPercent(data.spentPercentage, 0)}
              icon={PieChart}
              hint="of credited amount"
            />
          </div>

          <section className="surface-card p-5">
            <h2 className="mb-4 text-lg font-semibold">Category expenses</h2>
            <DonutChart
              categories={data.categories}
              totalExpenses={data.totalExpenses}
              spentPercentage={data.spentPercentage}
              onSelect={goToCategory}
            />
          </section>

          <section className="surface-card p-5">
            <h2 className="mb-4 text-lg font-semibold">Category breakdown</h2>
            <CategoryTable categories={data.categories} onSelect={goToCategory} />
          </section>

          <section className="surface-card p-5">
            <h2 className="mb-4 text-lg font-semibold">Trend</h2>
            <MonthlyTrendChart
              data={data.trend}
              description="Credited, expenses and remaining amounts over the last six months."
            />
          </section>
        </>
      )}

      <ExpenseModal open={expenseOpen} onOpenChange={setExpenseOpen} />
      <IncomeModal open={incomeOpen} onOpenChange={setIncomeOpen} />
    </div>
  );
}
