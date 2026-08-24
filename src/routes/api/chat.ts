import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

function getSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const statusEnum = z.enum(["todo", "inprogress", "done"]);
const priorityEnum = z.enum(["low", "medium", "high"]);

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Missing AI configuration", { status: 500 });

        const supabase = getSupabase();
        const gateway = createLovableAiGatewayProvider(apiKey);

        const tools = {
          listTasks: tool({
            description: "List all tasks currently on the board with their ids and columns.",
            inputSchema: z.object({}),
            execute: async () => {
              const { data, error } = await supabase
                .from("tasks")
                .select("id,title,status,priority,tags,due_date,description")
                .order("position");
              if (error) return { error: error.message };
              return { tasks: data };
            },
          }),
          createTask: tool({
            description: "Create a new task on the board.",
            inputSchema: z.object({
              title: z.string(),
              description: z.string().optional(),
              status: statusEnum.optional(),
              priority: priorityEnum.optional(),
              tags: z.array(z.string()).optional(),
              due_date: z.string().optional().describe("ISO date, e.g. 2026-09-01"),
            }),
            execute: async (input) => {
              const { data, error } = await supabase
                .from("tasks")
                .insert({ ...input, position: Date.now() })
                .select("id,title,status")
                .single();
              if (error) return { error: error.message };
              return { created: data };
            },
          }),
          updateTask: tool({
            description: "Update an existing task. Use listTasks first to find the task id.",
            inputSchema: z.object({
              id: z.string(),
              title: z.string().optional(),
              description: z.string().optional(),
              status: statusEnum.optional(),
              priority: priorityEnum.optional(),
              tags: z.array(z.string()).optional(),
              due_date: z.string().optional(),
            }),
            execute: async ({ id, ...patch }) => {
              const { data, error } = await supabase
                .from("tasks")
                .update(patch)
                .eq("id", id)
                .select("id,title,status")
                .single();
              if (error) return { error: error.message };
              return { updated: data };
            },
          }),
          deleteTask: tool({
            description: "Delete a task permanently.",
            inputSchema: z.object({ id: z.string() }),
            execute: async ({ id }) => {
              const { error } = await supabase.from("tasks").delete().eq("id", id);
              if (error) return { error: error.message };
              return { deleted: id };
            },
          }),
        };

        try {
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: [
              "You are Flow, the assistant built into a shared Kanban board app.",
              "Columns are: todo (To Do), inprogress (In Progress), done (Done).",
              "You can read and change the board with your tools. Prefer acting over asking,",
              "but confirm before deleting more than one task.",
              "When the user asks about progress, call listTasks first and answer with specifics.",
              "Keep replies short, warm and concrete. Use markdown lists when listing tasks.",
            ].join(" "),
            messages: await convertToModelMessages(body.messages as UIMessage[]),
            tools,
            stopWhen: stepCountIs(50),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "AI request failed";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
