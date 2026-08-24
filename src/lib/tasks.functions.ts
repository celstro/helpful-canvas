import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const statusEnum = z.enum(["todo", "inprogress", "done"]);
const priorityEnum = z.enum(["low", "medium", "high"]);

const taskInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullish(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
  position: z.number().finite().optional(),
});

const patchSchema = taskInputSchema.partial().extend({ id: z.string().uuid() });

export const listTasksFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw new Error("Could not load tasks");
  return data ?? [];
});

export const createTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => taskInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tasks").insert(data);
    if (error) throw new Error("Could not create task");
    return { ok: true };
  });

export const updateTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => patchSchema.parse(data))
  .handler(async ({ data }) => {
    const { id, ...patch } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tasks").update(patch).eq("id", id);
    if (error) throw new Error("Could not update task");
    return { ok: true };
  });

export const deleteTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete task");
    return { ok: true };
  });
