import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelector } from "@/components/CategorySelector";
import { useAccounts, useCategories, useCreateExpense } from "@/hooks/queries";
import { errorMessage } from "@/api/client";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  description: z.string().trim().min(1, "Description is required").max(140),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
});

type FormValues = z.input<typeof schema>;

export function ExpenseModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createExpense = useCreateExpense();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "" as unknown as number,
      date: new Date().toISOString().slice(0, 10),
      description: "",
      categoryId: "",
      accountId: "",
    },
  });

  const submit = form.handleSubmit((raw) => {
    const values = schema.parse(raw);
    createExpense.mutate(
      {
        amount: values.amount,
        date: values.date,
        description: values.description,
        categoryId: values.categoryId,
        accountId: values.accountId,
      },
      {
        onSuccess: () => {
          toast.success("Expense added");
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => toast.error(errorMessage(error, "We couldn't add that expense.")),
      },
    );
  });

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
          <DialogDescription>Record a spend that isn't on a statement yet.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                aria-invalid={Boolean(errors.amount)}
                {...form.register("amount")}
              />
              {errors.amount ? (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expense-date">Date</Label>
              <Input id="expense-date" type="date" {...form.register("date")} />
              {errors.date ? (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-description">Description</Label>
            <Input id="expense-description" {...form.register("description")} />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="expense-category">Category</Label>
              <CategorySelector
                id="expense-category"
                categories={categories}
                value={form.watch("categoryId")}
                onChange={(v) => form.setValue("categoryId", v, { shouldValidate: true })}
              />
              {errors.categoryId ? (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expense-account">Account</Label>
              <Select
                value={form.watch("accountId")}
                onValueChange={(v) => form.setValue("accountId", v, { shouldValidate: true })}
              >
                <SelectTrigger id="expense-account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((a) => a.active)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.accountId ? (
                <p className="text-xs text-destructive">{errors.accountId.message}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createExpense.isPending}>
              {createExpense.isPending ? "Saving…" : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
