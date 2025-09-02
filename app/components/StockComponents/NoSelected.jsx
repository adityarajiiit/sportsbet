import React from "react";
import { LoaderFive, LoaderThree } from "@/components/ui/loader";
import { BackgroundBeams } from "@/components/ui/bg-lines";
function NoSelected() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full bg-base-300/50 rounded-xl gap-2 p-5 border border-base-content/5 relative">
      <LoaderThree></LoaderThree>
      <LoaderFive text=" Start Trading Now" />
      <p className="text-center w-sm text-sm font-inter font-medium text-base-content/70 ">
        Choose a team or player to get started with buying and selling their
        stock.{" "}
      </p>
      <BackgroundBeams />
    </div>
  );
}

export default NoSelected;
