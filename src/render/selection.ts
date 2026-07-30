import { create } from "zustand";

/**
 * A lightweight selection/hover registry for interactive scene objects.
 * Scenes register selectable ids and read the current focus; the surrounding
 * UI can react to selection without the renderer owning any panel logic.
 */
interface SelectionState {
  hoveredId: string | null;
  selectedId: string | null;
  setHovered: (id: string | null) => void;
  select: (id: string | null) => void;
  toggle: (id: string) => void;
  clear: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  hoveredId: null,
  selectedId: null,
  setHovered: (id) => set({ hoveredId: id }),
  select: (id) => set({ selectedId: id }),
  toggle: (id) =>
    set((s) => ({ selectedId: s.selectedId === id ? null : id })),
  clear: () => set({ selectedId: null, hoveredId: null }),
}));
