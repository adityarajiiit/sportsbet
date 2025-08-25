import { create } from "zustand";

export const useThemeStore = create((set) => {
  const initialTheme = typeof window !== "undefined"
    ? localStorage.getItem("theme") || "dark"
    : "dark";

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", theme);
      }
      set({ theme });
    },
  };
});
