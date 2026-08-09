import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRANSACTION_TYPES } from "@/constants";
import type { Account, Category, TransactionQuery } from "@/types";

const ALL = "__all__";

interface Props {
  value: TransactionQuery;
  onChange: (next: TransactionQuery) => void;
  accounts: Account[];
  categories: Category[];
}

export function TransactionFilters({ value, onChange, accounts, categories }: Props) {
  const set = (patch: Partial<TransactionQuery>) => onChange({ ...value, ...patch, page: 0 });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
        <Label htmlFor="tx-search">Search</Label>
        <Input
          id="tx-search"
          type="search"
          placeholder="Merchant or description"
          value={value.search ?? ""}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-from">From</Label>
        <Input
          id="tx-from"
          type="date"
          value={value.from ?? ""}
          onChange={(e) => set({ from: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-to">To</Label>
        <Input
          id="tx-to"
          type="date"
          value={value.to ?? ""}
          onChange={(e) => set({ to: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-account">Account</Label>
        <Select
          value={value.accountId || ALL}
          onValueChange={(v) => set({ accountId: v === ALL ? "" : v })}
        >
          <SelectTrigger id="tx-account">
            <SelectValue placeholder="All accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-category">Category</Label>
        <Select
          value={value.categoryId || ALL}
          onValueChange={(v) => set({ categoryId: v === ALL ? "" : v })}
        >
          <SelectTrigger id="tx-category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories
              .filter((c) => c.active)
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-type">Type</Label>
        <Select
          value={value.type || ALL}
          onValueChange={(v) => set({ type: v === ALL ? "" : (v as TransactionQuery["type"]) })}
        >
          <SelectTrigger id="tx-type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {TRANSACTION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-source">Source</Label>
        <Select
          value={value.source || ALL}
          onValueChange={(v) =>
            set({ source: v === ALL ? "" : (v as TransactionQuery["source"]) })
          }
        >
          <SelectTrigger id="tx-source">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All sources</SelectItem>
            <SelectItem value="STATEMENT">Statement</SelectItem>
            <SelectItem value="MANUAL">Manual</SelectItem>
            <SelectItem value="RECURRING">Recurring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button variant="ghost" onClick={() => onChange({ page: 0, size: value.size ?? 15 })}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
