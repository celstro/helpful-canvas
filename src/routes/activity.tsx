import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { STATUS_LABEL, fetchTasks } from "@/lib/tasks";
import { PRIORITY_TONE } from "@/components/board/pill";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Flow Board" },
      {
        name: "description",
        content: "See the most recently created and updated tasks across your Flow Board columns.",
      },
      { property: "og:title", content: "Activity — Flow Board" },
      {
        property: "og:description",
        content: "A running log of the latest changes on your shared Kanban board.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  const recent = [...tasks].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  return (
    <AppShell>
      <main className="min-w-0 flex-1 overflow-y-auto p-4">
        <h1 className="text-xl font-semibold">Activity</h1>
        <p className="mb-4 text-xs text-muted-foreground">Latest changes on the shared board</p>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-16 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          <ol className="space-y-2">
            {recent.map((task) => {
              const created = new Date(task.created_at).getTime();
              const updated = new Date(task.updated_at).getTime();
              const action = updated - created < 2000 ? "created" : "updated";
              return (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-surface px-3 py-2.5"
                >
                  <span className="text-sm font-medium">{task.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {action} · {STATUS_LABEL[task.status]}
                  </span>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[11px] ${PRIORITY_TONE[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                  <span className="w-full text-[11px] text-muted-foreground">
                    {new Date(task.updated_at).toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </AppShell>
  );
}
