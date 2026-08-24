import {
  createTaskFn,
  deleteTaskFn,
  listTasksFn,
  updateTaskFn,
} from "@/lib/tasks.functions";

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
  const data = await listTasksFn();
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
  await createTaskFn({ data: input });
}

export async function updateTask(id: string, patch: Partial<TaskInput> & { position?: number }) {
  await updateTaskFn({ data: { id, ...patch } });
}

export async function deleteTask(id: string) {
  await deleteTaskFn({ data: { id } });
}
