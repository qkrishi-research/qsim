import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Frame-rate-independent critical damping. Moves `current` a fraction of the
 * way to `target` such that the response is identical regardless of frame
 * time — the standard exponential-smoothing spring used throughout the scenes.
 *
 * `lambda` is the smoothing rate: higher is snappier. dt is seconds elapsed.
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/** Angular damping that always takes the shortest path around the circle. */
export function dampAngle(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  const delta = shortestAngle(current, target);
  return current + delta * (1 - Math.exp(-lambda * dt));
}

function shortestAngle(from: number, to: number): number {
  const twoPi = Math.PI * 2;
  let delta = (to - from) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  if (delta < -Math.PI) delta += twoPi;
  return delta;
}

/** In-place vector damping toward `target`, returning `current` for chaining. */
export function damp3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  lambda: number,
  dt: number
): THREE.Vector3 {
  current.x = damp(current.x, target.x, lambda, dt);
  current.y = damp(current.y, target.y, lambda, dt);
  current.z = damp(current.z, target.z, lambda, dt);
  return current;
}

/**
 * Drives a mutable object's numeric property toward a target every frame.
 * Returns a ref to attach to the target-holding object; the animation runs on
 * the shared render loop, so no per-component timers are created.
 */
export function useDampedVector3(
  target: THREE.Vector3,
  lambda = 8
): React.MutableRefObject<THREE.Object3D | null> {
  const ref = useRef<THREE.Object3D | null>(null);

  useFrame((_, dt) => {
    const object = ref.current;
    if (!object) return;
    damp3(object.position, target, lambda, Math.min(dt, 0.1));
  });

  return ref;
}
