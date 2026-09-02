"use client";
import Image from "next/image";
import React from "react";
import football from "@/public/soccer.jpg";
import cricket from "@/public/cricket.jpg";
import rugby from "@/public/american-football.jpg";
import mma from "@/public/mma.jpg";
import boxing from "@/public/boxing.jpg";
import tennis from "@/public/tennis.jpg";
import f1 from "@/public/f1-race.jpg";
import basketball from "@/public/basketball.jpg";
import badminton from "@/public/badminton.jpg";
import wrestling from "@/public/wrestling.jpg";
import volleyball from "@/public/volleyball.jpg";
import { FaArrowCircleRight } from "react-icons/fa";
import { useState } from "react";
import { MdOutlineAllInclusive } from "react-icons/md";
import { IoIosFootball } from "react-icons/io";
import { BiSolidCricketBall } from "react-icons/bi";
import { FaFootballBall } from "react-icons/fa";
import { MdOutlineSportsMma } from "react-icons/md";
import { GiBoxingGlove } from "react-icons/gi";
import { MdSportsTennis } from "react-icons/md";
import { SiF1 } from "react-icons/si";
import { IoIosBasketball } from "react-icons/io";
import { GiShuttlecock } from "react-icons/gi";
import { MdOutlineSportsKabaddi } from "react-icons/md";
import { FaVolleyball } from "react-icons/fa6";
import { FaBox } from "react-icons/fa";
import LiveEvent from "./EventComponents/Events";
import io from "socket.io-client"
import axios from "axios"
function SportSection() {
  const sports = [
    {
      image: football,
      title: "Football",
    },
    {
      image: cricket,
      title: "Cricket",
    },
    {
      image: rugby,
      title: "Rugby",
    },
    {
      image: mma,
      title: "MMA",
    },
    {
      image: boxing,
      title: "Boxing",
    },
    {
      image: tennis,
      title: "Tennis",
    },
    {
      image: f1,
      title: "F1",
    },
    {
      image: basketball,
      title: "Basketball",
    },
    {
      image: badminton,
      title: "Badminton",
    },
    {
      image: wrestling,
      title: "Wrestling",
    },
    {
      image: volleyball,
      title: "Volleyball",
    },
  ];
  const sportFilters = [
    {
      icon: <MdOutlineAllInclusive className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "All",
    },
    {
      icon: <IoIosFootball className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Football",
    },
    {
      icon: <BiSolidCricketBall className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Cricket",
    },
    {
      icon: <FaFootballBall className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Rugby",
    },
    {
      icon: <MdOutlineSportsMma className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "MMA",
    },
    {
      icon: <GiBoxingGlove className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Boxing",
    },
    {
      icon: <MdSportsTennis className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Tennis",
    },
    {
      icon: <SiF1 className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "F1",
    },
    {
      icon: <IoIosBasketball className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Basketball",
    },
    {
      icon: <GiShuttlecock className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Badminton",
    },
    {
      icon: <MdOutlineSportsKabaddi className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Wrestling",
    },
    {
      icon: <FaVolleyball className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Volleyball",
    },
    {
      icon: <FaBox className="size-4" />,
      events: [
        {
          title: "Ind vs Eng Test series",
          team1: {
            name: "IND",
            score: "300/10",
            points: "1.5",
            image: cricket,
            winpercent: 70,
          },

          team2: {
            name: "ENG",
            score: "300/10",
            points: "0.5",
            image: cricket,
            winpercent: 30,
          },
        },
      ],
      title: "Other",
    },
  ];
  const [active, setActive] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {(active ? sports : sports.slice(0, 4)).map((sport) => (
          <div key={sport.title} className="relative">
            <Image
              src={sport.image}
              alt={sport.title}
              className="object-cover h-full w-full rounded-2xl"
            />
            <div className="absolute top-0 left-0 h-full w-full bg-black/30 rounded-2xl flex justify-center items-center">
              <p className="text-2xl font-bold font-poppins text-white">
                {sport.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-expanded={active}
        onClick={() => setActive(!active)}
        className="group flex items-center gap-2 font-poppins p-2 px-4 bg-warning rounded-full w-fit mt-4 text-black font-medium mb-4
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning/60"
      >
        <span>Show {active ? "less" : "more"}</span>

        <FaArrowCircleRight
          className="size-4.5 transform transition-transform duration-300 ease-out
                   group-hover:translate-x-0.5 group-hover:scale-105 "
          aria-hidden="true"
        />
      </button>
      <LiveEvent />
    </div>
  );
}

export default SportSection;
