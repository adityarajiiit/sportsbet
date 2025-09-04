"use client";
import React, { useState } from "react";
function CricketFieldForm({ position }) {
  const [matches, setmatches] = useState(0);
  const [innings, setInnings] = useState(0);

  return (
    <div className="w-full flex flex-col gap-1 md:gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4 w-full">
        <fieldset className="fieldset gap-1 w-full">
          <legend className="fieldset-legend font-poppins py-1.5">
            Matches Played
          </legend>
          <input
            type="number"
            className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
            placeholder="Matches Played "
            min={0}
            onChange={(e) => setmatches(e.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset gap-1 w-full">
          <legend className="fieldset-legend font-poppins py-1.5">
            Innings Played
          </legend>
          <input
            type="number"
            className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
            placeholder="Innings Played"
            min={0}
            value={innings}
            max={matches}
            onChange={(e) => setInnings(e.target.value)}
          />
        </fieldset>
      </div>

      {(position === "Batter" ||
        position === "All-rounder" ||
        position === "Wicketkeeper") && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Total Run Scored
            </legend>
            <input
              type="number"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Total Run Scored"
              min={0}
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Highest Run Scored
            </legend>
            <input
              type="number"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Highest Run Scored"
              min={0}
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Strike Rate
            </legend>
            <input
              type="number"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Strike Rate"
              min={0}
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Average
            </legend>
            <input
              type="number"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Average"
              min={0}
            />
          </fieldset>
        </div>
      )}
      {(position === "Bowler" || position === "All-rounder") && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Wickets
            </legend>
            <input
              type="number"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Wickets"
              min={0}
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Economy
            </legend>
            <input
              type="number"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Economy"
              min={0}
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Total Number of Overs
            </legend>
            <input
              type="number"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Total Number of Overs"
              min={0}
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Medians
            </legend>
            <input
              type="number"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Medians"
              min={0}
            />
          </fieldset>
        </div>
      )}
    </div>
  );
}

export default CricketFieldForm;
