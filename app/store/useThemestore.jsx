import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: "dark", 
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
    set({ theme });
  },
  hydrateTheme: () => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") || "dark";
      set({ theme: storedTheme });
      document.documentElement.setAttribute("data-theme", storedTheme);
    }
  },
}));
