import { createFileRoute } from "@tanstack/react-router";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Flow assistant — chat with your board" },
      {
        name: "description",
        content:
          "Full screen chat with the Flow assistant: add, move, edit and delete Kanban tasks in plain language.",
      },
      { property: "og:title", content: "Flow assistant — chat with your board" },
      {
        property: "og:description",
        content: "Ask the Flow assistant to run your Kanban board for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  return (
    <AppShell>
      <main className="flex min-h-0 flex-1 flex-col p-4">
        <h1 className="mb-3 px-1 text-xl font-semibold">Assistant</h1>
        <div className="mx-auto h-[calc(100vh-9rem)] w-full max-w-2xl">
          <AssistantPanel />
        </div>
      </main>
    </AppShell>
  );
}
