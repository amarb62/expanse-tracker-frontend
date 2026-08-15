import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatementStatusBadge } from "@/components/badges";
import { ErrorState, LoadingSkeleton } from "@/components/states";
import { useStatement } from "@/hooks/queries";
import { errorMessage } from "@/api/client";
import { formatDate } from "@/utils/format";

export const Route = createFileRoute("/_shell/statements/$id")({
  head: () => ({
    meta: [
      { title: "Statement details — Expensify" },
      { name: "description", content: "Processing status and import results for a statement." },
      { property: "og:title", content: "Statement details — Expensify" },
      {
        property: "og:description",
        content: "Processing status and import results for a statement.",
      },
    ],
  }),
  component: StatementDetailPage,
});

const STEPS = ["Uploaded", "Processing PDF", "Extracting transactions", "Completed"];

function StatementDetailPage() {
  const { id } = Route.useParams();
  const { data, isPending, isError, error, refetch } = useStatement(id);

  if (isPending) return <LoadingSkeleton rows={6} />;
  if (isError) {
    return (
      <ErrorState
        message={errorMessage(error, "Unable to load this statement.")}
        onRetry={() => void refetch()}
      />
    );
  }

  const stepIndex =
    data.status === "PROCESSED" ? 3 : data.status === "PROCESSING" ? 2 : data.status === "FAILED" ? 1 : 0;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/statements">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to statements
        </Link>
      </Button>

      <div className="surface-card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{data.fileName}</h1>
            <p className="text-sm text-muted-foreground">
              {data.accountName || "Account"} · {formatDate(data.periodStart)} –{" "}
              {formatDate(data.periodEnd)}
            </p>
          </div>
          <StatementStatusBadge status={data.status} />
        </div>

        {data.status === "FAILED" ? (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {data.errorMessage ?? "We couldn't process this statement."}
          </p>
        ) : (
          <>
            <Progress value={((stepIndex + 1) / STEPS.length) * 100} aria-label="Processing progress" />
            <ol className="grid gap-2 text-sm sm:grid-cols-4">
              {STEPS.map((step, i) => (
                <li
                  key={step}
                  className={i <= stepIndex ? "font-medium text-foreground" : "text-muted-foreground"}
                >
                  {step}
                </li>
              ))}
            </ol>
          </>
        )}

        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">Transactions found</dt>
            <dd className="numeric text-xl font-semibold">{data.transactionCount}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Categorized</dt>
            <dd className="numeric text-xl font-semibold">{data.categorizedCount}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Need review</dt>
            <dd className="numeric text-xl font-semibold">{data.needsReviewCount}</dd>
          </div>
        </dl>

        {data.needsReviewCount > 0 ? (
          <Button asChild variant="outline">
            <Link to="/ai-review">Review low-confidence categories</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
