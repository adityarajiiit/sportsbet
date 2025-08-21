import { create } from "zustand";

export const useSelectedEvent = create((set) => ({
  selectedEvent: null,
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
}));
