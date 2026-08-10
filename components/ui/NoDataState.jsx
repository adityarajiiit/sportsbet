import React from "react";
import { LoaderThree, LoaderFive } from "@/components/ui/loader";

function NoDataState({
  title = "No data found",
  description = "There is nothing to show right now. Please check back once the data is available.",
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-base-content/10 bg-base-100/80 px-5 py-8 text-center shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)] backdrop-blur-md w-full h-full ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,193,7,0.12),_transparent_45%)]" />
      <div className="relative flex flex-col items-center justify-center gap-4">
        <LoaderThree />
        <LoaderFive text={title} />
        <p className={`max-w-xl text-balance text-sm leading-6 text-base-content/70 font-poppins ${compact ? "max-w-sm" : ""}`}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default NoDataState;