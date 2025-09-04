"use client";
import React, { useState,useEffect } from "react";
import cricket from "@/public/cricket.jpg";
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
import LiveEventcard from "./LiveEventcard";
import UpcomingEventCard from "./UpcomingEventCard";
import { useSelectedEvent } from "../store/useSelectedEvent";
import io from "socket.io-client"
import axios from "axios";
function LiveEvent() {
  
  const { selectedEvent, setSelectedEvent } = useSelectedEvent();
  const [liveevents,setLiveevents]=useState([])

useEffect(()=>{
      fetchMatches()
      const socket=io("http://localhost:4000")
      socket.on("connect",()=>{
        console.log("connected to socket server")
      })
      socket.on('match-update',(data)=>{
        
        if(data.topic==="live-matches"){
          
          console.log(data)
        }
      })
      return()=>{
        socket.off('match-update')
        socket.off('connect')
        socket.disconnect()
      }
    },[])
    const fetchMatches=async()=>{
      const response=await axios.get('http://localhost:4000/api/others/livematches')
      console.log(response.data)
      setLiveevents(response.data)
    }
  console.log(selectedEvent);
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
    }
  ];
  const [filter, setFilter] = useState("All");
  const filteredSport = sportFilters.filter((filtered) => {
    return filter === "All" || filter === filtered.title;
  });
  return (
    <div className=" w-full">
      <div className="w-full pl-4">
        <h1 className=" text-3xl font-inter font-black uppercase">
          Live <span className="text-warning">Events</span>
        </h1>
        <p className="font-inter  font-normal text-neutral-300 text-sm w-sm md:w-md lg:w-lg">
          Stay updated with live schedules.
        </p>
      </div>
      <div className="flex justify-start items-start p-4 w-full gap-2">
        <div className="w-20 md:w-44">
          <div className="p-2 grid grid-cols-1 place-items-start w-fit bg-base-200 rounded-md h-[40rem] border border-base-content/20">
            {sportFilters.map((sport) => {
              return (
                <div
                  role="tab"
                  className={`flex justify-start items-center gap-1  w-full tab rounded-sm ${filter == sport.title ? "bg-sky-700 tab-active" : ""} tabs-lg`}
                  key={sport.title}
                  onClick={() => setFilter(sport.title)}
                >
                  {sport.icon}
                  <p className="text-base font-inter hidden md:block">
                    {sport.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 w-full h-[40rem] overflow-y-auto p-2 bg-neutral-900 rounded-md border border-base-content/20">
          {filteredSport.map((sports, index) => {
            return (
              <div key={index}>
                {sports.events.map((event, i) => (
                  <LiveEventcard
                    key={i}
                    title={event.title}
                    team1={event.team1.name}
                    team2={event.team2.name}
                    score1={event.team1.score}
                    score2={event.team2.score}
                    point1={event.team1.points}
                    point2={event.team2.points}
                    image1={event.team1.image}
                    image2={event.team2.image}
                    winPercentage1={event.team1.winpercent}
                    winPercentage2={event.team2.winpercent}
                    matchId={12}
                    handleSelectedUser={() => {
                      setSelectedEvent(event);
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full mt-2 p-4">
        <h1 className=" text-3xl font-inter font-black uppercase">
          Upcoming <span className="text-warning">Events</span>
        </h1>
        <p className="font-inter  font-normal text-neutral-300 text-sm w-sm md:w-md lg:w-lg">
          Discover scheduled matches and special events.
        </p>
      </div>
      <div className="flex justify-start items-start p-4 w-full gap-2">
        <div className="w-20 md:w-44">
          <div className="p-2 grid grid-cols-1 place-items-start w-fit bg-base-200 rounded-md h-[40rem] border border-base-content/20">
            {sportFilters.map((sport) => {
              return (
                <div
                  role="tab"
                  className={`flex justify-start items-center gap-1  w-full tab rounded-sm ${filter == sport.title ? "bg-sky-700 tab-active" : ""} tabs-lg`}
                  key={sport.title}
                  onClick={() => setFilter(sport.title)}
                >
                  {sport.icon}
                  <p className="text-base font-inter hidden md:block">
                    {sport.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 w-full h-[40rem] overflow-y-auto p-2 bg-neutral-900 rounded-md border border-base-content/20">
          {filteredSport.map((filteredSport, index) => {
            return (
              <React.Fragment key={index}>
                {filteredSport.events.map((event, i) => (
                  <UpcomingEventCard
                    key={i}
                    title={event.title}
                    team1={event.team1.name}
                    date="1 Aug 2025"
                    team2={event.team2.name}
                    image1={event.team1.image}
                    image2={event.team2.image}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LiveEvent;
