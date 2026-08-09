import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  value: string | undefined;
  onChange: (categoryId: string) => void;
  placeholder?: string | undefined;
  id?: string | undefined;
  disabled?: boolean | undefined;
}

export function CategorySelector({
  categories,
  value,
  onChange,
  placeholder = "Select category",
  id,
  disabled,
}: Props) {
  const roots = categories.filter((c) => c.parentId === null && c.active);

  return (
    <Select value={value ?? ""} onValueChange={onChange} disabled={disabled ?? false}>
      <SelectTrigger id={id} aria-label="Category">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {roots.map((root) => {
          const children = categories.filter((c) => c.parentId === root.id && c.active);
          return (
            <SelectGroup key={root.id}>
              <SelectLabel>{root.name}</SelectLabel>
              <SelectItem value={root.id}>{root.name}</SelectItem>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}
