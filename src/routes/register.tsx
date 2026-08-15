import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import { errorMessage } from "@/api/client";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Expensify Finance Analytics" },
      {
        name: "description",
        content: "Create a Expensify account to import statements and analyse your spending.",
      },
      { property: "og:title", content: "Create account — Expensify" },
      {
        property: "og:description",
        content: "Create a Expensify account to import statements and analyse your spending.",
      },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
});

type Values = z.infer<typeof schema>;

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      await register(values.name, values.email, values.password);
      await navigate({ to: "/dashboard" });
    } catch (e) {
      setError(errorMessage(e, "We couldn't create your account."));
    }
  });

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <div className="surface-card w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start tracking spending across every account.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
