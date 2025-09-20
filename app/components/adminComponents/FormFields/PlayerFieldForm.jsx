"use client";
import React, { useState, useEffect } from "react";
import { FileUpload } from "@/components/ui/fileUpload";
import { positions } from "../../../constants/sportPositions";
import CricketFieldForm from "../sportField/cricketField";
function PlayerFieldForm() {
  const [sport, setSport] = useState(null);
  const [position, setPosition] = useState("");

  return (
    <div className="p-4">
      <h1 className="text-2xl uppercase font-poppins font-bold">
        add <span className="text-warning">player</span>
      </h1>
      <form action="" className="mt-4 flex flex-col gap-1 md:gap-4">
        <div className="w-full grid grid-col-1 lg:grid-cols-2  gap-1 md:gap-4">
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Player Name
            </legend>
            <input
              type="text"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Player Name"
            />
          </fieldset>

          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Gender
            </legend>
            <select
              defaultValue=""
              className="select rounded-md text-sm text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
            >
              <option disabled={true} className="text-sm font-inter">
                Gender
              </option>
              <option className="text-sm font-inter">Male</option>
              <option className="text-sm font-inter">Female</option>
            </select>
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Select Sport
            </legend>
            <select
              defaultValue=""
              className="select rounded-md text-sm text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              onChange={(e) => setSport(e.target.value)}
            >
              <option disabled={true} className="text-sm font-inter">
                Select Sport
              </option>
              {positions.map((sports) =>
                Object.keys(sports).map((sport, index) => (
                  <option
                    key={index}
                    className="text-sm font-inter"
                    value={sport}
                  >
                    {sport}
                  </option>
                ))
              )}
            </select>
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Select Position
            </legend>
            <select
              defaultValue=""
              className="select rounded-md text-sm text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              onChange={(e) => setPosition(e.target.value)}
            >
              <option disabled={true} className="text-sm font-inter" value="">
                Select Position
              </option>
              {positions.map((sports) =>
                Object.entries(sports).map(([sportName, positionObj]) =>
                  sportName === sport
                    ? positionObj.map((positionName, idx) => (
                        <option
                          key={idx}
                          className="text-sm font-inter"
                          value={positionName}
                        >
                          {positionName}
                        </option>
                      ))
                    : null
                )
              )}
            </select>
          </fieldset>

          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Country Name
            </legend>
            <input
              type="text"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Country "
            />
          </fieldset>
        </div>

        {sport === "Cricket" && <CricketFieldForm position={position} />}
        <div className="flex flex-col gap-1.5">
          <legend className="fieldset-legend font-poppins py-1.5 text-xs">
            Player Image
          </legend>
          <fieldset className="w-full border border-dashed bg-base-200 border-neutral-600 rounded-lg">
            <FileUpload />
          </fieldset>
        </div>
      </form>
    </div>
  );
}

export default PlayerFieldForm;
