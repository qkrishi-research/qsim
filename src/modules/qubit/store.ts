import { create } from "zustand";
import { QuantumState } from "@/engine";

export interface BlochPreset {
  id: string;
  label: string;
  theta: number;
  phi: number;
}

/** The six cardinal states on the Bloch sphere. */
export const blochPresets: BlochPreset[] = [
  { id: "0", label: "|0⟩", theta: 0, phi: 0 },
  { id: "1", label: "|1⟩", theta: Math.PI, phi: 0 },
  { id: "+", label: "|+⟩", theta: Math.PI / 2, phi: 0 },
  { id: "-", label: "|−⟩", theta: Math.PI / 2, phi: Math.PI },
  { id: "i", label: "|i⟩", theta: Math.PI / 2, phi: Math.PI / 2 },
  { id: "-i", label: "|−i⟩", theta: Math.PI / 2, phi: -Math.PI / 2 },
];

interface QubitState {
  qubit: QuantumState;
  theta: number;
  phi: number;
  setBlochAngles: (theta: number, phi: number) => void;
  applyPreset: (preset: BlochPreset) => void;
  reset: () => void;
}

function stateFrom(theta: number, phi: number) {
  return {
    qubit: QuantumState.fromBlochAngles(theta, phi),
    theta,
    phi,
  };
}

export const useQubitStore = create<QubitState>((set) => ({
  ...stateFrom(0, 0),
  setBlochAngles: (theta, phi) => set(stateFrom(theta, phi)),
  applyPreset: (preset) => set(stateFrom(preset.theta, preset.phi)),
  reset: () => set(stateFrom(0, 0)),
}));
