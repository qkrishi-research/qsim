import { complex, abs2 } from "./complex";
import { zeroVector } from "./linalg";
import { QuantumState } from "./state";

/** A source of uniform [0, 1) randomness, injectable for reproducibility. */
export type RandomSource = () => number;

const defaultRandom: RandomSource = Math.random;

/** Result of a full projective measurement in the computational basis. */
export interface MeasurementResult {
  /** The observed basis-state index. */
  outcome: number;
  /** The observed bitstring, qubit 0 first. */
  bits: number[];
  /** The post-measurement (collapsed) state. */
  collapsed: QuantumState;
}

/** Result of measuring a single qubit in the Z basis. */
export interface QubitMeasurementResult {
  result: 0 | 1;
  probability: number;
  collapsed: QuantumState;
}

function sampleIndex(probabilities: number[], random: RandomSource): number {
  const r = random();
  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (r < cumulative) return i;
  }
  return probabilities.length - 1; // Guards against floating-point shortfall.
}

function toBits(index: number, numQubits: number): number[] {
  const bits: number[] = new Array(numQubits);
  for (let q = 0; q < numQubits; q++) {
    bits[q] = (index >> (numQubits - 1 - q)) & 1;
  }
  return bits;
}

/**
 * Performs a projective measurement of the whole register, collapsing the
 * state onto the observed basis vector.
 */
export function measure(
  state: QuantumState,
  random: RandomSource = defaultRandom
): MeasurementResult {
  const probabilities = state.probabilities();
  const outcome = sampleIndex(probabilities, random);
  return {
    outcome,
    bits: toBits(outcome, state.numQubits),
    collapsed: QuantumState.basis(state.numQubits, outcome),
  };
}

/**
 * Measures a single qubit in the Z basis and renormalizes the remaining state
 * onto the observed subspace.
 */
export function measureQubit(
  state: QuantumState,
  qubit: number,
  random: RandomSource = defaultRandom
): QubitMeasurementResult {
  const p1 = state.probabilityOfQubitOne(qubit);
  const result: 0 | 1 = random() < p1 ? 1 : 0;
  const probability = result === 1 ? p1 : 1 - p1;

  const bit = state.numQubits - 1 - qubit;
  const projected = zeroVector(state.dimension);
  const scaleFactor = probability > 1e-12 ? 1 / Math.sqrt(probability) : 0;

  for (let i = 0; i < state.amplitudes.length; i++) {
    if (((i >> bit) & 1) === result) {
      const a = state.amplitudes[i];
      projected[i] = complex(a.re * scaleFactor, a.im * scaleFactor);
    }
  }

  return { result, probability, collapsed: new QuantumState(projected) };
}

/**
 * Samples `shots` independent measurement outcomes without collapsing the
 * input state — the natural primitive for building histograms. Returns a count
 * per basis-state index.
 */
export function sample(
  state: QuantumState,
  shots: number,
  random: RandomSource = defaultRandom
): number[] {
  const probabilities = state.probabilities();
  const counts = new Array<number>(state.dimension).fill(0);
  for (let s = 0; s < shots; s++) {
    counts[sampleIndex(probabilities, random)]++;
  }
  return counts;
}

/** A seeded, reproducible RNG (mulberry32) for deterministic experiments. */
export function seededRandom(seed: number): RandomSource {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Utility: the Shannon entropy (bits) of a measurement distribution. */
export function measurementEntropy(state: QuantumState): number {
  let h = 0;
  for (const a of state.amplitudes) {
    const p = abs2(a);
    if (p > 1e-12) h -= p * Math.log2(p);
  }
  return h;
}
