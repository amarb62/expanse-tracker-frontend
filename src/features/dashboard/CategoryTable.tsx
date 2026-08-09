import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CategorySummary } from "@/types";
import { formatCurrency, formatPercent } from "@/utils/format";

export function CategoryTable({
  categories,
  onSelect,
}: {
  categories: CategorySummary[];
  onSelect?: ((categoryId: string) => void) | undefined;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <caption className="sr-only">Category spending breakdown</caption>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">% of expenses</TableHead>
            <TableHead className="text-right">% of credited</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow
              key={c.categoryId}
              className="cursor-pointer"
              onClick={() => onSelect?.(c.categoryId)}
            >
              <TableCell className="font-medium">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  {c.categoryName}
                </span>
              </TableCell>
              <TableCell className="numeric text-right">{formatCurrency(c.amount)}</TableCell>
              <TableCell className="numeric text-right text-muted-foreground">
                {formatPercent(c.percentageOfExpenses)}
              </TableCell>
              <TableCell className="numeric text-right text-muted-foreground">
                {formatPercent(c.percentageOfCredit)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
