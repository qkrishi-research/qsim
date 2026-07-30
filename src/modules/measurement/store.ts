import { create } from "zustand";
import { QuantumState, innerProduct, abs2 } from "@/engine";

export type Basis = "z" | "x" | "y";

export interface BasisEigenstate {
  angles: [number, number];
  label: string;
}

export interface BasisInfo {
  id: Basis;
  label: string;
  /** Highlighted measurement axis in physics Bloch coordinates. */
  axis: [number, number, number];
  color: string;
  /** Eigenstate for outcome 0 and outcome 1. */
  eigen: [BasisEigenstate, BasisEigenstate];
}

const HALF_PI = Math.PI / 2;

export const bases: Record<Basis, BasisInfo> = {
  z: {
    id: "z",
    label: "Z",
    axis: [0, 0, 1],
    color: "#1d4ed8",
    eigen: [
      { angles: [0, 0], label: "0" },
      { angles: [Math.PI, 0], label: "1" },
    ],
  },
  x: {
    id: "x",
    label: "X",
    axis: [1, 0, 0],
    color: "#0d9488",
    eigen: [
      { angles: [HALF_PI, 0], label: "+" },
      { angles: [HALF_PI, Math.PI], label: "−" },
    ],
  },
  y: {
    id: "y",
    label: "Y",
    axis: [0, 1, 0],
    color: "#7c3aed",
    eigen: [
      { angles: [HALF_PI, HALF_PI], label: "i" },
      { angles: [HALF_PI, -HALF_PI], label: "−i" },
    ],
  },
};

function eigenState(info: BasisInfo, outcome: 0 | 1): QuantumState {
  const [theta, phi] = info.eigen[outcome].angles;
  return QuantumState.fromBlochAngles(theta, phi);
}

/** Probability of outcome 0 when measuring `state` in the given basis. */
export function outcomeZeroProbability(
  state: QuantumState,
  info: BasisInfo
): number {
  const e0 = eigenState(info, 0);
  return abs2(innerProduct(e0.amplitudes, state.amplitudes));
}

export interface HistoryEntry {
  basis: Basis;
  outcome: 0 | 1;
  label: string;
}

interface MeasurementState {
  qubit: QuantumState;
  basis: Basis;
  prediction: number;
  predictionCommitted: boolean;
  counts: [number, number];
  shots: number;
  history: HistoryEntry[];
  lastOutcome: 0 | 1 | null;
  collapseToken: number;

  setBlochAngles: (theta: number, phi: number) => void;
  applyAngles: (theta: number, phi: number) => void;
  setBasis: (basis: Basis) => void;
  setPrediction: (p: number) => void;
  commitPrediction: () => void;
  measureOnce: () => void;
  runShots: (n: number) => void;
  reset: () => void;
}

function clearStats() {
  return {
    counts: [0, 0] as [number, number],
    shots: 0,
    history: [] as HistoryEntry[],
    lastOutcome: null,
    prediction: 0.5,
    predictionCommitted: false,
  };
}

export const useMeasurementStore = create<MeasurementState>((set) => ({
  qubit: QuantumState.fromBlochAngles(Math.PI / 3, Math.PI / 5),
  basis: "z",
  ...clearStats(),
  collapseToken: 0,

  setBlochAngles: (theta, phi) =>
    set({
      qubit: QuantumState.fromBlochAngles(theta, phi),
      ...clearStats(),
    }),
  applyAngles: (theta, phi) =>
    set({ qubit: QuantumState.fromBlochAngles(theta, phi), ...clearStats() }),

  setBasis: (basis) => set({ basis, ...clearStats() }),

  setPrediction: (p) => set({ prediction: Math.max(0, Math.min(1, p)) }),
  commitPrediction: () => set({ predictionCommitted: true }),

  measureOnce: () =>
    set((s) => {
      const info = bases[s.basis];
      const p0 = outcomeZeroProbability(s.qubit, info);
      const outcome: 0 | 1 = Math.random() < p0 ? 0 : 1;
      const collapsed = QuantumState.fromBlochAngles(
        ...info.eigen[outcome].angles
      );
      const counts: [number, number] = [...s.counts];
      counts[outcome] += 1;
      return {
        qubit: collapsed,
        counts,
        shots: s.shots + 1,
        lastOutcome: outcome,
        collapseToken: s.collapseToken + 1,
        history: [
          { basis: s.basis, outcome, label: info.eigen[outcome].label },
          ...s.history,
        ].slice(0, 24),
      };
    }),

  runShots: (n) =>
    set((s) => {
      const info = bases[s.basis];
      const p0 = outcomeZeroProbability(s.qubit, info);
      let n0 = 0;
      for (let i = 0; i < n; i++) if (Math.random() < p0) n0++;
      return {
        counts: [s.counts[0] + n0, s.counts[1] + (n - n0)],
        shots: s.shots + n,
      };
    }),

  reset: () =>
    set({
      qubit: QuantumState.fromBlochAngles(Math.PI / 3, Math.PI / 5),
      basis: "z",
      ...clearStats(),
    }),
}));
