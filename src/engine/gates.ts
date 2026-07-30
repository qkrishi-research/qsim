import { type Complex, complex, expi, scale, ZERO, ONE } from "./complex";
import type { ComplexMatrix } from "./linalg";

/** A named unitary acting on a fixed number of qubits. */
export interface Gate {
  readonly name: string;
  readonly symbol: string;
  readonly arity: number;
  readonly matrix: ComplexMatrix;
}

const c = complex;
const SQRT1_2 = Math.SQRT1_2;

function gate(
  name: string,
  symbol: string,
  arity: number,
  matrix: ComplexMatrix
): Gate {
  return { name, symbol, arity, matrix };
}

// ── Single-qubit gates ────────────────────────────────────────────────────

export const Identity = gate("Identity", "I", 1, [
  [ONE, ZERO],
  [ZERO, ONE],
]);

export const PauliX = gate("Pauli-X", "X", 1, [
  [ZERO, ONE],
  [ONE, ZERO],
]);

export const PauliY = gate("Pauli-Y", "Y", 1, [
  [ZERO, c(0, -1)],
  [c(0, 1), ZERO],
]);

export const PauliZ = gate("Pauli-Z", "Z", 1, [
  [ONE, ZERO],
  [ZERO, c(-1, 0)],
]);

export const Hadamard = gate("Hadamard", "H", 1, [
  [c(SQRT1_2), c(SQRT1_2)],
  [c(SQRT1_2), c(-SQRT1_2)],
]);

export const SGate = gate("Phase (S)", "S", 1, [
  [ONE, ZERO],
  [ZERO, c(0, 1)],
]);

export const SDagger = gate("S†", "S†", 1, [
  [ONE, ZERO],
  [ZERO, c(0, -1)],
]);

export const TGate = gate("π/8 (T)", "T", 1, [
  [ONE, ZERO],
  [ZERO, expi(Math.PI / 4)],
]);

export const TDagger = gate("T†", "T†", 1, [
  [ONE, ZERO],
  [ZERO, expi(-Math.PI / 4)],
]);

/** Rotation about the X axis by angle θ. */
export function RX(theta: number): Gate {
  const c2 = Math.cos(theta / 2);
  const s2 = Math.sin(theta / 2);
  return gate("Rx", "Rx", 1, [
    [c(c2), c(0, -s2)],
    [c(0, -s2), c(c2)],
  ]);
}

/** Rotation about the Y axis by angle θ. */
export function RY(theta: number): Gate {
  const c2 = Math.cos(theta / 2);
  const s2 = Math.sin(theta / 2);
  return gate("Ry", "Ry", 1, [
    [c(c2), c(-s2)],
    [c(s2), c(c2)],
  ]);
}

/** Rotation about the Z axis by angle θ. */
export function RZ(theta: number): Gate {
  return gate("Rz", "Rz", 1, [
    [expi(-theta / 2), ZERO],
    [ZERO, expi(theta / 2)],
  ]);
}

/** A relative phase shift of λ on |1⟩. */
export function PhaseShift(lambda: number): Gate {
  return gate("Phase", "P", 1, [
    [ONE, ZERO],
    [ZERO, expi(lambda)],
  ]);
}

// ── Two-qubit gates (control is the more-significant qubit) ────────────────

export const CNOT = gate("Controlled-NOT", "CX", 2, [
  [ONE, ZERO, ZERO, ZERO],
  [ZERO, ONE, ZERO, ZERO],
  [ZERO, ZERO, ZERO, ONE],
  [ZERO, ZERO, ONE, ZERO],
]);

export const CZ = gate("Controlled-Z", "CZ", 2, [
  [ONE, ZERO, ZERO, ZERO],
  [ZERO, ONE, ZERO, ZERO],
  [ZERO, ZERO, ONE, ZERO],
  [ZERO, ZERO, ZERO, c(-1, 0)],
]);

export const SWAP = gate("Swap", "SWAP", 2, [
  [ONE, ZERO, ZERO, ZERO],
  [ZERO, ZERO, ONE, ZERO],
  [ZERO, ONE, ZERO, ZERO],
  [ZERO, ZERO, ZERO, ONE],
]);

/** Convenience registry of the parameter-free single-qubit gates. */
export const singleQubitGates: Record<string, Gate> = {
  I: Identity,
  X: PauliX,
  Y: PauliY,
  Z: PauliZ,
  H: Hadamard,
  S: SGate,
  T: TGate,
};

/** A global-phase-free scalar multiple of a gate matrix (used in tests/util). */
export function scaledMatrix(matrix: ComplexMatrix, s: number): ComplexMatrix {
  return matrix.map((row) => row.map((x: Complex) => scale(x, s)));
}
