import type { ModuleImplementation } from "./types";
import { classicalVsQubitModule } from "./classical-vs-qubit";
import { superpositionModule } from "./superposition";
import { qubitModule } from "./qubit";
import { gatesModule } from "./gates";
import { interferenceModule } from "./interference";
import { measurementModule } from "./measurement";
import { bellModule } from "./bell";

/**
 * Maps a module id to the components it contributes to the shell. Metadata
 * lives in {@link file://./registry.ts}; this registry binds the interactive
 * implementations. Modules without an entry fall back to the neutral stage.
 */
const moduleImplementations: Record<string, ModuleImplementation> = {
  "classical-vs-qubit": classicalVsQubitModule,
  superposition: superpositionModule,
  qubit: qubitModule,
  "single-gates": gatesModule,
  interference: interferenceModule,
  measurement: measurementModule,
  "bell-states": bellModule,
};

export function getModuleImpl(
  id: string | undefined
): ModuleImplementation | undefined {
  if (!id) return undefined;
  return moduleImplementations[id];
}
