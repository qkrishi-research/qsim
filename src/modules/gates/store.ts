import { create } from "zustand";
import {
  QuantumState,
  applyGate,
  applySingleQubitGate,
} from "@/engine";
import { getGateDef } from "./gateLibrary";

export type Register = "single" | "two";

interface GatesState {
  register: Register;
  singleState: QuantumState;
  twoState: QuantumState;

  selectedId: string;
  /** Parameter for the selected rotation gate (radians). */
  angle: number;
  /** Which qubit a single-qubit gate acts on within the two-qubit register. */
  target: 0 | 1;

  history: string[];

  /** Rotation induced by the most recent single-qubit gate (for Bloch anim). */
  lastRotation: { axis: [number, number, number]; angle: number } | null;
  rotationToken: number;
  /** Rising counter watched by the two-qubit scene to animate a joint update. */
  jointToken: number;

  select: (id: string) => void;
  setAngle: (a: number) => void;
  setRegister: (r: Register) => void;
  setTarget: (t: 0 | 1) => void;
  apply: () => void;
  undo: () => void;
  reset: () => void;
}

const singleUndo: QuantumState[] = [];
const twoUndo: QuantumState[] = [];

function label(id: string, angle: number, target: 0 | 1, register: Register): string {
  const def = getGateDef(id);
  const base = def.parametric
    ? `${def.symbol}(${Math.round((angle * 180) / Math.PI)}°)`
    : def.symbol;
  if (def.arity === 1 && register === "two") return `${base}·q${target}`;
  return base;
}

export const useGatesStore = create<GatesState>((set) => ({
  register: "single",
  singleState: QuantumState.zero(1),
  twoState: QuantumState.zero(2),
  selectedId: "H",
  angle: Math.PI / 2,
  target: 0,
  history: [],
  lastRotation: null,
  rotationToken: 0,
  jointToken: 0,

  select: (id) =>
    set((s) => {
      const def = getGateDef(id);
      return {
        selectedId: id,
        // Two-qubit gates require the two-qubit register.
        register: def.arity === 2 ? "two" : s.register,
        angle: def.parametric ? def.defaultAngle ?? s.angle : s.angle,
      };
    }),

  setAngle: (a) => set({ angle: a }),
  setRegister: (register) => set({ register }),
  setTarget: (target) => set({ target }),

  apply: () =>
    set((s) => {
      const def = getGateDef(s.selectedId);
      const gate = def.make(s.angle);
      const hist = [...s.history, label(s.selectedId, s.angle, s.target, s.register)];

      if (def.arity === 2) {
        twoUndo.push(s.twoState);
        return {
          twoState: applyGate(s.twoState, gate, [0, 1]),
          register: "two",
          jointToken: s.jointToken + 1,
          history: hist,
        };
      }

      // Single-qubit gate.
      if (s.register === "single") {
        singleUndo.push(s.singleState);
        return {
          singleState: applySingleQubitGate(s.singleState, gate, 0),
          lastRotation: def.bloch
            ? { axis: def.bloch.axis, angle: def.bloch.angle(s.angle) }
            : null,
          rotationToken: s.rotationToken + 1,
          history: hist,
        };
      }

      twoUndo.push(s.twoState);
      return {
        twoState: applySingleQubitGate(s.twoState, gate, s.target),
        jointToken: s.jointToken + 1,
        history: hist,
      };
    }),

  undo: () =>
    set((s) => {
      if (s.register === "single") {
        const prev = singleUndo.pop();
        if (!prev) return s;
        return {
          singleState: prev,
          lastRotation: null,
          rotationToken: s.rotationToken + 1,
          history: s.history.slice(0, -1),
        };
      }
      const prev = twoUndo.pop();
      if (!prev) return s;
      return {
        twoState: prev,
        jointToken: s.jointToken + 1,
        history: s.history.slice(0, -1),
      };
    }),

  reset: () =>
    set((s) => {
      singleUndo.length = 0;
      twoUndo.length = 0;
      return {
        singleState: QuantumState.zero(1),
        twoState: QuantumState.zero(2),
        lastRotation: null,
        rotationToken: s.rotationToken + 1,
        jointToken: s.jointToken + 1,
        history: [],
      };
    }),
}));
