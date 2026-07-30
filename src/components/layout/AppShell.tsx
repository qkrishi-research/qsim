import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopToolbar } from "./TopToolbar";
import { Sidebar } from "./Sidebar";
import { Workspace } from "./Workspace";
import { InspectorPanel } from "./InspectorPanel";
import { BottomPanel } from "./BottomPanel";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getModule } from "@/modules/registry";

/**
 * The application shell. Owns the persistent chrome — toolbar, sidebar,
 * workspace, inspector and interaction dock — and keeps the workspace store
 * synchronised with the active route. It never touches quantum mathematics.
 */
export function AppShell() {
  const { moduleId } = useParams();
  const setActiveModule = useWorkspaceStore((s) => s.setActiveModule);
  const setCompact = useWorkspaceStore((s) => s.setCompact);
  const compact = useWorkspaceStore((s) => s.compact);
  const sidebarOpen = useWorkspaceStore((s) => s.sidebarOpen);
  const inspectorOpen = useWorkspaceStore((s) => s.inspectorOpen);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const toggleInspector = useWorkspaceStore((s) => s.toggleInspector);

  const isNarrow = useMediaQuery("(max-width: 1180px)");

  useEffect(() => {
    setCompact(isNarrow);
  }, [isNarrow, setCompact]);

  useEffect(() => {
    const module = getModule(moduleId);
    setActiveModule(module && module.status === "available" ? module.id : null);
  }, [moduleId, setActiveModule]);

  const scrimVisible = compact && (sidebarOpen || inspectorOpen);

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={300}>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas text-ink antialiased">
        <TopToolbar />

        <div className="relative flex min-h-0 flex-1">
          <Sidebar />

          <main className="flex min-w-0 flex-1 flex-col">
            <Workspace />
            <BottomPanel />
          </main>

          <InspectorPanel />

          <AnimatePresence>
            {scrimVisible && (
              <motion.button
                type="button"
                aria-label="Close panels"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (sidebarOpen) toggleSidebar();
                  if (inspectorOpen) toggleInspector();
                }}
                className="absolute inset-0 z-20 cursor-default bg-ink/20 backdrop-blur-[1px]"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
}
