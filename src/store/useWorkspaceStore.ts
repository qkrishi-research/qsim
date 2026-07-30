import { create } from "zustand";

export type RunState = "idle" | "armed" | "running";
export type InspectorTab = "state" | "notes";

interface WorkspaceState {
  /** Currently focused module id (mirrors the route). */
  activeModuleId: string | null;

  /** Panel visibility — the workspace can be collapsed to full-bleed canvas. */
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  bottomPanelOpen: boolean;

  /** When the viewport is narrow, side panels float over the workspace. */
  compact: boolean;

  inspectorTab: InspectorTab;

  /** Lifecycle of the Predict → Interact → Run → Observe loop. */
  runState: RunState;

  /** Monotonic counter consumed by the renderer to recentre the camera. */
  cameraResetToken: number;

  setActiveModule: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleInspector: () => void;
  toggleBottomPanel: () => void;
  setInspectorTab: (tab: InspectorTab) => void;
  setRunState: (state: RunState) => void;
  requestCameraReset: () => void;
  setCompact: (compact: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeModuleId: null,
  sidebarOpen: true,
  inspectorOpen: true,
  bottomPanelOpen: true,
  inspectorTab: "state",
  runState: "idle",
  cameraResetToken: 0,
  compact: false,

  setActiveModule: (id) => set({ activeModuleId: id, runState: "idle" }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  setRunState: (state) => set({ runState: state }),
  requestCameraReset: () =>
    set((s) => ({ cameraResetToken: s.cameraResetToken + 1 })),
  setCompact: (compact) =>
    set((s) =>
      compact === s.compact
        ? s
        : compact
          ? { compact, sidebarOpen: false, inspectorOpen: false }
          : { compact, sidebarOpen: true, inspectorOpen: true }
    ),
}));
