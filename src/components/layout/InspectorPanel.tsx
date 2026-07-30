import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tex } from "@/components/common/Math";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { getModule } from "@/modules/registry";
import { getModuleImpl } from "@/modules/implementations";
import { cn } from "@/lib/utils";

const INSPECTOR_WIDTH = 328;

const tabs = [
  { id: "state", label: "State" },
  { id: "notes", label: "Notes" },
] as const;

export function InspectorPanel() {
  const { inspectorOpen, inspectorTab, setInspectorTab, activeModuleId, compact } =
    useWorkspaceStore();
  const module = getModule(activeModuleId ?? undefined);

  return (
    <AnimatePresence initial={false}>
      {inspectorOpen && (
        <motion.aside
          initial={compact ? { x: INSPECTOR_WIDTH } : { width: 0, opacity: 0 }}
          animate={compact ? { x: 0 } : { width: INSPECTOR_WIDTH, opacity: 1 }}
          exit={compact ? { x: INSPECTOR_WIDTH } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "shrink-0 overflow-hidden border-l border-line bg-surface",
            compact
              ? "absolute inset-y-0 right-0 z-30 shadow-float"
              : "relative z-10"
          )}
        >
          <div
            className="flex h-full flex-col"
            style={{ width: INSPECTOR_WIDTH }}
          >
            <div className="flex items-center gap-1 border-b border-line px-2 pt-2">
              {tabs.map((tab) => {
                const active = inspectorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInspectorTab(tab.id)}
                    className={cn(
                      "relative px-3 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "text-ink"
                        : "text-ink-subtle hover:text-ink-muted"
                    )}
                  >
                    {tab.label}
                    {active && (
                      <motion.span
                        layoutId="inspector-tab"
                        className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <ScrollArea className="flex-1">
              <div className="px-4 py-4">
                {inspectorTab === "state" ? (
                  <StateTabContent activeModuleId={activeModuleId} module={module} />
                ) : (
                  <NotesTab module={module} />
                )}
              </div>
            </ScrollArea>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function StateTabContent({
  activeModuleId,
  module,
}: {
  activeModuleId: string | null;
  module: ReturnType<typeof getModule>;
}) {
  const ModuleStatePanel = getModuleImpl(activeModuleId ?? undefined)?.StatePanel;
  if (ModuleStatePanel) return <ModuleStatePanel />;
  return <StateTab module={module} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="label-caps mb-2.5">{children}</h3>;
}

function StateTab({ module }: { module: ReturnType<typeof getModule> }) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionTitle>Module</SectionTitle>
        <p className="text-[13px] font-medium text-ink">
          {module?.title ?? "None loaded"}
        </p>
        {module && (
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {module.summary}
          </p>
        )}
      </section>

      <section>
        <SectionTitle>State vector</SectionTitle>
        <div className="rounded-md border border-line bg-panel px-3 py-4 text-center text-ink">
          <Tex display>{"\\lvert\\psi\\rangle = \\alpha\\lvert 0\\rangle + \\beta\\lvert 1\\rangle"}</Tex>
        </div>
        <p className="mt-2 text-2xs leading-relaxed text-ink-faint">
          Live amplitudes and probabilities populate here once a module drives
          the engine.
        </p>
      </section>

      <section>
        <SectionTitle>Amplitudes</SectionTitle>
        <div className="overflow-hidden rounded-md border border-line">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-panel text-left text-ink-subtle">
                <th className="px-3 py-1.5 font-medium">Basis</th>
                <th className="px-3 py-1.5 font-medium">Amplitude</th>
                <th className="px-3 py-1.5 text-right font-medium">P</th>
              </tr>
            </thead>
            <tbody className="font-mono text-ink-muted">
              {["0", "1"].map((b) => (
                <tr key={b} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">
                    <Tex>{`\\lvert ${b}\\rangle`}</Tex>
                  </td>
                  <td className="px-3 py-2 text-ink-faint">—</td>
                  <td className="px-3 py-2 text-right text-ink-faint">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function NotesTab({ module }: { module: ReturnType<typeof getModule> }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>About this module</SectionTitle>
      {module ? (
        <p className="text-[13px] leading-relaxed text-ink-muted">
          {module.summary}
        </p>
      ) : (
        <p className="text-[13px] leading-relaxed text-ink-subtle">
          Select a module from the left to begin. Each experiment follows the
          same rhythm: predict an outcome, interact with the apparatus, run it,
          and observe what the mathematics actually does.
        </p>
      )}
    </div>
  );
}
