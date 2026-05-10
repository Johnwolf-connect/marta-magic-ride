import { LINE_META, type RailLine } from "@/lib/marta";
import { cn } from "@/lib/utils";

export function LineBadge({ line, size = "md" }: { line: RailLine; size?: "sm" | "md" | "lg" }) {
  const meta = LINE_META[line];
  const sz = size === "sm" ? "h-6 w-6 text-[10px]" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  return (
    <div
      className={cn("relative flex items-center justify-center rounded-full font-bold uppercase text-white", sz)}
      style={{ background: meta.token, boxShadow: `0 0 0 4px ${meta.token}25, 0 6px 20px -4px ${meta.token}80` }}
    >
      {line[0]}
      <span className="absolute inset-0 animate-pulse-ring rounded-full" style={{ background: meta.token, opacity: 0.4 }} />
    </div>
  );
}
