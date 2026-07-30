import { type Complex, add, mul, ZERO } from "./complex";
import type { ComplexVector } from "./linalg";
import type { Gate } from "./gates";
import { QuantumState } from "./state";

/**
 * Applies a k-qubit gate to the given `targets` of an n-qubit state.
 *
 * `targets` lists the qubit indices the gate acts on, ordered from the gate's
 * most-significant input to its least. The state's amplitude indexing places
 * qubit 0 in the most-significant bit (see {@link QuantumState}).
 *
 * The implementation groups amplitudes that differ only in the target bits and
 * multiplies each 2^k sub-vector by the gate — O(2^n · 2^k) work, with no full
 * 2^n × 2^n operator ever materialised.
 */
export function applyGate(
  state: QuantumState,
  gate: Gate,
  targets: number[]
): QuantumState {
  const n = state.numQubits;
  const k = gate.arity;

  if (targets.length !== k) {
    throw new Error(
      `Gate ${gate.name} acts on ${k} qubit(s) but ${targets.length} target(s) were given.`
    );
  }
  for (const t of targets) {
    if (t < 0 || t >= n) {
      throw new Error(`Target qubit ${t} is out of range for ${n} qubits.`);
    }
  }

  const dim = state.dimension;
  const K = 1 << k;
  const src = state.amplitudes;
  const out: ComplexVector = new Array<Complex>(dim);

  // Bit weight in the amplitude index for each target qubit.
  const weights = targets.map((q) => 1 << (n - 1 - q));
  const targetMask = weights.reduce((acc, w) => acc | w, 0);

  const inAmps = new Array<Complex>(K);
  const indices = new Array<number>(K);

  for (let base = 0; base < dim; base++) {
    // Process each group once, from its representative with all target bits 0.
    if ((base & targetMask) !== 0) continue;

    for (let s = 0; s < K; s++) {
      let idx = base;
      for (let j = 0; j < k; j++) {
        if ((s >> (k - 1 - j)) & 1) idx |= weights[j];
      }
      indices[s] = idx;
      inAmps[s] = src[idx];
    }

    for (let r = 0; r < K; r++) {
      const row = gate.matrix[r];
      let acc = ZERO;
      for (let col = 0; col < K; col++) {
        const g = row[col];
        if (g.re === 0 && g.im === 0) continue;
        acc = add(acc, mul(g, inAmps[col]));
      }
      out[indices[r]] = acc;
    }
  }

  return new QuantumState(out);
}

/** Applies a single-qubit gate to one qubit. */
export function applySingleQubitGate(
  state: QuantumState,
  gate: Gate,
  qubit: number
): QuantumState {
  return applyGate(state, gate, [qubit]);
}

/** A step in a quantum circuit: a gate bound to concrete target qubits. */
export interface CircuitStep {
  gate: Gate;
  targets: number[];
}

/** Applies an ordered sequence of gates, returning the final state. */
export function runCircuit(
  initial: QuantumState,
  steps: CircuitStep[]
): QuantumState {
  return steps.reduce(
    (state, step) => applyGate(state, step.gate, step.targets),
    initial
  );
}
