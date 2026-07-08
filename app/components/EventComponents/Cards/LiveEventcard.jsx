"use client";
import React from "react";
import Image from "next/image";
import { useState } from "react";
import { FaArrowCircleRight } from "react-icons/fa";
import { FaFlag } from "react-icons/fa";
import { useRouter } from "next/navigation";
function LiveEventcard({
  title,
  team1,
  team2,
  score1,
  score2,
  image1,
  image2,
  matchId,
  status,
  handleSelectedUser,
  startindex,
  endindex,
}) {
  const router = useRouter();
  return (
    <div className="p-6 flex flex-col max-h-[15rem] justify-center items-center bg-base-200 gap-2 rounded-xl border border-neutral-content/5 h-[205px]">
      <div className="w-full flex justify-between ">
        <h1 className="font-medium font-poppins text-neutral-200 flex gap-2 justify-center items-center text-sm">
          <FaFlag />
          {title}
        </h1>
        <button
          className="font-poppins text-xs p-1 bg-base-content/20 rounded-full px-3 font-semibold flex justify-center items-center gap-1"
          onClick={() => {
            router.push(`/event/score/${matchId}`);
            handleSelectedUser();
          }}
        >
          VIEW <FaArrowCircleRight />
        </button>
      </div>
      <div className="flex flex-col justify-center items-start gap-2 w-full mt-2">
        <div className="flex items-center justify-center gap-3 w-full">
          <Image
            src={image1}
            alt={team1}
            className="h-8 w-8 rounded-xl"
          ></Image>
          <div className="flex justify-between items-center w-full">
            <p className="font-poppins font-semibold text">{team1}</p>
            <p className="font-semibold font-poppins">{score1}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 w-full">
          <Image
            src={image2}
            alt={team2}
            className="h-8 w-8 rounded-xl"
          ></Image>
          <div className="flex justify-between items-center w-full">
            <p className="font-poppins font-semibold text">{team2}</p>
            <p className="font-semibold font-poppins">{score2}</p>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center items-center mt-2">
        <p>{status}</p>
      </div>
    </div>
  );
}

export default LiveEventcard;
