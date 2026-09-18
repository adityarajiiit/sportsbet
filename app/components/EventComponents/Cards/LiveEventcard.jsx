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
    <div className="p-6 flex flex-col max-h-[16rem] justify-center items-center bg-base-200 gap-2 rounded-xl border border-neutral-content/5 h-[14rem]">
      <div className="w-full flex justify-between gap-2 items-center">
        <h1 className="font-medium font-poppins text-neutral-200 flex gap-1.5 justify-center items-center text-xs">
          <FaFlag />
          <span className="line-clamp-1">{title}</span>
        </h1>
        <button
          className="group font-poppins text-xs font-semibold btn btn-sm btn-info"
          onClick={() => {
            router.push(`/event/score/${matchId}`);
            handleSelectedUser();
          }}
        >
          View
          <FaArrowCircleRight className="transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
      <div className="flex flex-col justify-center items-start gap-2 w-full mt-2">
        <div className="flex items-center justify-center gap-3 w-full">
          <Image
            src={image1}
            alt={team1}
            className="h-8 w-8 rounded-xl"
          ></Image>
          <div className="flex justify-between items-center w-full gap-2">
            <p className="font-poppins font-semibold text-sm">{team1}</p>
            <p className="font-semibold font-poppins text-sm">{score1}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 w-full">
          <Image
            src={image2}
            alt={team2}
            className="h-8 w-8 rounded-xl"
          ></Image>
          <div className="flex justify-between items-center w-full gap-2">
            <p className="font-poppins font-semibold text-sm">{team2}</p>
            <p className="font-semibold font-poppins text-sm">{score2}</p>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center items-center mt-2 text-center">
        <span className="font-poppins font-semibold text-xs line-clamp-2">{status}</span>
      </div>
    </div>
  );
}

export default LiveEventcard;
