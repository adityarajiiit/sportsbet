"use client";
import React from "react";
import { RiTeamFill } from "react-icons/ri";
import { FaUserNinja } from "react-icons/fa";
import { useState } from "react";
import Sidebar from "@/app/components/sidebar";
import dummy from "@/public/mma.jpg";
import { IoSend } from "react-icons/io5";
import Image from "next/image";
import { useSelectedUser } from "@/app/store/useSelectedUser.jsx";
import NoSelected from "@/app/components/NoSelected";
import PlayerStock from "@/app/components/playerStock";
import axios from "axios"
import {useEffect} from "react"

function Stocks() {
  const { selectedUser } = useSelectedUser();
  console.log(selectedUser);
  const teams = [
    {
      id: 1,
      image: dummy,
      name: "team 1",
      sport: "mma",
      price: "\u20B9" + 500,
      marketCapital: "\u20B9" + "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      description:
        "Short-term gains from in-form players like Rohit Sharma; Long-term holding for team stock based on upcoming fixtures.",
    },
    {
      id: 2,
      image: dummy,
      name: "team2",
      sport: "mma",
      price: "\u20B9" + 500,
      marketCapital: "\u20B9" + "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      description:
        "Short-term gains from in-form players like Rohit Sharma; Long-term holding for team stock based on upcoming fixtures.",
    },
    {
      id: 3,
      image: dummy,
      name: "Team 3",
      sport: "mma",
      price: "\u20B9" + 500,
      marketCapital: "\u20B9" + "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      description:
        "Short-term gains from in-form players like Rohit Sharma; Long-term holding for team stock based on upcoming fixtures.",
    },
  ];
  const players = [
    {
      id: 1,
      image: dummy,
      name: "Jhon Doe",
      sport: "mma",
      price: 500,
      marketCapital: "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      description:
        "Short-term gains from in-form players like Rohit Sharma; Long-term holding for team stock based on upcoming fixtures.",
    },
    {
      id: 2,
      image: dummy,
      name: "robert Doe",
      sport: "mma",
      price: 500,
      marketCapital: "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      description:
        "Short-term gains from in-form players like Rohit Sharma; Long-term holding for team stock based on upcoming fixtures.",
    },
    {
      id: 3,
      image: dummy,
      name: "jhonny Doe",
      sport: "mma",
      price: 500,
      marketCapital: "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      description:
        "Short-term gains from in-form players like Rohit Sharma; Long-term holding for team stock based on upcoming fixtures.",
    },
  ];
  const comments = [
    {
      author: "Jhon Doe",
      image: dummy,
      date: "13 Aug 2025",
      comment: "Hey there",
    },
  ];

  const [category, setcategory] = useState("Player");
  return (
    <div className="pt-20 p-4 min-h-screen ">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
        <div role="tablist" className="tabs tabs-box w-fit">
          <a
            role="tab"
            className={`tab gap-1 font-poppins ${category === "Player" ? "tab-active" : ""}`}
            onClick={() => setcategory("Player")}
          >
            <FaUserNinja />
            Players
          </a>
          <a
            role="tab"
            className={`tab gap-1 font-poppins ${category === "Team" ? "tab-active" : ""}`}
            onClick={() => setcategory("Team")}
          >
            <RiTeamFill />
            Teams
          </a>
        </div>
        <label className="input border-2">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input type="search" className="grow" placeholder="Search" />
          <kbd className="kbd kbd-sm">⌘</kbd>
          <kbd className="kbd kbd-sm">K</kbd>
        </label>
      </div>
      <div className="flex h-[calc(100vh-13rem)] overflow-hidden gap-4">
        <Sidebar players={players} category={category} teams={teams} />
        <div className="w-full">
          {selectedUser ? (
            <PlayerStock
              player={selectedUser}
              team={selectedUser}
              category={category}
            />
          ) : (
            <NoSelected />
          )}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-lg font-poppins font-semibold">Comments()</p>
      </div>
      <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-box border p-4 w-full">
        <legend className="fieldset-legend px-2 font-inter">Comment</legend>
        <div className="join w-full">
          <input
            type="text"
            className="input join-item w-full"
            placeholder="Type your commnet here"
          />
          <button className="btn join-item bg-white text-black"><IoSend/></button>
        </div>
      </fieldset>
      <div className="mt-2 mb-2">
        {comments.map((Usercomment, index) => {
          return (
            <div
              key={index}
              className="p-2.5 px-4 flex flex-col gap-2 border border-base-content/10 rounded-lg bg-base-200"
            >
              <div className="flex justify-start items-center gap-2">
                <Image
                  src={Usercomment.image}
                  alt={Usercomment.author}
                  width={400}
                  height={400}
                  className="rounded-full size-9"
                />
                <div className="flex items-center flex-col justify-center">
                  <span className="font-semibold font-inter">{Usercomment.author}</span>
                  <span className="text-xs text-neutral-400 font-medium font-inter">
                    {Usercomment.date}
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-200 font-inter font-medium">
                {Usercomment.comment}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Stocks;
