import type { Priority } from "@/lib/tasks";

const TAG_TONES = [
  "bg-pill-pink/20 text-pill-pink",
  "bg-pill-violet/20 text-pill-violet",
  "bg-pill-blue/20 text-pill-blue",
  "bg-pill-amber/20 text-pill-amber",
  "bg-pill-lime/20 text-pill-lime",
  "bg-pill-red/20 text-pill-red",
];

export function tagTone(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) % 997;
  return TAG_TONES[hash % TAG_TONES.length];
}

export const PRIORITY_TONE: Record<Priority, string> = {
  high: "bg-pill-red/20 text-pill-red",
  medium: "bg-pill-amber/20 text-pill-amber",
  low: "bg-pill-lime/20 text-pill-lime",
};
