import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategorySummary } from "@/types";
import { formatCurrency, formatPercent } from "@/utils/format";

interface Props {
  categories: CategorySummary[];
  totalExpenses: number;
  spentPercentage: number;
  onSelect?: ((categoryId: string) => void) | undefined;
}

export function DonutChart({ categories, totalExpenses, spentPercentage, onSelect }: Props) {
  if (categories.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No categorized expenses for this period.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="amount"
              nameKey="categoryName"
              innerRadius="64%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
              onClick={(entry: unknown) => {
                const item = entry as { payload?: CategorySummary };
                if (item.payload) onSelect?.(item.payload.categoryId);
              }}
            >
              {categories.map((c) => (
                <Cell key={c.categoryId} fill={c.color} className="cursor-pointer outline-none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--popover)",
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="numeric text-2xl font-semibold text-foreground">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPercent(spentPercentage, 0)} of credited amount
            </p>
          </div>
        </div>
      </div>

      <CategoryLegend categories={categories} onSelect={onSelect} />
    </div>
  );
}

export function CategoryLegend({
  categories,
  onSelect,
}: {
  categories: CategorySummary[];
  onSelect?: ((categoryId: string) => void) | undefined;
}) {
  return (
    <ul className="space-y-1.5" aria-label="Expense categories">
      {categories.map((c) => (
        <li key={c.categoryId}>
          <button
            type="button"
            onClick={() => onSelect?.(c.categoryId)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: c.color }}
              aria-hidden="true"
            />
            <span className="flex-1 truncate text-foreground">{c.categoryName}</span>
            <span className="numeric font-medium text-foreground">{formatCurrency(c.amount)}</span>
            <span className="numeric w-14 text-right text-xs text-muted-foreground">
              {formatPercent(c.percentageOfCredit, 1)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
