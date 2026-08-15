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
import { useAccounts, useCategories, useCreateIncome } from "@/hooks/queries";
import { errorMessage } from "@/api/client";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  description: z.string().trim().min(1, "Description is required").max(140),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
});

type FormValues = z.input<typeof schema>;

export function IncomeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const incomeCategories = categories.filter((c) => c.categoryType === "INCOME");
  const createIncome = useCreateIncome();

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
    createIncome.mutate(values, {
      onSuccess: () => {
        toast.success("Income added");
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => toast.error(errorMessage(error, "We couldn't add that income.")),
    });
  });

  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add income</DialogTitle>
          <DialogDescription>Record money credited outside your statements.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="income-amount">Amount</Label>
              <Input
                id="income-amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                {...form.register("amount")}
              />
              {errors.amount ? (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="income-date">Date</Label>
              <Input id="income-date" type="date" {...form.register("date")} />
              {errors.date ? (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="income-description">Description</Label>
            <Input id="income-description" {...form.register("description")} />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="income-category">Category</Label>
              <CategorySelector
                id="income-category"
                categories={incomeCategories}
                value={form.watch("categoryId")}
                onChange={(v) => form.setValue("categoryId", v, { shouldValidate: true })}
                placeholder="Select category"
              />
              {errors.categoryId ? (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="income-account">Account</Label>
              <Select
                value={form.watch("accountId")}
                onValueChange={(v) => form.setValue("accountId", v, { shouldValidate: true })}
              >
                <SelectTrigger id="income-account">
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
            <Button type="submit" disabled={createIncome.isPending}>
              {createIncome.isPending ? "Saving…" : "Add income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
