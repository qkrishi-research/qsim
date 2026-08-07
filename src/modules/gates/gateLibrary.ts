import {
  Identity,
  PauliX,
  PauliY,
  PauliZ,
  Hadamard,
  SGate,
  SDagger,
  TGate,
  TDagger,
  RX,
  RY,
  RZ,
  CNOT,
  CZ,
  SWAP,
  CPhase,
  CRX,
  CRY,
  CRZ,
  type Gate,
} from "@/engine";

export type GateCategory = "pauli" | "clifford" | "rotation" | "two-qubit";

export type CircuitSpec =
  | { kind: "box"; label: string }
  | { kind: "cnot" }
  | { kind: "cz" }
  | { kind: "swap" }
  | { kind: "control-box"; label: string };

export interface GateDef {
  id: string;
  symbol: string;
  name: string;
  category: GateCategory;
  arity: 1 | 2;
  parametric?: boolean;
  defaultAngle?: number;
  /** H and CNOT get enhanced educational treatment. */
  featured?: boolean;
  make: (angle: number) => Gate;
  /** Symbolic matrix in KaTeX. */
  matrixTex: string;
  /** How the gate acts on the basis, in KaTeX. */
  transformTex: string;
  intuition: string;
  circuit: CircuitSpec;
  /** Rotation induced on the Bloch sphere (single-qubit gates only). */
  bloch?: { axis: [number, number, number]; angle: (p: number) => number };
}

const PM = (rows: string) => `\\begin{pmatrix}${rows}\\end{pmatrix}`;

export const gateDefs: GateDef[] = [
  // ── Pauli ────────────────────────────────────────────────────────────
  {
    id: "I",
    symbol: "I",
    name: "Identity",
    category: "pauli",
    arity: 1,
    make: () => Identity,
    matrixTex: PM("1 & 0 \\\\ 0 & 1"),
    transformTex: "I\\lvert\\psi\\rangle = \\lvert\\psi\\rangle",
    intuition: "Does nothing — the state is left exactly as it was. A useful reference and a placeholder in circuits.",
    circuit: { kind: "box", label: "I" },
    bloch: { axis: [0, 0, 1], angle: () => 0 },
  },
  {
    id: "X",
    symbol: "X",
    name: "Pauli-X (NOT)",
    category: "pauli",
    arity: 1,
    make: () => PauliX,
    matrixTex: PM("0 & 1 \\\\ 1 & 0"),
    transformTex: "X\\lvert0\\rangle=\\lvert1\\rangle,\\quad X\\lvert1\\rangle=\\lvert0\\rangle",
    intuition: "The quantum NOT: a 180° rotation about the X axis that swaps |0⟩ and |1⟩ while leaving the X eigenstates fixed.",
    circuit: { kind: "box", label: "X" },
    bloch: { axis: [1, 0, 0], angle: () => Math.PI },
  },
  {
    id: "Y",
    symbol: "Y",
    name: "Pauli-Y",
    category: "pauli",
    arity: 1,
    make: () => PauliY,
    matrixTex: PM("0 & -i \\\\ i & 0"),
    transformTex: "Y\\lvert0\\rangle=i\\lvert1\\rangle,\\quad Y\\lvert1\\rangle=-i\\lvert0\\rangle",
    intuition: "A 180° rotation about the Y axis — it flips the bit and adds a relative phase, combining the effects of X and Z.",
    circuit: { kind: "box", label: "Y" },
    bloch: { axis: [0, 1, 0], angle: () => Math.PI },
  },
  {
    id: "Z",
    symbol: "Z",
    name: "Pauli-Z",
    category: "pauli",
    arity: 1,
    make: () => PauliZ,
    matrixTex: PM("1 & 0 \\\\ 0 & -1"),
    transformTex: "Z\\lvert0\\rangle=\\lvert0\\rangle,\\quad Z\\lvert1\\rangle=-\\lvert1\\rangle",
    intuition: "A 180° rotation about the Z axis. It leaves the poles fixed but flips the sign of |1⟩ — a pure phase flip.",
    circuit: { kind: "box", label: "Z" },
    bloch: { axis: [0, 0, 1], angle: () => Math.PI },
  },

  // ── Clifford / phase ─────────────────────────────────────────────────
  {
    id: "H",
    symbol: "H",
    name: "Hadamard",
    category: "clifford",
    arity: 1,
    featured: true,
    make: () => Hadamard,
    matrixTex: `\\tfrac{1}{\\sqrt2}${PM("1 & 1 \\\\ 1 & -1")}`,
    transformTex: "H\\lvert0\\rangle=\\lvert+\\rangle,\\quad H\\lvert1\\rangle=\\lvert-\\rangle",
    intuition: "The gateway to superposition. Hadamard maps the poles onto the equator, turning a definite bit into an equal blend of 0 and 1 — and it is its own inverse.",
    circuit: { kind: "box", label: "H" },
    bloch: { axis: [Math.SQRT1_2, 0, Math.SQRT1_2], angle: () => Math.PI },
  },
  {
    id: "S",
    symbol: "S",
    name: "Phase (S)",
    category: "clifford",
    arity: 1,
    make: () => SGate,
    matrixTex: PM("1 & 0 \\\\ 0 & i"),
    transformTex: "S = \\sqrt{Z},\\quad S\\lvert1\\rangle=i\\lvert1\\rangle",
    intuition: "A quarter turn about Z (90°). Applied twice it equals Z. It rotates the equator, sending |+⟩ to |i⟩.",
    circuit: { kind: "box", label: "S" },
    bloch: { axis: [0, 0, 1], angle: () => Math.PI / 2 },
  },
  {
    id: "Sdg",
    symbol: "S†",
    name: "S-dagger",
    category: "clifford",
    arity: 1,
    make: () => SDagger,
    matrixTex: PM("1 & 0 \\\\ 0 & -i"),
    transformTex: "S^{\\dagger}S = I,\\quad S^{\\dagger}\\lvert1\\rangle=-i\\lvert1\\rangle",
    intuition: "The inverse of S — a −90° turn about Z. It undoes an S gate.",
    circuit: { kind: "box", label: "S†" },
    bloch: { axis: [0, 0, 1], angle: () => -Math.PI / 2 },
  },
  {
    id: "T",
    symbol: "T",
    name: "π/8 (T)",
    category: "clifford",
    arity: 1,
    make: () => TGate,
    matrixTex: PM("1 & 0 \\\\ 0 & e^{i\\pi/4}"),
    transformTex: "T = \\sqrt{S},\\quad T\\lvert1\\rangle=e^{i\\pi/4}\\lvert1\\rangle",
    intuition: "An eighth turn about Z (45°). Together with H it generates all single-qubit operations — essential for universal quantum computing.",
    circuit: { kind: "box", label: "T" },
    bloch: { axis: [0, 0, 1], angle: () => Math.PI / 4 },
  },
  {
    id: "Tdg",
    symbol: "T†",
    name: "T-dagger",
    category: "clifford",
    arity: 1,
    make: () => TDagger,
    matrixTex: PM("1 & 0 \\\\ 0 & e^{-i\\pi/4}"),
    transformTex: "T^{\\dagger}T = I",
    intuition: "The inverse of T — a −45° turn about Z.",
    circuit: { kind: "box", label: "T†" },
    bloch: { axis: [0, 0, 1], angle: () => -Math.PI / 4 },
  },

  // ── Rotations ────────────────────────────────────────────────────────
  {
    id: "RX",
    symbol: "Rx",
    name: "X-rotation",
    category: "rotation",
    arity: 1,
    parametric: true,
    defaultAngle: Math.PI / 2,
    make: (a) => RX(a),
    matrixTex: PM(
      "\\cos\\tfrac{\\theta}{2} & -i\\sin\\tfrac{\\theta}{2} \\\\ -i\\sin\\tfrac{\\theta}{2} & \\cos\\tfrac{\\theta}{2}"
    ),
    transformTex: "R_x(\\theta) = e^{-i\\theta X/2}",
    intuition: "A continuous rotation by any angle θ about the X axis. At θ = π it becomes the X gate.",
    circuit: { kind: "box", label: "Rx" },
    bloch: { axis: [1, 0, 0], angle: (p) => p },
  },
  {
    id: "RY",
    symbol: "Ry",
    name: "Y-rotation",
    category: "rotation",
    arity: 1,
    parametric: true,
    defaultAngle: Math.PI / 2,
    make: (a) => RY(a),
    matrixTex: PM(
      "\\cos\\tfrac{\\theta}{2} & -\\sin\\tfrac{\\theta}{2} \\\\ \\sin\\tfrac{\\theta}{2} & \\cos\\tfrac{\\theta}{2}"
    ),
    transformTex: "R_y(\\theta) = e^{-i\\theta Y/2}",
    intuition: "A rotation by θ about the Y axis. It moves amplitude between |0⟩ and |1⟩ with purely real coefficients.",
    circuit: { kind: "box", label: "Ry" },
    bloch: { axis: [0, 1, 0], angle: (p) => p },
  },
  {
    id: "RZ",
    symbol: "Rz",
    name: "Z-rotation",
    category: "rotation",
    arity: 1,
    parametric: true,
    defaultAngle: Math.PI / 2,
    make: (a) => RZ(a),
    matrixTex: PM("e^{-i\\theta/2} & 0 \\\\ 0 & e^{i\\theta/2}"),
    transformTex: "R_z(\\theta) = e^{-i\\theta Z/2}",
    intuition: "A rotation by θ about the Z axis — it changes the relative phase between |0⟩ and |1⟩ without changing probabilities.",
    circuit: { kind: "box", label: "Rz" },
    bloch: { axis: [0, 0, 1], angle: (p) => p },
  },

  // ── Two-qubit ────────────────────────────────────────────────────────
  {
    id: "CNOT",
    symbol: "CX",
    name: "Controlled-NOT",
    category: "two-qubit",
    arity: 2,
    featured: true,
    make: () => CNOT,
    matrixTex: PM(
      "1&0&0&0 \\\\ 0&1&0&0 \\\\ 0&0&0&1 \\\\ 0&0&1&0"
    ),
    transformTex: "\\text{CX}\\lvert1\\rangle\\lvert b\\rangle = \\lvert1\\rangle\\lvert b\\oplus1\\rangle",
    intuition: "The workhorse of entanglement. It flips the target only when the control is |1⟩. Acting on a superposed control, it correlates the two qubits — H then CNOT builds a Bell state.",
    circuit: { kind: "cnot" },
  },
  {
    id: "CZ",
    symbol: "CZ",
    name: "Controlled-Z",
    category: "two-qubit",
    arity: 2,
    make: () => CZ,
    matrixTex: PM(
      "1&0&0&0 \\\\ 0&1&0&0 \\\\ 0&0&1&0 \\\\ 0&0&0&-1"
    ),
    transformTex: "\\text{CZ}\\lvert11\\rangle = -\\lvert11\\rangle",
    intuition: "Applies a phase flip to |11⟩ only. It is symmetric between the two qubits and, like CNOT, can create entanglement.",
    circuit: { kind: "cz" },
  },
  {
    id: "SWAP",
    symbol: "SWAP",
    name: "Swap",
    category: "two-qubit",
    arity: 2,
    make: () => SWAP,
    matrixTex: PM(
      "1&0&0&0 \\\\ 0&0&1&0 \\\\ 0&1&0&0 \\\\ 0&0&0&1"
    ),
    transformTex: "\\text{SWAP}\\lvert a\\rangle\\lvert b\\rangle = \\lvert b\\rangle\\lvert a\\rangle",
    intuition: "Exchanges the states of the two qubits. It never creates entanglement — it only moves information between wires.",
    circuit: { kind: "swap" },
  },
  {
    id: "CP",
    symbol: "CP",
    name: "Controlled Phase",
    category: "two-qubit",
    arity: 2,
    parametric: true,
    defaultAngle: Math.PI / 2,
    make: (a) => CPhase(a),
    matrixTex: PM(
      "1&0&0&0 \\\\ 0&1&0&0 \\\\ 0&0&1&0 \\\\ 0&0&0&e^{i\\lambda}"
    ),
    transformTex: "\\text{CP}(\\lambda)\\lvert11\\rangle = e^{i\\lambda}\\lvert11\\rangle",
    intuition: "Adds an adjustable phase λ to |11⟩ only. CZ is the special case λ = π. Central to the quantum Fourier transform.",
    circuit: { kind: "control-box", label: "P" },
  },
  {
    id: "CRX",
    symbol: "CRx",
    name: "Controlled RX",
    category: "two-qubit",
    arity: 2,
    parametric: true,
    defaultAngle: Math.PI / 2,
    make: (a) => CRX(a),
    matrixTex: PM(
      "1&0&0&0 \\\\ 0&1&0&0 \\\\ 0&0&\\cos\\tfrac{\\theta}{2}&-i\\sin\\tfrac{\\theta}{2} \\\\ 0&0&-i\\sin\\tfrac{\\theta}{2}&\\cos\\tfrac{\\theta}{2}"
    ),
    transformTex: "\\text{controlled } R_x(\\theta)",
    intuition: "Applies an X-rotation to the target only when the control is |1⟩ — a tunable, conditional rotation.",
    circuit: { kind: "control-box", label: "Rx" },
  },
  {
    id: "CRY",
    symbol: "CRy",
    name: "Controlled RY",
    category: "two-qubit",
    arity: 2,
    parametric: true,
    defaultAngle: Math.PI / 2,
    make: (a) => CRY(a),
    matrixTex: PM(
      "1&0&0&0 \\\\ 0&1&0&0 \\\\ 0&0&\\cos\\tfrac{\\theta}{2}&-\\sin\\tfrac{\\theta}{2} \\\\ 0&0&\\sin\\tfrac{\\theta}{2}&\\cos\\tfrac{\\theta}{2}"
    ),
    transformTex: "\\text{controlled } R_y(\\theta)",
    intuition: "A conditional Y-rotation — the basis of many variational and amplitude-encoding circuits.",
    circuit: { kind: "control-box", label: "Ry" },
  },
  {
    id: "CRZ",
    symbol: "CRz",
    name: "Controlled RZ",
    category: "two-qubit",
    arity: 2,
    parametric: true,
    defaultAngle: Math.PI / 2,
    make: (a) => CRZ(a),
    matrixTex: PM(
      "1&0&0&0 \\\\ 0&1&0&0 \\\\ 0&0&e^{-i\\theta/2}&0 \\\\ 0&0&0&e^{i\\theta/2}"
    ),
    transformTex: "\\text{controlled } R_z(\\theta)",
    intuition: "A conditional phase rotation on the target, controlled by the first qubit.",
    circuit: { kind: "control-box", label: "Rz" },
  },
];

export const gateById = new Map(gateDefs.map((g) => [g.id, g]));

export function getGateDef(id: string): GateDef {
  const g = gateById.get(id);
  if (!g) throw new Error(`Unknown gate ${id}`);
  return g;
}

export const gateCategories: { id: GateCategory; label: string }[] = [
  { id: "pauli", label: "Pauli" },
  { id: "clifford", label: "Clifford & phase" },
  { id: "rotation", label: "Rotations" },
  { id: "two-qubit", label: "Two-qubit" },
];
