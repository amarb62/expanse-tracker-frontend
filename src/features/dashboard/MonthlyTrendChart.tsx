import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyPoint } from "@/types";
import { formatCurrency, formatMonthLabel } from "@/utils/format";

interface Props {
  data: MonthlyPoint[];
  variant?: "line" | "bar";
  description?: string;
}

const axisStyle = { fill: "var(--muted-foreground)", fontSize: 12 };

export function MonthlyTrendChart({ data, variant = "line", description }: Props) {
  const shaped = data.map((d) => ({ ...d, label: formatMonthLabel(d.month).slice(0, 3) }));

  const shared = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
      <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
      <YAxis
        tick={axisStyle}
        tickLine={false}
        axisLine={false}
        width={64}
        tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
      />
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
      <Legend wrapperStyle={{ fontSize: 12 }} />
    </>
  );

  return (
    <figure className="m-0">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {variant === "line" ? (
            <LineChart data={shaped}>
              {shared}
              <Line
                type="monotone"
                dataKey="credited"
                name="Credited"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="var(--chart-5)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="remaining"
                name="Remaining"
                stroke="var(--chart-1)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          ) : (
            <BarChart data={shaped}>
              {shared}
              <Bar dataKey="credited" name="Credited" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      {description ? (
        <figcaption className="mt-2 text-xs text-muted-foreground">{description}</figcaption>
      ) : null}
    </figure>
  );
}
