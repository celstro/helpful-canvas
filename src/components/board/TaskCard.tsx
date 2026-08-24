import { Calendar, GripVertical, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Task } from "@/lib/tasks";
import { PRIORITY_TONE, tagTone } from "./pill";
import { Button } from "@/components/ui/button";

type Props = {
  task: Task;
  onOpen: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  dragging: boolean;
};

export function TaskCard({ task, onOpen, onDelete, onDragStart, onDragEnd, dragging }: Props) {
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart(task);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task)}
      className={`group card-surface cursor-pointer rounded-xl border border-border/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 ${
        dragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        <h3 className="flex-1 text-sm font-medium leading-snug text-card-foreground">
          {task.title}
        </h3>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Delete ${task.title}`}
          className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(task);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {task.description ? (
        <p className="mt-2 line-clamp-2 pl-6 text-xs text-muted-foreground">{task.description}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-6">
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-medium capitalize ${PRIORITY_TONE[task.priority]}`}
        >
          {task.priority}
        </span>
        {task.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${tagTone(tag)}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {task.due_date ? (
        <div className="mt-3 flex items-center gap-1.5 pl-6 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(parseISO(task.due_date), "MMM dd · yy")}
        </div>
      ) : null}
    </article>
  );
}
