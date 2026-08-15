import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Landmark, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/states";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { AccountModal } from "@/features/accounts/AccountModal";
import { useAccounts, useDeactivateAccount } from "@/hooks/queries";
import { errorMessage } from "@/api/client";
import { maskAccount } from "@/utils/format";
import type { Account } from "@/types";

export const Route = createFileRoute("/_shell/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Expensify" },
      {
        name: "description",
        content: "Manage bank accounts and credit cards linked to Expensify.",
      },
      { property: "og:title", content: "Accounts — Expensify" },
      {
        property: "og:description",
        content: "Manage bank accounts and credit cards linked to Expensify.",
      },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const { data, isPending, isError, error, refetch } = useAccounts();
  const deactivate = useDeactivateAccount();
  const [pending, setPending] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (account: Account) => {
    setEditing(account);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Accounts</h1>
          <p className="text-sm text-muted-foreground">Bank accounts and credit cards</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New account
        </Button>
      </div>

      <AccountModal open={editorOpen} onOpenChange={setEditorOpen} account={editing} />

      {isPending ? (
        <LoadingSkeleton rows={3} />
      ) : isError ? (
        <ErrorState
          message={errorMessage(error, "Unable to load accounts.")}
          onRetry={() => void refetch()}
        />
      ) : data.length === 0 ? (
        <EmptyState title="Add your first bank account or credit card." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((a) => {
            const isCard = a.type === "CREDIT_CARD";
            const Icon = isCard ? CreditCard : Landmark;
            return (
              <article key={a.id} className="surface-card space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-lg ${
                      isCard ? "bg-accent text-accent-foreground" : "bg-primary/12 text-primary"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Badge variant={a.active ? "secondary" : "outline"}>
                    {a.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <h2 className="font-semibold">{a.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {a.institution} · {isCard ? "Credit card" : "Bank account"}
                  </p>
                  <p className="numeric mt-1 text-sm text-muted-foreground">
                    {maskAccount(a.lastFour)} · {a.currency}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                    Edit
                  </Button>
                  {a.active ? (
                    <Button variant="ghost" size="sm" onClick={() => setPending(a.id)}>
                      Deactivate
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmationModal
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="Deactivate this account?"
        description="Existing transactions stay, but new statements can't be uploaded to it."
        confirmLabel="Deactivate"
        destructive
        onConfirm={() => {
          if (!pending) return;
          deactivate.mutate(pending, {
            onSuccess: () => toast.success("Account deactivated"),
            onError: (e) => toast.error(errorMessage(e, "We couldn't update that account.")),
          });
          setPending(null);
        }}
      />
    </div>
  );
}
