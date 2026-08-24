import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flow Board — Kanban with an AI copilot" },
      {
        name: "description",
        content:
          "Plan work across To Do, In Progress and Done, then let the built-in AI assistant add, move and summarise tasks for you.",
      },
      { property: "og:title", content: "Flow Board — Kanban with an AI copilot" },
      {
        property: "og:description",
        content:
          "A dark, fast Kanban board with drag and drop columns and an AI assistant that edits the board with you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 xl:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <KanbanBoard />
        </div>
        <div className="h-[540px] w-full shrink-0 xl:h-auto xl:w-[360px]">
          <AssistantPanel />
        </div>
      </main>
    </AppShell>
  );
}

