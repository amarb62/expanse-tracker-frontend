import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryModal } from "@/features/categories/CategoryModal";
import { DeleteCategoryDialog } from "@/features/categories/DeleteCategoryDialog";
import { useCategories } from "@/hooks/queries";
import type { Category } from "@/types";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (category: Category) => {
    setEditing(category);
    setModalOpen(true);
  };
  const categories = (data ?? []).filter((c) => c.active);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Categories with transactions need a replacement before they can be deactivated.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New category
        </Button>
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={data ?? []}
        category={editing}
      />
      <DeleteCategoryDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        categories={data ?? []}
        category={deleting}
      />


      {isPending ? (
        <LoadingSkeleton rows={5} />
      ) : isError ? (
        <ErrorState
          message={errorMessage(error, "Unable to load categories.")}
          onRetry={() => void refetch()}
        />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories
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
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">{root.transactionCount} txns</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${root.name}`}
                      onClick={() => openEdit(root)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${root.name}`}
                      onClick={() => setDeleting(root)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 border-l border-border pl-4 text-sm">
                  {categories
                    .filter((c) => c.parentId === root.id)
                    .map((child) => (
                      <li
                        key={child.id}
                        className="flex items-center justify-between text-muted-foreground"
                      >
                        <span>{child.name}</span>
                        <span className="flex items-center gap-1">
                          <span className="numeric text-xs">{child.transactionCount}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label={`Edit ${child.name}`}
                            onClick={() => openEdit(child)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label={`Delete ${child.name}`}
                            onClick={() => setDeleting(child)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </span>
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
