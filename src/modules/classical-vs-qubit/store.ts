import { create } from "zustand";
import {
  QuantumState,
  applySingleQubitGate,
  measureQubit,
  type Gate,
} from "@/engine";

interface ClassicalQubitState {
  /** The classical bit — always exactly 0 or 1. */
  classicalBit: 0 | 1;
  /** The qubit's live pure state. */
  qubit: QuantumState;
  /** The most recent qubit measurement outcome, if any. */
  lastMeasurement: 0 | 1 | null;
  /** Rising counter so the scene can flash on each measurement. */
  measurementToken: number;

  flipClassical: () => void;
  setBlochAngles: (theta: number, phi: number) => void;
  applyGate: (gate: Gate) => void;
  measureQubit: () => void;
  reset: () => void;
}

export const useClassicalQubitStore = create<ClassicalQubitState>((set) => ({
  classicalBit: 0,
  qubit: QuantumState.zero(1),
  lastMeasurement: null,
  measurementToken: 0,

  flipClassical: () =>
    set((s) => ({ classicalBit: s.classicalBit === 0 ? 1 : 0 })),

  setBlochAngles: (theta, phi) =>
    set({
      qubit: QuantumState.fromBlochAngles(theta, phi),
      lastMeasurement: null,
    }),

  applyGate: (gate) =>
    set((s) => ({
      qubit: applySingleQubitGate(s.qubit, gate, 0),
      lastMeasurement: null,
    })),

  measureQubit: () =>
    set((s) => {
      const { result, collapsed } = measureQubit(s.qubit, 0);
      return {
        qubit: collapsed,
        lastMeasurement: result,
        measurementToken: s.measurementToken + 1,
      };
    }),

  reset: () =>
    set({
      classicalBit: 0,
      qubit: QuantumState.zero(1),
      lastMeasurement: null,
    }),
}));
