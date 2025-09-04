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
import LiveEventcard from "./Cards/LiveEventcard";
import UpcomingEventCard from "./Cards/UpcomingEventCard";
import { useSelectedEvent } from "@/app/store/useSelectedEvent";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { TbPlayerTrackPrevFilled } from "react-icons/tb";

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
  const sportEvents = [
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
  const filteredSport = sportEvents.filter((filtered) => {
    return filter === "All" || filter === filtered.title;
  });
  const NoOfEventPerPage = 12;
  const TotalPages = Math.ceil(filteredSport.length / NoOfEventPerPage) - 1;
  const [currentPage, setCurrentPage] = useState(0);
  const StartIndex = currentPage * NoOfEventPerPage;
  const EndIndex = Math.min(
    StartIndex + NoOfEventPerPage,
    filteredSport.length
  );
  const TotalPages2 = Math.ceil(filteredSport.length / NoOfEventPerPage) - 1;
  const [currentPage2, setCurrentPage2] = useState(0);
  const StartIndex2 = currentPage2 * NoOfEventPerPage;
  const EndIndex2 = Math.min(
    StartIndex2 + NoOfEventPerPage,
    filteredSport.length
  );
  return (
    <div className=" w-full">
      <div className="w-full flex flex-wrap items-center justify-between px-4 mt-4">
        <div>
          <h1 className=" text-3xl font-inter font-black uppercase">
            Live <span className="text-warning">Events</span>
          </h1>
          <p className="font-inter  font-normal text-neutral-300 text-sm w-sm md:w-md lg:w-lg">
            Stay updated with live schedules.
          </p>
        </div>
        <div className="join gap-4">
          <button
            className={`join-item btn bg-muted-foreground border-none hover:bg-muted-foreground/50 ${currentPage === 0 ? "btn-disabled" : ""} `}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <TbPlayerTrackPrevFilled />
          </button>
          <button
            className={`join-item btn bg-muted-foreground border-none hover:bg-muted-foreground/50 ${currentPage == TotalPages ? "btn-disabled" : ""}`}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <TbPlayerTrackNextFilled />
          </button>
        </div>
      </div>
      <div className="flex justify-start items-start px-4 mt-3 w-full gap-2">
        <div className="w-20 md:w-44">
          <div className="p-2 grid grid-cols-1 place-items-start w-fit bg-base-200 rounded-md h-[40rem] border border-base-content/20">
            {sportEvents.map((sport) => {
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
          {filteredSport.slice(StartIndex, EndIndex).map((sports, index) => {
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
      <div className="flex flex-wrap items-center justify-between px-4 gap-2 mt-10">
        <div className="">
          <h1 className=" text-3xl font-inter font-black uppercase">
            Upcoming <span className="text-warning">Events</span>
          </h1>
          <p className="font-inter  font-normal text-neutral-300 text-sm w-sm md:w-md lg:w-lg">
            Discover scheduled matches and special events.
          </p>
        </div>
        <div className="join gap-4">
          <button
            className={`join-item btn bg-muted-foreground border-none hover:bg-muted-foreground/50 ${currentPage2 === 0 ? "btn-disabled" : ""} `}
            onClick={() => setCurrentPage2(currentPage2 - 1)}
          >
            <TbPlayerTrackPrevFilled />
          </button>
          <button
            className={`join-item btn bg-muted-foreground border-none hover:bg-muted-foreground/50 ${currentPage2 === TotalPages2 ? "btn-disabled" : ""} `}
            onClick={() => setCurrentPage2(currentPage2 + 1)}
          >
            <TbPlayerTrackNextFilled />
          </button>
        </div>
      </div>
      <div className="flex justify-start items-start p-4 w-full gap-2">
        <div className="w-20 md:w-44">
          <div className="p-2 grid grid-cols-1 place-items-start w-fit bg-base-200 rounded-md h-[40rem] border border-base-content/20">
            {sportEvents.map((sport) => {
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
          {filteredSport
            .slice(StartIndex2, EndIndex2)
            .map((filteredSport, index) => {
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
