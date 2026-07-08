import { create } from "zustand";

export const useSelectedStock = create((set) => ({
  selectedPlayer: null,
  selectedTeam: null,
  setSelectedPlayer: (selectedPlayer) => set({ selectedPlayer }),
  setSelectedTeam: (team) => set({ selectedTeam: team }),
}));
