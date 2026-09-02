"use client";
import React, { useState, useEffect } from "react";
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
import io from "socket.io-client";
import axios from "axios";
import Loading from "@/app/loading";
import NoDataState from "@/components/ui/NoDataState";
function LiveEvent() {
  const { selectedEvent, setSelectedEvent } = useSelectedEvent();
  const [liveevents, setLiveevents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sportEvents, setSportEvents] = useState([
    {
      icon: <MdOutlineAllInclusive className="size-4" />,
      events: [],
      title: "All",
    },
    {
      icon: <IoIosFootball className="size-4" />,
      events: [],
      title: "Football",
    },
    {
      icon: <BiSolidCricketBall className="size-4" />,
      events: [],
      title: "Cricket",
    },
    {
      icon: <FaFootballBall className="size-4" />,
      events: [],
      title: "Rugby",
    },
    {
      icon: <MdOutlineSportsMma className="size-4" />,
      events: [],
      title: "MMA",
    },
    {
      icon: <GiBoxingGlove className="size-4" />,
      events: [],
      title: "Boxing",
    },
    {
      icon: <MdSportsTennis className="size-4" />,
      events: [],
      title: "Tennis",
    },
    {
      icon: <SiF1 className="size-4" />,
      events: [],
      title: "F1",
    },
    {
      icon: <IoIosBasketball className="size-4" />,
      events: [],
      title: "Basketball",
    },
    {
      icon: <GiShuttlecock className="size-4" />,
      events: [],
      title: "Badminton",
    },
    {
      icon: <MdOutlineSportsKabaddi className="size-4" />,
      events: [],
      title: "Wrestling",
    },
    {
      icon: <FaVolleyball className="size-4" />,
      events: [],
      title: "Volleyball",
    },
    {
      icon: <FaBox className="size-4" />,
      events: [],
      title: "Other",
    },
  ]);
  useEffect(() => {
    const socket = io(
       (process.env.NEXT_PUBLIC_SOCKET_URL || 'https://sportsbet-betting.onrender.com') ,
    );
    socket.on("connect", () => {
      console.log("connected to socket server");
    });
    socket.on("match-update", (data) => {
      if (data.topic === "live-matches") {
        setLiveevents(data.matches || []);
        console.log(data);
      } else if (data.topic === "upcoming-matches") {
        setUpcomingEvents(data.matches || []);
        console.log(data);
      } else if (data.topic === "recent-matches") {
        setRecentEvents(data.matches || []);
        console.log(data);
      }
    });

    return () => {
      socket.off("match-update");
      socket.off("connect");
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    const loadEvents = async () => {
      try {
        await Promise.allSettled([
          fetchLiveMatches(),
          fetchUpcomingMatches(),
          fetchRecentMatches(),
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);
  useEffect(() => {
    const allmatches = [...liveevents, ...upcomingEvents, ...recentEvents];
    setSportEvents((sportsprev) => {
      const updatedSports = sportsprev.map((sport) => {
        if (sport.title === "All") {
          return { ...sport, events: allmatches };
        }
        if (sport.title === "Cricket") {
          return {
            ...sport,
            events: allmatches.filter(
              (m) => m.sportType === "Cricket" || !m.sportType,
            ),
          };
        }
        if (sport.title === "Football") {
          return {
            ...sport,
            events: allmatches.filter((m) => m.sportType === "Football"),
          };
        }
        return sport;
      });
      return updatedSports;
    });
  }, [liveevents, upcomingEvents, recentEvents]);

  const fetchLiveMatches = async () => {
    const response = await axios.get(
      `/api-backend/api/others/livematches`,
    );
    console.log(response.data);
    const matches = response.data.matches.map((match) => ({
      title: match.title,
      team1: match.team1.teamSName,
      team2: match.team2.teamSName,
      score1:
        match.scorecard?.team1Score?.inngs1?.runs !== undefined
          ? `${match.scorecard.team1Score.inngs1.runs}/${match.scorecard.team1Score.inngs1.wickets || "0"}(${match.scorecard.team1Score.inngs1.overs})`
          : "Yet to bat",
      score2:
        match.scorecard?.team2Score?.inngs1?.runs !== undefined
          ? `${match.scorecard.team2Score.inngs1.runs}/${match.scorecard.team2Score.inngs1.wickets || "0"}(${match.scorecard.team2Score.inngs1.overs})`
          : "Yet to bat",
      image1: cricket,
      image2: cricket,
      matchId: match.cricbuzzmatchId,
      status: match.status,
      date: new Date(match.start).toLocaleString(),
      type: "live",
      sportType: match.sportType || "Cricket",
    }));
    setLiveevents(matches);
  };
  const fetchUpcomingMatches = async () => {
    const response = await axios.get(
      `/api-backend/api/others/upcomingmatches`,
    );
    const matches = response.data.matches.map((match) => ({
      title: match.title,
      team1: match.team1.teamSName,
      team2: match.team2.teamSName,
      score1:
        match.scorecard?.team1Score?.inngs1?.runs !== undefined
          ? `${match.scorecard.team1Score.inngs1.runs}/${match.scorecard.team1Score.inngs1.wickets || "0"}(${match.scorecard.team1Score.inngs1.overs})`
          : "Not started yet",
      score2:
        match.scorecard?.team2Score?.inngs1?.runs !== undefined
          ? `${match.scorecard.team2Score.inngs1.runs}/${match.scorecard.team2Score.inngs1.wickets || "0"}(${match.scorecard.team2Score.inngs1.overs})`
          : "Not started yet",
      image1: cricket,
      image2: cricket,
      matchId: match.cricbuzzmatchId,
      status: match.status,
      date: new Date(match.start).toLocaleString(),
      type: "upcoming",
      sportType: match.sportType || "Cricket",
    }));
    console.log(matches);
    setUpcomingEvents(matches);
  };
  const fetchRecentMatches = async () => {
    const response = await axios.get(
      `/api-backend/api/others/recentmatches`,
    );
    const matches = response.data.matches.map((match) => ({
      title: match.title,
      team1: match.team1.teamSName,
      team2: match.team2.teamSName,
      score1:
        match.scorecard?.team1Score?.inngs1?.runs !== undefined
          ? `${match.scorecard.team1Score.inngs1.runs}/${match.scorecard.team1Score.inngs1.wickets || "0"}(${match.scorecard.team1Score.inngs1.overs})`
          : "N/A",
      score2:
        match.scorecard?.team2Score?.inngs1?.runs !== undefined
          ? `${match.scorecard.team2Score.inngs1.runs}/${match.scorecard.team2Score.inngs1.wickets || "0"}(${match.scorecard.team2Score.inngs1.overs})`
          : "N/A",
      image1: cricket,
      image2: cricket,
      matchId: match.cricbuzzmatchId,
      status: match.status,
      date: new Date(match.start).toLocaleString(),
      type: "recent",
      sportType: match.sportType || "Cricket",
    }));
    console.log(matches);
    setRecentEvents(matches);
  };

  console.log(selectedEvent);

  const [filter, setFilter] = useState("All");
  const filteredSport = sportEvents.filter((filtered) => {
    return filter === "All" || filter === filtered.title;
  });
  const allmatches = filteredSport.flatMap((sport) => sport.events);
  const NoOfEventPerPage = 12;
  const TotalPages = Math.ceil(allmatches.length / NoOfEventPerPage);
  const [currentPage, setCurrentPage] = useState(0);
  const StartIndex = currentPage * NoOfEventPerPage;
  const EndIndex = Math.min(StartIndex + NoOfEventPerPage, allmatches.length);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full py-4">
      <div className="w-full flex flex-wrap items-center justify-between px-4 mt-4">
        <div>
          <h1 className=" text-3xl font-inter font-black uppercase">
            Current <span className="text-warning">Events</span>
          </h1>
          <p className="font-inter  font-normal text-neutral-300 text-sm max-w-sm md:max-w-md lg:max-w-lg w-full">
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
      <div className="flex justify-start items-start px-4 mt-3 w-full gap-2 h-full">
        <div className="w-20 md:w-44">
          <div className="p-2 grid grid-cols-1 auto-rows-auto place-items-start w-fit bg-base-200 place-content-start rounded-md h-[40rem] border border-base-content/20">
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
        {allmatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2  w-full h-[40rem] overflow-y-auto p-2 bg-neutral-900 rounded-md border border-base-content/20">
            {allmatches.slice(StartIndex, EndIndex).map((event, index) => (
              <React.Fragment key={index}>
                {event.type === "live" || event.type === "recent" ? (
                  <LiveEventcard
                    title={event.title}
                    team1={event.team1}
                    team2={event.team2}
                    score1={event.score1}
                    score2={event.score2}
                    image1={event.image1}
                    image2={event.image2}
                    matchId={event.matchId}
                    status={event.status}
                    handleSelectedUser={() => {
                      setSelectedEvent(event);
                    }}
                  />
                ) : (
                  <UpcomingEventCard
                    title={event.title}
                    team1={event.team1}
                    team2={event.team2}
                    score1={event.score1}
                    score2={event.score2}
                    image1={event.image1}
                    image2={event.image2}
                    matchId={event.matchId}
                    status={event.status}
                    date={event.date}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <NoDataState
            title="No Events Found"
            description="There are no events available for the selected sport. Please check back later or try a different sport."
            className="!h-[40rem] flex items-center justify-center w-full"
          />
        )}
      </div>
    </div>
  );
}

export default LiveEvent;
