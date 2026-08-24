import { createFileRoute } from "@tanstack/react-router";
import { Activity, Bot, LayoutGrid, Settings, Users } from "lucide-react";
import logo from "@/assets/logo.png";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

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
    ],
  }),
  component: Index,
});

const NAV = [
  { label: "Board", icon: LayoutGrid, active: true },
  { label: "Assistant", icon: Bot, active: false },
  { label: "Activity", icon: Activity, active: false },
  { label: "Team", icon: Users, active: false },
  { label: "Settings", icon: Settings, active: false },
];

function Index() {
  return (
    <div className="flex min-h-screen bg-background">
      <nav className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <img src={logo} alt="Flow Board" width={32} height={32} className="h-8 w-8" />
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">Flow Board</p>
            <p className="text-[11px] text-muted-foreground">Shared workspace</p>
          </div>
        </div>

        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.label}>
              <span
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto rounded-xl border border-sidebar-border bg-background/40 p-3">
          <p className="text-xs font-medium">Tip</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Drag a card between columns, or just tell the assistant what changed.
          </p>
        </div>
      </nav>

      <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 xl:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <KanbanBoard />
        </div>
        <div className="h-[540px] w-full shrink-0 xl:h-auto xl:w-[360px]">
          <AssistantPanel />
        </div>
      </main>
    </div>
  );
}
