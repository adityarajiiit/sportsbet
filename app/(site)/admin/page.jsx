"use client";
import React from "react";
import { FileUpload } from "@/components/ui/fileUpload";
import PlayerFieldForm from "@/app/components/adminComponents/FormFields/PlayerFieldForm";
import TeamFieldForm from "@/app/components/adminComponents/FormFields/teamFieldForm";
function Admin() {
  return (
    <div className="pt-20">
      <div className="p-4">
        <h1 className="text-2xl uppercase font-poppins font-bold">
          Create <span className="text-warning">Event</span>
        </h1>
        <form
          action=""
          className="mt-4 grid grid-col-1 lg:grid-cols-2 gap-2 md:gap-6"
        >
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Match Title
            </legend>
            <input
              type="text"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Match Title"
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Start Time
            </legend>
            <input
              type="datetime-local"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              End Time
            </legend>
            <input
              type="datetime-local"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
            />
          </fieldset>
          <div></div>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Team1 Name
            </legend>
            <input
              type="text"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Team1 Name"
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Team1 Short Name
            </legend>
            <input
              type="text"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Team1 Short Name"
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Team1 Name
            </legend>
            <input
              type="text"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Team1 Name"
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Team1 Short Name
            </legend>
            <input
              type="text"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Team1 Short Name"
            />
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <legend className="fieldset-legend font-poppins py-1.5 text-xs">
              Team1 Image
            </legend>
            <fieldset className="w-full border border-dashed bg-base-200 border-neutral-600 rounded-lg">
              <FileUpload />
            </fieldset>
          </div>
          <div className="flex flex-col gap-1.5">
            <legend className="fieldset-legend font-poppins py-1.5 text-xs">
              Team2 Image
            </legend>
            <fieldset className="w-full border border-dashed bg-base-200 border-neutral-600 rounded-lg">
              <FileUpload />
            </fieldset>
          </div>

          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Venue or Stadium
            </legend>
            <input
              type="text"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Venue or Stadium Name"
            />
          </fieldset>
          <fieldset className="fieldset gap-1 w-full">
            <legend className="fieldset-legend font-poppins py-1.5">
              Host City
            </legend>
            <input
              type="text"
              className="input rounded-md placeholder:text-xs placeholder:font-inter text-inter bg-muted-foreground border-0 p-3 h-12 w-full"
              placeholder="Host City Name"
            />
          </fieldset>
        </form>
      </div>
      <PlayerFieldForm />
      <TeamFieldForm />
    </div>
  );
}

export default Admin;
