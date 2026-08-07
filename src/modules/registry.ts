import {
  Circle,
  Orbit,
  Waves,
  Gauge,
  SlidersHorizontal,
  GitMerge,
  Link2,
  Binary,
  Sigma,
  ToggleLeft,
} from "lucide-react";
import type { LabModule, ModuleCategory } from "./types";

export const moduleCategories: ModuleCategory[] = [
  { id: "foundations", label: "Foundations" },
  { id: "gates", label: "Gates" },
  { id: "entanglement", label: "Entanglement" },
  { id: "algorithms", label: "Algorithms" },
];

export const modules: LabModule[] = [
  {
    id: "classical-vs-qubit",
    title: "Classical Bits vs Qubits",
    summary: "Compare a deterministic bit with a qubit's continuum of states.",
    category: "foundations",
    icon: ToggleLeft,
    status: "available",
    qubits: 1,
  },
  {
    id: "superposition",
    title: "Superposition",
    summary: "Balance amplitudes, then measure to collapse them.",
    category: "foundations",
    icon: Waves,
    status: "available",
    qubits: 1,
  },
  {
    id: "qubit",
    title: "The Bloch Sphere",
    summary: "Manipulate a single qubit with full spherical precision.",
    category: "foundations",
    icon: Circle,
    status: "available",
    qubits: 1,
  },
  {
    id: "measurement",
    title: "Measurement",
    summary: "Choose a basis, predict, then collapse and sample outcomes.",
    category: "foundations",
    icon: Gauge,
    status: "available",
    qubits: 1,
  },
  {
    id: "single-gates",
    title: "Gate Laboratory",
    summary: "Explore every gate: matrix, circuit, transformation and evolution.",
    category: "gates",
    icon: SlidersHorizontal,
    status: "available",
    qubits: 1,
  },
  {
    id: "interference",
    title: "Interference",
    summary: "Combine amplitudes and watch them reinforce or cancel.",
    category: "gates",
    icon: Orbit,
    status: "available",
    qubits: 1,
  },
  {
    id: "two-qubit-gates",
    title: "Two-Qubit Gates",
    summary: "Wire controlled operations across a register.",
    category: "gates",
    icon: GitMerge,
    status: "planned",
    qubits: 2,
  },
  {
    id: "bell-states",
    title: "Bell States",
    summary: "Prepare entangled pairs and measure their correlations.",
    category: "entanglement",
    icon: Link2,
    status: "available",
    qubits: 2,
  },
  {
    id: "teleportation",
    title: "Teleportation",
    summary: "Move a state across a channel with classical assist.",
    category: "entanglement",
    icon: Binary,
    status: "planned",
    qubits: 3,
  },
  {
    id: "deutsch-jozsa",
    title: "Deutsch–Jozsa",
    summary: "Decide constant vs. balanced in a single query.",
    category: "algorithms",
    icon: Sigma,
    status: "planned",
    qubits: 3,
  },
];

const moduleIndex = new Map(modules.map((m) => [m.id, m]));

export function getModule(id: string | undefined): LabModule | undefined {
  if (!id) return undefined;
  return moduleIndex.get(id);
}

export const defaultModuleId = modules[0].id;

export function modulesByCategory(category: string): LabModule[] {
  return modules.filter((m) => m.category === category);
}
