import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryModal } from "@/features/categories/CategoryModal";
import { useCategories } from "@/hooks/queries";
import { errorMessage } from "@/api/client";

export const Route = createFileRoute("/_shell/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Ledgerly" },
      { name: "description", content: "Manage the category hierarchy used to classify spending." },
      { property: "og:title", content: "Categories — Ledgerly" },
      {
        property: "og:description",
        content: "Manage the category hierarchy used to classify spending.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isPending, isError, error, refetch } = useCategories();
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Categories with transactions need a replacement before they can be deactivated.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          New category
        </Button>
      </div>

      <CategoryModal open={creating} onOpenChange={setCreating} categories={data ?? []} />


      {isPending ? (
        <LoadingSkeleton rows={5} />
      ) : isError ? (
        <ErrorState
          message={errorMessage(error, "Unable to load categories.")}
          onRetry={() => void refetch()}
        />
      ) : data.length === 0 ? (
        <EmptyState title="No categories yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data
            .filter((c) => c.parentId === null)
            .map((root) => (
              <section key={root.id} className="surface-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: root.color }}
                      aria-hidden="true"
                    />
                    {root.name}
                  </h2>
                  <Badge variant="secondary">{root.transactionCount} txns</Badge>
                </div>
                <ul className="mt-3 space-y-1 border-l border-border pl-4 text-sm">
                  {data
                    .filter((c) => c.parentId === root.id)
                    .map((child) => (
                      <li
                        key={child.id}
                        className="flex items-center justify-between text-muted-foreground"
                      >
                        <span>{child.name}</span>
                        <span className="numeric text-xs">{child.transactionCount}</span>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
