import { create } from "zustand";

export const useSelectedUser = create((set) => ({
  selectedUser: null,
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
