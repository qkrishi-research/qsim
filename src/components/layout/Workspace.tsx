import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";
import { RenderCanvas } from "@/components/canvas/RenderCanvas";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { getModule } from "@/modules/registry";

export function Workspace() {
  const activeModuleId = useWorkspaceStore((s) => s.activeModuleId);
  const module = getModule(activeModuleId ?? undefined);

  return (
    <div className="relative flex-1 overflow-hidden bg-canvas">
      <div className="absolute inset-0">
        <RenderCanvas />
      </div>

      {/* Overlay HUD — non-interactive except where noted. */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <div className="absolute left-4 top-4">
          <span className="label-caps text-ink-faint">Stage</span>
        </div>

        {!module && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xs text-center"
            >
              <p className="text-sm font-medium text-ink-muted">
                Select a module to begin
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
                Each experiment is interactive. Manipulate the apparatus, run
                it, and observe the result.
              </p>
            </motion.div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-2xs text-ink-faint">
          <MousePointer2 className="h-3 w-3" strokeWidth={2} />
          <span>Drag to orbit · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
