import { create } from "zustand";
import { QuantumState, Hadamard, PhaseShift, applySingleQubitGate } from "@/engine";

const TWO_PI = Math.PI * 2;

/**
 * Model of a single-qubit interferometer: H, then a relative phase φ on |1⟩,
 * then H again. The output state is recomputed from the engine on every change
 * so the visualisation is driven by the real amplitudes, not a formula.
 */
export function interferometerState(phi: number): QuantumState {
  let s = applySingleQubitGate(QuantumState.zero(1), Hadamard, 0);
  s = applySingleQubitGate(s, PhaseShift(phi), 0);
  s = applySingleQubitGate(s, Hadamard, 0);
  return s;
}

interface InterferenceState {
  phi: number;
  animating: boolean;
  setPhi: (phi: number) => void;
  toggleAnimate: () => void;
  reset: () => void;
}

export const useInterferenceStore = create<InterferenceState>((set) => ({
  phi: 0,
  animating: false,
  setPhi: (phi) => set({ phi: ((phi % TWO_PI) + TWO_PI) % TWO_PI }),
  toggleAnimate: () => set((s) => ({ animating: !s.animating })),
  reset: () => set({ phi: 0, animating: false }),
}));

/** Classifies the interference regime for labelling. */
export function interferenceLabel(phi: number): string {
  const p0 = Math.cos(phi / 2) ** 2;
  if (p0 > 0.98) return "Constructive";
  if (p0 < 0.02) return "Destructive";
  return "Partial";
}
