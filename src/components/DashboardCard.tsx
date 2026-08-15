import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "negative" | "primary";
  onClick?: (() => void) | undefined;
}

const toneClasses: Record<NonNullable<DashboardCardProps["tone"]>, string> = {
  neutral: "bg-muted text-muted-foreground",
  positive: "bg-positive/12 text-positive",
  negative: "bg-negative/12 text-negative",
  primary: "bg-primary/12 text-primary",
};

export function DashboardCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  onClick,
}: DashboardCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      {...(onClick ? { onClick, type: "button" as const } : {})}
      className={cn(
        "surface-card flex items-start gap-4 p-5 text-left",
        onClick &&
          "transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span
        className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", toneClasses[tone])}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-muted-foreground">{label}</span>
        <span className="numeric block truncate text-2xl font-semibold text-foreground">
          {value}
        </span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </Comp>
  );
}
