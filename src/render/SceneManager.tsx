import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { getModuleImpl } from "@/modules/implementations";

/**
 * Resolves the active module's 3D scene and mounts it inside the shared
 * canvas. It reads the workspace store directly (a plain external subscription,
 * valid inside the R3F reconciler) rather than React Router context, which does
 * not cross the renderer boundary.
 */
export function SceneManager() {
  const activeModuleId = useWorkspaceStore((s) => s.activeModuleId);
  const impl = getModuleImpl(activeModuleId ?? undefined);
  const Scene = impl?.Scene;

  if (!Scene) return null;
  return <Scene />;
}
