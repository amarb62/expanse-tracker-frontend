import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/AuthProvider";
import { CONFIDENCE_THRESHOLDS } from "@/constants";
import { API_BASE_URL, USE_MOCK_API } from "@/api/client";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Ledgerly" },
      { name: "description", content: "Profile, confidence thresholds and API configuration." },
      { property: "og:title", content: "Settings — Ledgerly" },
      {
        property: "og:description",
        content: "Profile, confidence thresholds and API configuration.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Account and application preferences</p>
      </div>

      <section className="surface-card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Profile</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Currency</dt>
            <dd className="font-medium">{user?.currency}</dd>
          </div>
        </dl>
        <Separator />
        <Button variant="outline" onClick={logout}>
          Log out
        </Button>
      </section>

      <section className="surface-card space-y-2 p-5">
        <h2 className="text-lg font-semibold">Categorization thresholds</h2>
        <p className="text-sm text-muted-foreground">
          High confidence at or above {Math.round(CONFIDENCE_THRESHOLDS.high * 100)}%, medium at or
          above {Math.round(CONFIDENCE_THRESHOLDS.medium * 100)}%. Anything lower is queued for
          review.
        </p>
      </section>

      <section className="surface-card space-y-2 p-5">
        <h2 className="text-lg font-semibold">API connection</h2>
        <p className="text-sm text-muted-foreground">
          {USE_MOCK_API
            ? "No VITE_API_BASE_URL configured — running on the bundled demo dataset."
            : `Connected to ${API_BASE_URL}`}
        </p>
      </section>
    </div>
  );
}
