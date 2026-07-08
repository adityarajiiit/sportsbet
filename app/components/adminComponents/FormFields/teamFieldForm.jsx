"use client";
import React, { useState, useEffect } from "react";
import { FileUpload } from "@/components/ui/fileUpload";
import { positions } from "../../../constants/sportPositions";
function TeamFieldForm() {
  const [sport, setSport] = useState(null);
  const [matchesPlayed, setMatchesPlayed] = useState(0);
  const [matchWon, setMatchWon] = useState(0);
  const [winPercent, setWinPercent] = useState(0);
  useEffect(() => {
    if (matchesPlayed > 0) {
      setWinPercent((matchWon / matchesPlayed) * 100);
    } else {
      setWinPercent(0);
    }
  }, [matchWon, matchesPlayed]);
  return (
    <div className="p-4">
      <h1 className="text-2xl uppercase font-poppins font-bold">
        add <span className="text-warning">team</span>
      </h1>
      <form
        action=""
        className="mt-4 grid grid-col-1 md:grid-cols-2  gap-2 md:gap-6"
      >
        <fieldset className="fieldset gap-1 w-full">
          <legend className="fieldset-legend font-poppins py-1.5">
            team Name
          </legend>
          <input
            type="text"
            className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
            placeholder="team Name"
          />
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
            Matches Played
          </legend>
          <input
            type="number"
            className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
            placeholder="Matches Played "
            min={0}
            onChange={(e) => setMatchesPlayed(e.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset gap-1 w-full">
          <legend className="fieldset-legend font-poppins py-1.5">
            Matches Won
          </legend>
          <input
            type="number"
            className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
            placeholder="Matches Won"
            min={0}
            max={matchesPlayed}
          />
        </fieldset>
        <fieldset className="fieldset gap-1 w-full">
          <legend className="fieldset-legend font-poppins py-1.5">
            Matches Won percentage
          </legend>
          <input
            type="number"
            className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
            placeholder="Matches Won percentage"
            min={0}
            max={matchesPlayed}
            value={winPercent}
            onChange={(e) => setWinPercent(e.target.value)}
          />
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
        <div className="flex flex-col gap-1.5">
          <legend className="fieldset-legend font-poppins py-1.5 text-xs">
            Team Logo
          </legend>
          <fieldset className="w-full border border-dashed bg-base-200 border-neutral-600 rounded-lg">
            <FileUpload />
          </fieldset>
        </div>
        <fieldset className="w-full ">
          <legend className="fieldset-legend font-poppins py-1.5 text-xs">
            Number of matches won in last 5 matches
          </legend>
          <input
            type="range"
            min={0}
            max={5}
            className="range mt-4 w-full range-xl"
          />
          <div className="flex justify-between px-2.5 mt-2 text-xs">
            <span>|</span>
            <span>|</span>
            <span>|</span>
            <span>|</span>
            <span>|</span>
            <span>|</span>
          </div>
          <div className="flex justify-between px-2.5 mt-2 text-xs">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          <p className="font-inter mt-4 text-neutral-400 text-sm font-medium">
            Selct number of matches won in last 5 matches by the team.
          </p>
        </fieldset>
      </form>
    </div>
  );
}

export default TeamFieldForm;
