import { Html } from "@react-three/drei";
import type { ReactNode } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface LabelProps {
  position: [number, number, number] | THREE.Vector3;
  children: ReactNode;
  /** Visual weight — `axis` for faint axis ticks, `state` for emphasis. */
  tone?: "axis" | "state" | "muted";
  className?: string;
}

const toneClass: Record<NonNullable<LabelProps["tone"]>, string> = {
  axis: "text-ink-subtle",
  state: "text-ink font-medium",
  muted: "text-ink-faint",
};

/**
 * A crisp DOM-rendered label anchored to a 3D point. Using the document layer
 * keeps typography consistent with the surrounding UI instead of rasterising
 * text into the WebGL canvas.
 */
export function Label({ position, children, tone = "axis", className }: LabelProps) {
  return (
    <Html
      position={position}
      center
      distanceFactor={7}
      zIndexRange={[20, 0]}
      className="pointer-events-none select-none"
      occlude={false}
    >
      <span
        className={cn(
          "whitespace-nowrap font-mono text-[13px] leading-none tracking-tight",
          toneClass[tone],
          className
        )}
      >
        {children}
      </span>
    </Html>
  );
}
