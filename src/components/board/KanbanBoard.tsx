import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  STATUSES,
  STATUS_LABEL,
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type Status,
  type Task,
  type TaskInput,
} from "@/lib/tasks";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";

const COLUMN_ACCENT: Record<Status, string> = {
  todo: "bg-pill-blue",
  inprogress: "bg-pill-amber",
  done: "bg-primary",
};

export function KanbanBoard() {
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  const [dragging, setDragging] = useState<Task | null>(null);
  const [hoverColumn, setHoverColumn] = useState<Status | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>("todo");

  useEffect(() => {
    const channel = supabase
      .channel("tasks-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const create = useMutation({
    mutationFn: (values: TaskInput) =>
      createTask({ ...values, position: Date.now() }),
    onSuccess: () => {
      invalidate();
      toast.success("Task added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TaskInput> & { position?: number } }) =>
      updateTask(id, patch),
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      invalidate();
      toast.success("Task deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleDrop = (status: Status) => {
    setHoverColumn(null);
    if (!dragging) return;
    const task = dragging;
    setDragging(null);
    if (task.status === status) return;
    update.mutate({ id: task.id, patch: { status, position: Date.now() } });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4">
        <div>
          <h1 className="text-xl font-semibold">Apex core rebranding</h1>
          <p className="text-xs text-muted-foreground">
            Shared board · {tasks.length} tasks · live for everyone with the link
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDefaultStatus("todo");
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto scroll-slim pb-4 md:grid-cols-3 md:overflow-visible">
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status);
          return (
            <section
              key={status}
              onDragOver={(event) => {
                event.preventDefault();
                setHoverColumn(status);
              }}
              onDragLeave={() => setHoverColumn((current) => (current === status ? null : current))}
              onDrop={() => handleDrop(status)}
              className={`flex min-h-[220px] flex-col rounded-2xl border p-3 transition-colors ${
                hoverColumn === status
                  ? "border-primary/60 bg-primary/5"
                  : "border-border/60 bg-surface"
              }`}
            >
              <header className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${COLUMN_ACCENT[status]}`} />
                  <h2 className="text-sm font-semibold">{STATUS_LABEL[status]}</h2>
                  <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Add task to ${STATUS_LABEL[status]}`}
                  onClick={() => {
                    setEditing(null);
                    setDefaultStatus(status);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </header>

              <div className="flex flex-1 flex-col gap-2.5">
                {isLoading ? (
                  <div className="space-y-2.5">
                    {[0, 1].map((key) => (
                      <div key={key} className="h-24 animate-pulse rounded-xl bg-muted/60" />
                    ))}
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      dragging={dragging?.id === task.id}
                      onDragStart={setDragging}
                      onDragEnd={() => setDragging(null)}
                      onOpen={(value) => {
                        setEditing(value);
                        setDialogOpen(true);
                      }}
                      onDelete={(value) => remove.mutate(value.id)}
                    />
                  ))
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setDefaultStatus(status);
                    setDialogOpen(true);
                  }}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </section>
          );
        })}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        defaultStatus={defaultStatus}
        onSubmit={(values) => {
          if (editing) update.mutate({ id: editing.id, patch: values });
          else create.mutate(values);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
