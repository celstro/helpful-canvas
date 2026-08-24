import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Flow Board" },
      {
        name: "description",
        content:
          "Manage your Flow Board workspace: clear the assistant conversation stored in this browser and review workspace basics.",
      },
      { property: "og:title", content: "Settings — Flow Board" },
      {
        property: "og:description",
        content: "Workspace preferences for your shared Kanban board.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <main className="min-w-0 flex-1 overflow-y-auto p-4">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mb-4 text-xs text-muted-foreground">Workspace basics and local data</p>

        <div className="max-w-xl space-y-3">
          <section className="rounded-xl border border-border/60 bg-surface p-4">
            <h2 className="text-sm font-semibold">Workspace</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Single shared board — everyone with the link can view and edit tasks. Changes sync live.
            </p>
          </section>

          <section className="rounded-xl border border-border/60 bg-surface p-4">
            <h2 className="text-sm font-semibold">Assistant conversation</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Chat history is stored only in this browser.
            </p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => {
                window.localStorage.removeItem("flow-board-assistant-conversation");
                toast.success("Conversation cleared");
              }}
            >
              Clear conversation
            </Button>
          </section>

          <section className="rounded-xl border border-border/60 bg-surface p-4">
            <h2 className="text-sm font-semibold">Columns</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              To Do · In Progress · Done — fixed for this board.
            </p>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
