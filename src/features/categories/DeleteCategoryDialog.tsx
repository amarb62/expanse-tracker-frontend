import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useDeactivateCategory } from "@/hooks/queries";
import { errorMessage } from "@/api/client";
import type { Category } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  category: Category | null;
}

export function DeleteCategoryDialog({ open, onOpenChange, categories, category }: Props) {
  const remove = useDeactivateCategory();
  const [replacementId, setReplacementId] = useState<string>("");

  useEffect(() => {
    if (open) setReplacementId("");
  }, [open]);

  const needsReplacement = (category?.transactionCount ?? 0) > 0;
  const options = categories.filter((c) => c.active && c.id !== category?.id);

  const confirm = () => {
    if (!category) return;
    if (needsReplacement && !replacementId) {
      toast.error("Choose a replacement category first.");
      return;
    }
    remove.mutate(
      {
        id: category.id,
        ...(replacementId ? { replacementCategoryId: replacementId } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Category deleted");
          onOpenChange(false);
        },
        onError: (error) => toast.error(errorMessage(error, "We couldn't delete this category.")),
      },
    );
  };

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${category?.name ?? "category"}?`}
      description={
        needsReplacement
          ? "This category has transactions. Pick a replacement category to move them to."
          : "This category will be removed from your list. Existing reports are unaffected."
      }
      confirmLabel={remove.isPending ? "Deleting…" : "Delete"}
      destructive
      onConfirm={confirm}
    >
      {needsReplacement ? (
        <div className="space-y-1.5">
          <Label htmlFor="replacement-category">Replacement category</Label>
          <Select value={replacementId} onValueChange={setReplacementId}>
            <SelectTrigger id="replacement-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {options.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </ConfirmationModal>
  );
}
