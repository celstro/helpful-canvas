import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { STATUSES, STATUS_LABEL, fetchTasks } from "@/lib/tasks";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — Flow Board" },
      {
        name: "description",
        content:
          "Everyone working in this shared Flow Board workspace, plus a live snapshot of how work is spread across columns.",
      },
      { property: "og:title", content: "Team — Flow Board" },
      {
        property: "og:description",
        content: "See who is in the shared workspace and how the board is loaded.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeamPage,
});

const MEMBERS = [
  { name: "You", role: "Owner", initials: "YO" },
  { name: "Flow assistant", role: "AI teammate", initials: "AI" },
  { name: "Anyone with the link", role: "Editor", initials: "LN" },
];

function TeamPage() {
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  return (
    <AppShell>
      <main className="min-w-0 flex-1 overflow-y-auto p-4">
        <h1 className="text-xl font-semibold">Team</h1>
        <p className="mb-4 text-xs text-muted-foreground">
          This board is a single shared workspace — no accounts needed
        </p>

        <ul className="mb-6 space-y-2">
          {MEMBERS.map((member) => (
            <li
              key={member.name}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface px-3 py-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {member.initials}
              </span>
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-[11px] text-muted-foreground">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="mb-2 text-sm font-semibold">Board load</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {STATUSES.map((status) => (
            <div key={status} className="rounded-xl border border-border/60 bg-surface p-3">
              <p className="text-xs text-muted-foreground">{STATUS_LABEL[status]}</p>
              <p className="text-2xl font-semibold">
                {tasks.filter((task) => task.status === status).length}
              </p>
            </div>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
