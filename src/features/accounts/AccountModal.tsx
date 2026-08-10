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
import { Switch } from "@/components/ui/switch";
import { useSaveAccount } from "@/hooks/queries";
import { errorMessage } from "@/api/client";
import type { Account, AccountType } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
}

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

export function AccountModal({ open, onOpenChange, account }: Props) {
  const save = useSaveAccount();
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState<AccountType>("BANK_ACCOUNT");
  const [lastFour, setLastFour] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setName(account?.name ?? "");
    setInstitution(account?.institution ?? "");
    setType(account?.type ?? "BANK_ACCOUNT");
    setLastFour(account?.lastFour ?? "");
    setCurrency(account?.currency ?? "INR");
    setActive(account?.active ?? true);
  }, [open, account]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedInstitution = institution.trim();
    if (!trimmedName || trimmedName.length > 60) {
      toast.error("Enter an account name (max 60 characters).");
      return;
    }
    if (!trimmedInstitution || trimmedInstitution.length > 60) {
      toast.error("Enter an institution name (max 60 characters).");
      return;
    }
    if (!/^\d{4}$/.test(lastFour)) {
      toast.error("Last four digits must be exactly 4 numbers.");
      return;
    }

    save.mutate(
      {
        ...(account ? { id: account.id } : {}),
        input: {
          name: trimmedName,
          institution: trimmedInstitution,
          type,
          lastFour,
          currency,
          active,
        },
      },
      {
        onSuccess: () => {
          toast.success(account ? "Account updated" : "Account created");
          onOpenChange(false);
        },
        onError: (error) => toast.error(errorMessage(error, "We couldn't save this account.")),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? "Edit account" : "New account"}</DialogTitle>
          <DialogDescription>
            Bank accounts and credit cards you upload statements for.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder="Everyday checking"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-institution">Institution</Label>
            <Input
              id="account-institution"
              value={institution}
              maxLength={60}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="HDFC Bank"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="account-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                <SelectTrigger id="account-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_ACCOUNT">Bank account</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="account-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account-last-four">Last four digits</Label>
            <Input
              id="account-last-four"
              value={lastFour}
              inputMode="numeric"
              maxLength={4}
              onChange={(e) => setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="4821"
            />
          </div>

          {account ? (
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="account-active" className="font-normal">
                Active
              </Label>
              <Switch id="account-active" checked={active} onCheckedChange={setActive} />
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : account ? "Save changes" : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
