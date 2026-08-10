import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveCategory } from "@/hooks/queries";
import { errorMessage } from "@/api/client";
import type { Category } from "@/types";

const COLORS = ["#0f766e", "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#65a30d", "#0891b2"];
const NONE = "__none__";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  /** When provided the dialog edits this category instead of creating a new one. */
  category?: Category | null;
}

export function CategoryModal({ open, onOpenChange, categories, category }: Props) {
  const save = useSaveCategory();
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>(NONE);
  const [color, setColor] = useState<string>(COLORS[0]!);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setParentId(category?.parentId ?? NONE);
    setColor(category?.color ?? COLORS[0]!);
  }, [open, category]);

  const roots = categories.filter(
    (c) => c.parentId === null && c.active && c.id !== category?.id,
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a category name.");
      return;
    }
    if (trimmed.length > 50) {
      toast.error("Category name must be 50 characters or less.");
      return;
    }
    save.mutate(
      {
        ...(category ? { id: category.id } : {}),
        input: { name: trimmed, parentId: parentId === NONE ? null : parentId, color },
      },
      {
        onSuccess: () => {
          toast.success(isEdit ? "Category updated" : "Category created");
          onOpenChange(false);
        },
        onError: (error) =>
          toast.error(
            errorMessage(
              error,
              isEdit ? "We couldn't update this category." : "We couldn't create this category.",
            ),
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Rename this category, move it under a different parent, or change its color."
              : "Add a top-level category or nest one under an existing parent."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              maxLength={50}
              onChange={(e) => setName(e.target.value)}
              placeholder="Groceries"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-parent">Parent category</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="category-parent">
                <SelectValue placeholder="None (top level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None (top level)</SelectItem>
                {roots.map((root) => (
                  <SelectItem key={root.id} value={root.id}>
                    {root.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Select color ${c}`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    color === c ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : isEdit ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
