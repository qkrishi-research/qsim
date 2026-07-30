import { useCallback, useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";

export interface DragHandlers {
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
  onPointerCancel: (e: ThreeEvent<PointerEvent>) => void;
}

export interface UseDragResult {
  dragging: boolean;
  handlers: DragHandlers;
}

/**
 * Pointer-drag interaction for a 3D object. Reports screen-space deltas (in
 * pixels) between moves and captures the pointer so a drag continues even when
 * the cursor leaves the object. Orbit controls should be disabled while a drag
 * is active — `dragging` is provided for exactly that.
 */
export function useDrag(
  onDrag: (deltaX: number, deltaY: number, event: ThreeEvent<PointerEvent>) => void,
  options?: { onStart?: () => void; onEnd?: () => void }
): UseDragResult {
  const [dragging, setDragging] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      last.current = { x: e.clientX, y: e.clientY };
      setDragging(true);
      options?.onStart?.();
    },
    [options]
  );

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!last.current) return;
      e.stopPropagation();
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      onDrag(dx, dy, e);
    },
    [onDrag]
  );

  const end = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!last.current) return;
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      last.current = null;
      setDragging(false);
      options?.onEnd?.();
    },
    [options]
  );

  return {
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}
