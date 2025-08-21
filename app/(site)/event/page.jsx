"use client";
import LiveEvent from "@/app/components/LiveEvents";
import { useThemeStore } from "@/app/store/useThemestore";

function Event() {
  const { theme } = useThemeStore();

  return (
    <div className="pt-20" data-theme={theme}>
      <LiveEvent />
     
    </div>
  );
}

export default Event;
