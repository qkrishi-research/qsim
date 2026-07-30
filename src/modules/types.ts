import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type ModuleStatus = "available" | "planned";

/**
 * The interactive surfaces a module contributes to the shell. Each is optional
 * so modules can ship progressively. The `Scene` mounts inside the shared
 * WebGL canvas; `Controls` fills the interaction dock; `StatePanel` fills the
 * inspector's State tab.
 */
export interface ModuleImplementation {
  Scene?: ComponentType;
  Controls?: ComponentType;
  StatePanel?: ComponentType;
}

export type ModuleCategoryId =
  | "foundations"
  | "gates"
  | "entanglement"
  | "algorithms";

export interface ModuleCategory {
  id: ModuleCategoryId;
  label: string;
}

export interface LabModule {
  /** Stable identifier, also used as the route slug. */
  id: string;
  title: string;
  /** One-line description shown in the sidebar and inspector. */
  summary: string;
  category: ModuleCategoryId;
  icon: LucideIcon;
  status: ModuleStatus;
  /** Number of qubits the module operates on, surfaced in the inspector. */
  qubits: number;
}
