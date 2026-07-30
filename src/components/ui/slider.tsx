import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: React.ReactNode;
  /** Formatted value shown at the right of the label row. */
  display?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * A compact, precise slider built on a native range input. The fill is drawn
 * with a gradient keyed to the current value so the control reads as an
 * instrument dial rather than a default form widget.
 */
export function Slider({
  value,
  min,
  max,
  step = 0.01,
  onChange,
  label,
  display,
  className,
  disabled,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || display) && (
        <div className="flex items-baseline justify-between">
          {label && <span className="label-caps">{label}</span>}
          {display && (
            <span className="font-mono text-2xs text-ink-muted">{display}</span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="qsim-slider"
        style={{
          background: `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${pct}%, hsl(var(--line)) ${pct}%, hsl(var(--line)) 100%)`,
        }}
      />
    </div>
  );
}
