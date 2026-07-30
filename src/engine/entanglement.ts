import { type Complex, conj, mul, sub, abs, abs2 } from "./complex";
import { QuantumState, type BlochVector } from "./state";

const I_NEG: Complex = { re: 0, im: -1 };
const I_POS: Complex = { re: 0, im: 1 };

/**
 * The reduced Bloch vector of one qubit of a multi-qubit state, obtained from
 * the single-qubit Pauli expectation values ⟨X⟩, ⟨Y⟩, ⟨Z⟩.
 *
 * This is the mathematically correct local description: for a product state its
 * length is 1 (a pure single-qubit state), and for a maximally entangled state
 * it shrinks to 0 — the qubit alone is maximally mixed, with all information
 * held in the correlations. It must never be drawn as a unit Bloch vector.
 */
export function reducedBlochVector(
  state: QuantumState,
  qubit: number
): BlochVector {
  const n = state.numQubits;
  const amps = state.amplitudes;
  const dim = amps.length;
  const bit = n - 1 - qubit;
  const mask = 1 << bit;

  let z = 0;
  let x = { re: 0, im: 0 };
  let y = { re: 0, im: 0 };

  for (let i = 0; i < dim; i++) {
    const ai = amps[i];
    const partner = amps[i ^ mask];
    const isOne = (i >> bit) & 1;

    z += isOne ? -abs2(ai) : abs2(ai);

    // ⟨X⟩ = Σ conj(a_i) · a_{i⊕mask}
    const cx = mul(conj(ai), partner);
    x = { re: x.re + cx.re, im: x.im + cx.im };

    // ⟨Y⟩: Y maps |0⟩→i|1⟩, |1⟩→−i|0⟩
    const factor = isOne ? I_POS : I_NEG;
    const cy = mul(conj(ai), mul(factor, partner));
    y = { re: y.re + cy.re, im: y.im + cy.im };
  }

  return { x: x.re, y: y.re, z };
}

/** Length of the reduced Bloch vector — 1 for pure, 0 for maximally mixed. */
export function reducedPurityRadius(
  state: QuantumState,
  qubit: number
): number {
  const b = reducedBlochVector(state, qubit);
  return Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
}

/**
 * Concurrence of a two-qubit pure state: 0 for a product state, 1 for a
 * maximally entangled (Bell) state.
 */
export function concurrence(state: QuantumState): number {
  if (state.numQubits !== 2) {
    throw new Error("concurrence() is defined for two-qubit states.");
  }
  const [a00, a01, a10, a11] = state.amplitudes;
  const d = sub(mul(a00, a11), mul(a01, a10));
  return Math.min(1, 2 * abs(d));
}

/** True when the two-qubit state carries measurable entanglement. */
export function isEntangled(state: QuantumState, epsilon = 1e-6): boolean {
  return concurrence(state) > epsilon;
}
