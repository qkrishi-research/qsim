import { AnimatePresence, motion } from "framer-motion";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { getModule } from "@/modules/registry";
import { getModuleImpl } from "@/modules/implementations";

const PANEL_HEIGHT = 188;

export function BottomPanel() {
  const bottomPanelOpen = useWorkspaceStore((s) => s.bottomPanelOpen);
  const activeModuleId = useWorkspaceStore((s) => s.activeModuleId);

  const module = getModule(activeModuleId ?? undefined);
  const Controls = getModuleImpl(activeModuleId ?? undefined)?.Controls;

  return (
    <AnimatePresence initial={false}>
      {bottomPanelOpen && (
        <motion.section
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: PANEL_HEIGHT, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 shrink-0 overflow-hidden border-t border-line bg-surface"
        >
          <div className="flex flex-col" style={{ height: PANEL_HEIGHT }}>
            <div className="flex items-center gap-2 border-b border-line px-4 py-2">
              <span className="label-caps">Controls</span>
              {module && (
                <span className="text-2xs text-ink-faint">· {module.title}</span>
              )}
            </div>

            <div className="min-h-0 flex-1">
              {Controls ? (
                <Controls />
              ) : (
                <div className="flex h-full items-center px-4">
                  <p className="text-xs text-ink-faint">
                    Load a module to reveal its controls.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
