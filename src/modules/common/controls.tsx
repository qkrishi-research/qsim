import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** A titled section within the interaction dock. */
export function ControlGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <span className="label-caps">{label}</span>
      <div className="flex min-h-0 flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

/** A vertical divider between dock sections. */
export function DockDivider() {
  return <div className="mx-1 w-px shrink-0 self-stretch bg-line" />;
}

/** A compact monospace action button for applying a gate. */
export function GateButton({
  label,
  onClick,
  title,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  title?: string;
  tone?: "default" | "phase";
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-9 min-w-[38px] items-center justify-center rounded-md border px-2 font-mono text-[13px] font-medium transition-all duration-150 ease-precise active:scale-[0.96]",
        tone === "phase"
          ? "border-line bg-surface text-signal-phase hover:border-signal-phase/40 hover:bg-signal-phase/5"
          : "border-line bg-surface text-ink hover:border-accent/40 hover:bg-accent-soft"
      )}
    >
      {label}
    </button>
  );
}

interface ProbabilityMeterProps {
  entries: { label: ReactNode; value: number; color?: string }[];
  className?: string;
}

/**
 * Horizontal probability bars that ease to their target width, so a change in
 * the state reads as a physical shift of weight between outcomes.
 */
export function ProbabilityMeter({ entries, className }: ProbabilityMeterProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {entries.map((entry, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="w-8 shrink-0 font-mono text-xs text-ink-muted">
            {entry.label}
          </span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-line/70">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: entry.color ?? "hsl(var(--accent))" }}
              animate={{ width: `${Math.max(0, Math.min(1, entry.value)) * 100}%` }}
              transition={{ type: "spring", stiffness: 210, damping: 26 }}
            />
          </div>
          <span className="w-11 shrink-0 text-right font-mono text-xs tabular-nums text-ink">
            {(entry.value * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

/** A small labelled numeric readout. */
export function ReadoutPill({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-panel px-2.5 py-1.5">
      <span className="label-caps">{label}</span>
      <span
        className={cn(
          "font-mono text-[13px] tabular-nums",
          emphasis ? "font-semibold text-accent" : "text-ink"
        )}
      >
        {value}
      </span>
    </div>
  );
}
