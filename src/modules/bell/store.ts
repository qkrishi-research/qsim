import { create } from "zustand";
import {
  QuantumState,
  applySingleQubitGate,
  applyGate,
  Hadamard,
  PauliX,
  PauliZ,
  CNOT,
  innerProduct,
  abs2,
} from "@/engine";

export interface BellPreset {
  id: string;
  label: string;
  tex: string;
  entangled: boolean;
}

export const bellPresets: BellPreset[] = [
  { id: "phi-plus", label: "Φ⁺", tex: "\\tfrac{1}{\\sqrt2}(\\lvert00\\rangle+\\lvert11\\rangle)", entangled: true },
  { id: "phi-minus", label: "Φ⁻", tex: "\\tfrac{1}{\\sqrt2}(\\lvert00\\rangle-\\lvert11\\rangle)", entangled: true },
  { id: "psi-plus", label: "Ψ⁺", tex: "\\tfrac{1}{\\sqrt2}(\\lvert01\\rangle+\\lvert10\\rangle)", entangled: true },
  { id: "psi-minus", label: "Ψ⁻", tex: "\\tfrac{1}{\\sqrt2}(\\lvert01\\rangle-\\lvert10\\rangle)", entangled: true },
  { id: "product", label: "|00⟩", tex: "\\lvert00\\rangle \\;(\\text{product})", entangled: false },
];

export function buildBell(id: string): QuantumState {
  if (id === "product") return QuantumState.zero(2);
  let s = applySingleQubitGate(QuantumState.zero(2), Hadamard, 0);
  s = applyGate(s, CNOT, [0, 1]);
  if (id === "phi-minus") s = applySingleQubitGate(s, PauliZ, 0);
  if (id === "psi-plus") s = applySingleQubitGate(s, PauliX, 1);
  if (id === "psi-minus") {
    s = applySingleQubitGate(s, PauliX, 1);
    s = applySingleQubitGate(s, PauliZ, 0);
  }
  return s;
}

/** Measurement eigenstates for a direction θ from +Z in the X–Z plane. */
function directionEigenstates(theta: number): [QuantumState, QuantumState] {
  return [
    QuantumState.fromBlochAngles(theta, 0), // +1 outcome
    QuantumState.fromBlochAngles(Math.PI - theta, Math.PI), // −1 outcome
  ];
}

/** Joint outcome probabilities [P++, P+−, P−+, P−−] for the chosen directions. */
export function jointProbabilities(
  state: QuantumState,
  thetaA: number,
  thetaB: number
): [number, number, number, number] {
  const eA = directionEigenstates(thetaA);
  const eB = directionEigenstates(thetaB);
  const out: number[] = [];
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const joint = eA[a].tensor(eB[b]);
      out.push(abs2(innerProduct(joint.amplitudes, state.amplitudes)));
    }
  }
  return out as [number, number, number, number];
}

/** Correlation ⟨A·B⟩ ∈ [−1, 1] from joint probabilities (+ = +1, − = −1). */
export function correlation(p: [number, number, number, number]): number {
  return p[0] - p[1] - p[2] + p[3];
}

interface BellState {
  presetId: string;
  state: QuantumState;
  thetaA: number;
  thetaB: number;
  /** Accumulated joint counts: [++, +−, −+, −−]. */
  counts: [number, number, number, number];
  shots: number;

  applyPreset: (id: string) => void;
  setThetaA: (t: number) => void;
  setThetaB: (t: number) => void;
  runCorrelation: (n: number) => void;
  resetCounts: () => void;
  reset: () => void;
}

const emptyCounts = (): [number, number, number, number] => [0, 0, 0, 0];

export const useBellStore = create<BellState>((set) => ({
  presetId: "phi-plus",
  state: buildBell("phi-plus"),
  thetaA: 0,
  thetaB: 0,
  counts: emptyCounts(),
  shots: 0,

  applyPreset: (id) =>
    set({ presetId: id, state: buildBell(id), counts: emptyCounts(), shots: 0 }),

  setThetaA: (t) => set({ thetaA: t, counts: emptyCounts(), shots: 0 }),
  setThetaB: (t) => set({ thetaB: t, counts: emptyCounts(), shots: 0 }),

  runCorrelation: (n) =>
    set((s) => {
      const probs = jointProbabilities(s.state, s.thetaA, s.thetaB);
      const counts: [number, number, number, number] = [...s.counts];
      for (let i = 0; i < n; i++) {
        const r = Math.random();
        let acc = 0;
        for (let k = 0; k < 4; k++) {
          acc += probs[k];
          if (r < acc) {
            counts[k]++;
            break;
          }
        }
      }
      return { counts, shots: s.shots + n };
    }),

  resetCounts: () => set({ counts: emptyCounts(), shots: 0 }),

  reset: () =>
    set({
      presetId: "phi-plus",
      state: buildBell("phi-plus"),
      thetaA: 0,
      thetaB: 0,
      counts: emptyCounts(),
      shots: 0,
    }),
}));
