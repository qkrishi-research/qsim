import { create } from "zustand";
import {
  QuantumState,
  applySingleQubitGate,
  PauliX,
  PauliY,
  PauliZ,
  Hadamard,
  SGate,
  TGate,
  RX,
  RY,
  RZ,
  type Gate,
} from "@/engine";

/** A gate paired with the SO(3) rotation it induces on the Bloch vector. */
export interface GateDef {
  symbol: string;
  name: string;
  gate: Gate;
  /** Rotation axis in physics Bloch coordinates. */
  axis: [number, number, number];
  /** Rotation angle in radians. */
  angle: number;
  tone?: "default" | "phase";
}

export const fixedGates: GateDef[] = [
  { symbol: "X", name: "Pauli-X", gate: PauliX, axis: [1, 0, 0], angle: Math.PI },
  { symbol: "Y", name: "Pauli-Y", gate: PauliY, axis: [0, 1, 0], angle: Math.PI },
  { symbol: "Z", name: "Pauli-Z", gate: PauliZ, axis: [0, 0, 1], angle: Math.PI, tone: "phase" },
  {
    symbol: "H",
    name: "Hadamard",
    gate: Hadamard,
    axis: [Math.SQRT1_2, 0, Math.SQRT1_2],
    angle: Math.PI,
  },
  { symbol: "S", name: "Phase (S)", gate: SGate, axis: [0, 0, 1], angle: Math.PI / 2, tone: "phase" },
  { symbol: "T", name: "π/8 (T)", gate: TGate, axis: [0, 0, 1], angle: Math.PI / 4, tone: "phase" },
];

export type RotationAxis = "x" | "y" | "z";

const rotationBuilders: Record<
  RotationAxis,
  { make: (a: number) => Gate; axis: [number, number, number] }
> = {
  x: { make: RX, axis: [1, 0, 0] },
  y: { make: RY, axis: [0, 1, 0] },
  z: { make: RZ, axis: [0, 0, 1] },
};

interface GatesState {
  qubit: QuantumState;
  history: string[];
  /** The rotation induced by the most recent gate, for scene animation. */
  lastRotation: { axis: [number, number, number]; angle: number } | null;
  rotationToken: number;

  applyGate: (def: GateDef) => void;
  applyRotation: (axis: RotationAxis, angle: number) => void;
  undo: () => void;
  reset: () => void;
}

const undoStack: QuantumState[] = [];

export const useGatesStore = create<GatesState>((set) => ({
  qubit: QuantumState.zero(1),
  history: [],
  lastRotation: null,
  rotationToken: 0,

  applyGate: (def) =>
    set((s) => {
      undoStack.push(s.qubit);
      return {
        qubit: applySingleQubitGate(s.qubit, def.gate, 0),
        history: [...s.history, def.symbol],
        lastRotation: { axis: def.axis, angle: def.angle },
        rotationToken: s.rotationToken + 1,
      };
    }),

  applyRotation: (axis, angle) =>
    set((s) => {
      const builder = rotationBuilders[axis];
      undoStack.push(s.qubit);
      const deg = Math.round((angle * 180) / Math.PI);
      return {
        qubit: applySingleQubitGate(s.qubit, builder.make(angle), 0),
        history: [...s.history, `R${axis}(${deg}°)`],
        lastRotation: { axis: builder.axis, angle },
        rotationToken: s.rotationToken + 1,
      };
    }),

  undo: () =>
    set((s) => {
      const previous = undoStack.pop();
      if (!previous) return s;
      return {
        qubit: previous,
        history: s.history.slice(0, -1),
        lastRotation: null,
        rotationToken: s.rotationToken + 1,
      };
    }),

  reset: () =>
    set((s) => {
      undoStack.length = 0;
      return {
        qubit: QuantumState.zero(1),
        history: [],
        lastRotation: null,
        rotationToken: s.rotationToken + 1,
      };
    }),
}));
