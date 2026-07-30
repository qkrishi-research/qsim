import {
  PanelLeft,
  PanelRight,
  PanelBottom,
  Focus,
  Atom,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { getModule } from "@/modules/registry";
import { cn } from "@/lib/utils";

function ToolbarToggle({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          aria-pressed={active}
          className={cn(active && "bg-accent-soft text-accent")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

export function TopToolbar() {
  const {
    activeModuleId,
    sidebarOpen,
    inspectorOpen,
    bottomPanelOpen,
    toggleSidebar,
    toggleInspector,
    toggleBottomPanel,
    requestCameraReset,
  } = useWorkspaceStore();

  const module = getModule(activeModuleId ?? undefined);

  return (
    <header className="relative z-20 flex h-[52px] shrink-0 items-center gap-3 border-b border-line bg-surface/90 px-3 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 pl-1 pr-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-surface">
          <Atom className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-semibold tracking-tight text-ink">
            Quantum Lab
          </span>
          <span className="text-2xs tracking-label text-ink-faint">
            INTERACTIVE
          </span>
        </div>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex min-w-0 items-center gap-2.5">
        {module ? (
          <>
            <span className="truncate text-[13px] font-medium text-ink">
              {module.title}
            </span>
            <span className="rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-2xs text-ink-muted">
              {module.qubits} {module.qubits === 1 ? "qubit" : "qubits"}
            </span>
          </>
        ) : (
          <span className="text-[13px] text-ink-subtle">No module selected</span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ToolbarToggle
          active={false}
          label="Reset view"
          onClick={requestCameraReset}
        >
          <Focus className="h-4 w-4" strokeWidth={1.75} />
        </ToolbarToggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarToggle
          active={sidebarOpen}
          label="Toggle modules"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
        </ToolbarToggle>
        <ToolbarToggle
          active={bottomPanelOpen}
          label="Toggle controls"
          onClick={toggleBottomPanel}
        >
          <PanelBottom className="h-4 w-4" strokeWidth={1.75} />
        </ToolbarToggle>
        <ToolbarToggle
          active={inspectorOpen}
          label="Toggle inspector"
          onClick={toggleInspector}
        >
          <PanelRight className="h-4 w-4" strokeWidth={1.75} />
        </ToolbarToggle>
      </div>
    </header>
  );
}
