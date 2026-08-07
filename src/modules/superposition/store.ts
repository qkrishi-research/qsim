import { create } from "zustand";
import {
  QuantumState,
  applySingleQubitGate,
  measureQubit,
  sample,
  Hadamard,
  type Gate,
} from "@/engine";

export type Phase = "predict" | "experiment" | "measure";

interface SuperpositionState {
  qubit: QuantumState;

  /** The classical bit shown alongside for contrast — always exactly 0 or 1. */
  classicalBit: 0 | 1;

  /** The user's committed prediction for P(1), in [0, 1]. */
  prediction: number;
  predictionCommitted: boolean;

  /** Accumulated measurement counts: [count of 0, count of 1]. */
  counts: [number, number];
  shotsFired: number;

  /** Set when a single destructive measurement collapses the state. */
  collapsedTo: 0 | 1 | null;
  /** Rising counter the scene watches to trigger a collapse flash. */
  collapseToken: number;

  phase: Phase;

  flipClassical: () => void;
  setPrediction: (p: number) => void;
  commitPrediction: () => void;
  setBlochAngles: (theta: number, phi: number) => void;
  applyGate: (gate: Gate) => void;
  makeEqualSuperposition: () => void;
  runShots: (n: number) => void;
  collapseOnce: () => void;
  reset: () => void;
}

export const useSuperpositionStore = create<SuperpositionState>((set) => ({
  qubit: QuantumState.zero(1),
  classicalBit: 0,
  prediction: 0.5,
  predictionCommitted: false,
  counts: [0, 0],
  shotsFired: 0,
  collapsedTo: null,
  collapseToken: 0,
  phase: "predict",

  flipClassical: () =>
    set((s) => ({ classicalBit: s.classicalBit === 0 ? 1 : 0 })),

  setPrediction: (p) => set({ prediction: Math.max(0, Math.min(1, p)) }),

  commitPrediction: () =>
    set({ predictionCommitted: true, phase: "experiment" }),

  setBlochAngles: (theta, phi) =>
    set({
      qubit: QuantumState.fromBlochAngles(theta, phi),
      collapsedTo: null,
      phase: "experiment",
    }),

  applyGate: (gate) =>
    set((s) => ({
      qubit: applySingleQubitGate(s.qubit, gate, 0),
      collapsedTo: null,
      phase: "experiment",
    })),

  makeEqualSuperposition: () =>
    set({
      qubit: applySingleQubitGate(QuantumState.zero(1), Hadamard, 0),
      collapsedTo: null,
      phase: "experiment",
    }),

  runShots: (n) =>
    set((s) => {
      const drawn = sample(s.qubit, n);
      return {
        counts: [s.counts[0] + drawn[0], s.counts[1] + drawn[1]],
        shotsFired: s.shotsFired + n,
        phase: "measure",
      };
    }),

  collapseOnce: () =>
    set((s) => {
      const { result, collapsed } = measureQubit(s.qubit, 0);
      const counts: [number, number] = [...s.counts];
      counts[result] += 1;
      return {
        qubit: collapsed,
        collapsedTo: result,
        collapseToken: s.collapseToken + 1,
        counts,
        shotsFired: s.shotsFired + 1,
        phase: "measure",
      };
    }),

  reset: () =>
    set({
      qubit: QuantumState.zero(1),
      classicalBit: 0,
      prediction: 0.5,
      predictionCommitted: false,
      counts: [0, 0],
      shotsFired: 0,
      collapsedTo: null,
      phase: "predict",
    }),
}));
