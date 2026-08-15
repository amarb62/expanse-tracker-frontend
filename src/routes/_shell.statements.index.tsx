import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatementStatusBadge } from "@/components/badges";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/states";
import {
  useAccounts,
  useDeleteStatement,
  useDownloadStatement,
  useStatements,
  useUploadStatement,
} from "@/hooks/queries";
import { MAX_STATEMENT_SIZE_BYTES } from "@/constants";
import { errorMessage } from "@/api/client";
import { formatDate, formatFileSize } from "@/utils/format";

export const Route = createFileRoute("/_shell/statements/")({
  head: () => ({
    meta: [
      { title: "Statements — Expensify" },
      {
        name: "description",
        content: "Upload bank and credit-card PDF statements and track processing status.",
      },
      { property: "og:title", content: "Statements — Expensify" },
      {
        property: "og:description",
        content: "Upload bank and credit-card PDF statements and track processing status.",
      },
    ],
  }),
  component: StatementsPage,
});

function StatementsPage() {
  const { data: accounts = [] } = useAccounts();
  const { data: statements, isPending, isError, error, refetch } = useStatements();
  const upload = useUploadStatement();
  const remove = useDeleteStatement();
  const download = useDownloadStatement();

  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (next: File | undefined) => {
    if (!next) return;
    if (next.type !== "application/pdf") {
      toast.error("Only PDF statements are supported.");
      return;
    }
    if (next.size > MAX_STATEMENT_SIZE_BYTES) {
      toast.error("That file is larger than 10 MB.");
      return;
    }
    setFile(next);
  };

  const start = () => {
    if (!file || !accountId) return;
    setProgress(0);
    upload.mutate(
      { file, accountId, ...(password ? { password } : {}), onProgress: setProgress },
      {
        onSuccess: () => {
          toast.success("Statement uploaded. Processing has started.");
          setFile(null);
          setPassword("");
          setProgress(0);
        },
        onError: (e) => toast.error(errorMessage(e, "Statement upload failed.")),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Statements</h1>
        <p className="text-sm text-muted-foreground">
          Import PDF statements and watch them get categorized.
        </p>
      </div>

      <section className="surface-card p-5">
        <h2 className="mb-4 text-lg font-semibold">Upload statement</h2>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files[0]);
          }}
          className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <Upload className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Drag your PDF statement here</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            aria-label="Choose PDF statement"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Choose PDF
          </Button>
        </div>

        {file ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-muted p-3">
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove file"
              onClick={() => {
                setFile(null);
                setPassword("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Input
                type="password"
                placeholder="PDF password (if protected)"
                autoComplete="off"
                className="w-52"
                aria-label="PDF password, if protected"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-52" aria-label="Statement account">
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
              <Button onClick={start} disabled={!accountId || upload.isPending}>
                {upload.isPending ? "Uploading…" : "Upload"}
              </Button>
            </div>
            {upload.isPending ? (
              <div className="w-full">
                <Progress value={progress} aria-label="Upload progress" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {progress < 100 ? "Uploading" : "Processing PDF"} · {progress}%
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="surface-card p-5">
        <h2 className="mb-4 text-lg font-semibold">Statement history</h2>
        {isPending ? (
          <LoadingSkeleton rows={4} />
        ) : isError ? (
          <ErrorState
            message={errorMessage(error, "Unable to load statements.")}
            onRetry={() => void refetch()}
          />
        ) : statements.length === 0 ? (
          <EmptyState title="No statements uploaded." description="Upload a PDF to get started." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">Uploaded statements</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statements.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="max-w-[220px] truncate font-medium">
                      {s.fileName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.accountName || "—"}</TableCell>
                    <TableCell className="numeric whitespace-nowrap text-muted-foreground">
                      {formatDate(s.periodStart)} – {formatDate(s.periodEnd)}
                    </TableCell>
                    <TableCell className="numeric whitespace-nowrap text-muted-foreground">
                      {formatDate(s.uploadedAt)}
                    </TableCell>
                    <TableCell className="numeric text-right">{s.transactionCount}</TableCell>
                    <TableCell>
                      <StatementStatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/statements/$id" params={{ id: s.id }}>
                            View
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Download ${s.fileName}`}
                          disabled={download.isPending}
                          onClick={() =>
                            download.mutate(
                              { id: s.id, fileName: s.fileName },
                              {
                                onError: (e) =>
                                  toast.error(
                                    errorMessage(e, "We couldn't download that statement."),
                                  ),
                              },
                            )
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${s.fileName}`}
                          onClick={() => setPendingDelete(s.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <ConfirmationModal
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this statement?"
        description="Imported transactions from this statement will also be removed. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!pendingDelete) return;
          remove.mutate(pendingDelete, {
            onSuccess: () => toast.success("Statement deleted"),
            onError: (e) => toast.error(errorMessage(e, "We couldn't delete that statement.")),
          });
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
