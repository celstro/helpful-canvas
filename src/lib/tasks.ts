import { supabase } from "@/integrations/supabase/client";

export const STATUSES = ["todo", "inprogress", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done",
};

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  tags: string[];
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Task[];
}

export type TaskInput = {
  title: string;
  description?: string | null;
  status?: Status;
  priority?: Priority;
  tags?: string[];
  due_date?: string | null;
};

export async function createTask(input: TaskInput & { position?: number }) {
  const { error } = await supabase.from("tasks").insert(input);
  if (error) throw error;
}

export async function updateTask(id: string, patch: Partial<TaskInput> & { position?: number }) {
  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
