"use client";
import React, { use } from "react";
import Image from "next/image";
import ScoreCard from "@/public/Score.png";
import cricket from "@/public/cricket.jpg";
import { useState, useEffect } from "react";
import OddsHistoryGraph from "@/app/components/EventComponents/OddsHistoryGraph";
import { HoverBorderGradient } from "@/components/ui/bg-gradient";
import { FaHourglassStart, FaHourglassEnd } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import axios from "axios";
import { useUserStore } from "@/app/store/useUserStore.jsx";
import { toast } from "sonner";
import CommentSection from "@/components/blocks/ChatComponents/CommentSection";
import BettingControls from "@/components/blocks/BetComponents/BettingControls";
import WinPredictionChart from "@/app/(site)/event/score/components/matrix.jsx";
import { TbShirtSport } from "react-icons/tb";
import Loading from "@/app/loading";

function EventScore({ params }) {
  params = use(params);
  const [buyamount, setBuyAmount] = useState(0);
  const [buyamount2, setBuyAmount2] = useState(0);
  const [ExitPrice, setExitPrice] = useState(0);
  const [StopLossPrice, setStopLossPrice] = useState(0);
  const [isstoplosschecked, setIsstoplosschecked] = useState(false);
  const [istakeprofitchecked, setIstakeprofitchecked] = useState(false);
  const [matchid, setMatchid] = useState("");
  const [comments, setComments] = useState([]);
  const [score, setScore] = useState({});
  const [socket, setSocket] = useState(null);
  const [matchbets, setMatchbets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();
  const { refreshUser, walletBalance } = useUserStore();

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    );
    setSocket(socket);
    socket.on("connect", () => {
      socket.emit("join-room", params.matchid);
    });
    socket.on("match-update", (data) => {
      const matchinfo = data?.data?.matchInfo;
      const matchscore = data?.data?.matchScore;
      if (matchinfo?.matchId === params.matchid) {
        setScore({
          start: new Date(matchinfo.startDate).toLocaleString(),
          end: new Date(matchinfo.endDate).toLocaleString(),
          team1: matchinfo.team1.teamSName,
          team2: matchinfo.team2.teamSName,
          score1:
            matchscore?.team1Score?.inngs1?.runs !== undefined
              ? `${matchscore.team1Score.inngs1.runs}/${matchscore.team1Score.inngs1.wickets || "0"}(${matchscore.team1Score.inngs1.overs})`
              : "Not played yet",
          score2:
            matchscore?.team2Score?.inngs1?.runs !== undefined
              ? `${matchscore.team2Score.inngs1.runs}/${matchscore.team2Score.inngs1.wickets || "0"}(${matchscore.team2Score.inngs1.overs})`
              : "Not played yet",
          status: matchinfo.status,
          stadium: matchinfo.venueInfo.ground,
          series: matchinfo.seriesName,
          matchstate: matchinfo.matchState,
          matchId: matchid,
        });
      }
    });
    socket.on("comment-added", (data) => {
      const receivedcomment = {
        author: data.name,
        id: data.id,
        date: new Date(data.createdAt).toLocaleString(),
        chat: data.message,
        replies: data.replies,
        replyto: data.replyto || null,
      };
      if (data.parentcommentId === null) {
        setComments((prevComments) => [...prevComments, receivedcomment]);
      } else {
        setComments((prevComments) => {
          const updatedComments = [...prevComments];
          const index = updatedComments.findIndex(
            (comment) => comment.id === data.parentcommentId,
          );
          if (index !== -1) {
            updatedComments[index] = {
              ...updatedComments[index],
              replies: [
                ...(updatedComments[index].replies || []),
                receivedcomment,
              ],
            };
          }
          return updatedComments;
        });
      }
    });
    socket.on("betting-update", (data) => {
      const oddsandamount = data.map((outcome) => ({
        id: outcome.teamId,
        odds: outcome.odds,
        amount: outcome.amount,
        name: outcome.name,
        matchbetId: outcome.matchbetId,
        matchoutcomesId: outcome.matchoutcomesId,
      }));
      setMatchbets(oddsandamount);
    });

    const loadInitialData = async () => {
      try {
        const fetchedScore = await fetchscore();
        await Promise.allSettled([
          getmatchId(),
          getComments(fetchedScore.id),
          getMatchbets(fetchedScore.id),
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    return () => {
      socket.emit("leave-room", params.matchid);
      socket.off("connect");
      socket.off("match-update");
      socket.off("comment-added");
      socket.off("betting-update");
      socket.disconnect();
    };
  }, [params.matchid]);

  const getmatchId = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/others/getmatchid`,
      { params: { cricbuzzmatchId: params.matchid } },
    );
    setMatchid(response.data.matchId);
  };

  const fetchscore = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/others/match/${params.matchid}`,
    );
    const data = response.data;
    setScore({
      start: new Date(data.start).toLocaleString(),
      end: new Date(data.end).toLocaleString(),
      team1: data.team1.teamSName,
      team2: data.team2.teamSName,
      score1:
        data.scorecard?.team1Score?.inngs1?.runs !== undefined
          ? `${data.scorecard.team1Score.inngs1.runs}/${data.scorecard.team1Score.inngs1.wickets || "0"}(${data.scorecard.team1Score.inngs1.overs})`
          : "Not played yet",
      score2:
        data.scorecard?.team2Score?.inngs1?.runs !== undefined
          ? `${data.scorecard.team2Score.inngs1.runs}/${data.scorecard.team2Score.inngs1.wickets || "0"}(${data.scorecard.team2Score.inngs1.overs})`
          : "Not played yet",
      status: data.status,
      stadium: data.stats.ground,
      series: data.title,
      matchstate: data.matchState,
      matchId: data.id,
    });
    return data;
  };

  const getComments = async (matchId) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/comments/getcomments`,
      {
        params: {
          pagetype: "match",
          matchId,
          parentcommentId: null,
        },
      },
      { headers: { "Content-Type": "application/json" } },
    );
    const allcomments = response.data.map((comment) => ({
      author: comment.user.name,
      id: comment.id,
      date: new Date(comment.createdAt).toLocaleString(),
      chat: comment.message,
      replies: comment.replies,
      replyto: comment.replyto || null,
    }));
    setComments(allcomments);
  };

  const newComment = async (message, parentId, replyto) => {
    if (!session?.data?.user) {
      toast.error("Please login to comment");
      return;
    }
    socket.emit("new-comment", {
      data: {
        pagetype: "match",
        matchId: score.matchId,
        parentcommentId: parentId || null,
        email: session?.data?.user?.email,
        message,
        replyto,
      },
    });
  };

  const getMatchbets = async (matchId) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/others/getmatchbets`,
      { params: { matchId } },
      { headers: { "Content-Type": "application/json" } },
    );
    const matchbetoutcomes = response.data.matchbetoutcomes;
    const oddsandamount = matchbetoutcomes.map((outcome) => ({
      id: outcome.teamId,
      odds: outcome.odds,
      amount: outcome.total,
      name: outcome.teamname,
      matchbetId: outcome.matchbetId,
      matchoutcomesId: outcome.id,
    }));
    setMatchbets(oddsandamount);
  };

  if (isLoading) {
    return <Loading />;
  }

  const newBet = async (team) => {
    if (!session?.data?.user) {
      toast.error("Please login to place bet");
      return;
    }
    if (!matchbets || matchbets.length < 2) {
      toast.error("Betting odds are not yet initialized for this match");
      return;
    }
    const data = {
      matchId: score.matchId,
      type: "full",
      matchbetId: matchbets[0].matchbetId,
      details: {},
      amount: team === "team1" ? buyamount : buyamount2,
      status: "pending",
      odds: team === "team1" ? matchbets[0].odds : matchbets[1].odds,
      matchoutcomeId:
        team === "team1"
          ? matchbets[0].matchoutcomesId
          : matchbets[1].matchoutcomesId,
    };
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/bets/newbet`,
        data,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      if (isstoplosschecked) await setStoploss(response.data.bet.id);
      if (istakeprofitchecked) await setTakeprofit(response.data.bet.id);
      refreshUser();
      toast.success("Bet placed successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const setStoploss = async (betId) => {
    if (StopLossPrice >= ExitPrice) {
      toast.error("Stop loss should be less than exit price");
      return;
    }
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/alerts/newalert`,
      {
        pagetype: "match",
        betId,
        condition: { type: "low", value: StopLossPrice, action: "sell" },
      },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );
  };

  const setTakeprofit = async (betId) => {
    if (ExitPrice <= StopLossPrice) {
      toast.error("Take profit should be greater than stop loss");
      return;
    }
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/alerts/newalert`,
      {
        pagetype: "match",
        betId,
        condition: { type: "high", value: ExitPrice, action: "sell" },
      },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      },
    );
  };

  return (
    <div className="p-4 pt-24">
      <h1 className="uppercase font-inter text-2xl font-bold">
        Event <span className="text-warning">score</span>
      </h1>
      <div className="flex justify-between items-center my-2">
        <div className="fieldset">
          <legend className="fieldset-legend font-poppins text-xs py-1">
            Start Time
          </legend>
          <p className="flex items-center gap-1.5 text-xs font-medium font-inter text-neutral-300 h-8 w-fit px-3 input border-none bg-muted-foreground rounded-md">
            <FaHourglassStart />
            {score.start}
          </p>
        </div>
        <div className="fieldset">
          <legend className="fieldset-legend font-poppins text-xs py-1">
            End Time
          </legend>
          <p className="flex items-center gap-1.5 text-xs font-medium font-inter text-neutral-300 h-8 w-fit px-3 input border-none bg-muted-foreground rounded-md">
            <FaHourglassEnd />
            {score.end}
          </p>
        </div>
      </div>
      <div className="lg:p-4 lg:bg-base-300 rounded-xl lg:border border-base-content/20">
        <div className="p-4 flex flex-col justify-center items-center relative gap-2">
          <Image
            src={ScoreCard}
            alt="score"
            className="lg:w-5xl h-[16rem] sm:h-[20rem] absolute top-0 object-center"
            width={1000}
            height={1000}
          />
          <div className="flex flex-col sm:p-6 p-1 pt-7 sm:pt-12 w-full md:max-w-5xl gap-2 justify-between h-[14rem] sm:h-[18rem] z-1">
            <div className="flex justify-between gap-4 items-center">
              <HoverBorderGradient className="bg-base-100 rounded-full p-1 px-4 w-full">
                <p className="flex items-center gap-2 text-xs font-medium font-poppins text-center w-full">
                  <span className="flex items-center gap-1.5 font-semibold text-info">
                    <TbShirtSport className="size-3.5" />
                    Match Name :
                  </span>
                  <span className="font-bold">{score.series}</span>
                </p>
              </HoverBorderGradient>
              <div className="flex justify-between items-center ">
                <div className="flex justify-center items-center gap-2 font-poppins font-semibold text-xs sm:text-base clip-custom w-24 h-8 bg-base-100/50 border-y border-base-content/20 backdrop-blur-sm">
                  <div className="inline-grid *:[grid-area:1/1] ml-2">
                    <div className="status status-error animate-ping"></div>
                    <div className="status status-error"></div>
                  </div>{" "}
                  {score.matchstate}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 -mt-1">
              <div className="flex justify-between items-center gap-2 sm:gap-4">
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="flex gap-3 items-center justify-center">
                    <Image
                      src={cricket}
                      alt="team"
                      className="size-8 sm:size-12 rounded-full"
                    />
                    <span className="font-bold text-sm sm:text-xl font-inter">
                      {score.team1}
                    </span>
                  </div>
                  <div className="p-1 px-1.5 sm:p-2 sm:px-3.5 backdrop-blur-lg rounded-xl flex items-center justify-center bg-[rgba(67,67,67,0.1)] shadow-[0px_0px_1px_0px_rgba(248,248,248,0.4)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]">
                    <span className="text-xs sm:text-xl lg:text-2xl font-black font-inter line-clamp-1">
                      {score.score1}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center font-bold text-3xl font-goldman">
                  :
                </div>
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="p-1 px-1.5 sm:p-2 sm:px-3.5 backdrop-blur-lg rounded-xl flex items-center justify-center bg-[rgba(67,67,67,0.1)] shadow-[0px_0px_1px_0px_rgba(248,248,248,0.4)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]">
                    <span className="text-xs sm:text-xl lg:text-2xl font-black font-inter line-clamp-1">
                      {score.score2}
                    </span>
                  </div>
                  <div className="flex gap-3 items-center justify-center">
                    <span className="font-bold text-sm sm:text-xl font-inter">
                      {score.team2}
                    </span>
                    <Image
                      src={cricket}
                      alt="team"
                      className="size-8 sm:size-12 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <p className="text-center font-medium font-inter text-sm">
                {score.stadium}
              </p>
              <p className="text-center font-medium font-inter text-xs -mt-2 text-neutral-300">
                {score.status}
              </p>
            </div>

            {[
              "Recent",
              "Complete",
              "Match Ended",
              "Abandoned",
              "Finished",
            ].includes(score.matchstate) ? (
              <div className="flex justify-center items-center w-full mt-2">
                <div className="badge badge-error p-4 w-full font-bold font-poppins text-sm rounded-md backdrop-blur-md bg-error/20 border border-error/50">
                  Match Completed - Betting Closed
                </div>
              </div>
            ) : (
              <BettingControls
                score={score}
                matchbets={matchbets}
                buyamount={buyamount}
                setBuyAmount={setBuyAmount}
                buyamount2={buyamount2}
                setBuyAmount2={setBuyAmount2}
                walletBalance={walletBalance}
                ExitPrice={ExitPrice}
                setExitPrice={setExitPrice}
                StopLossPrice={StopLossPrice}
                setStopLossPrice={setStopLossPrice}
                setIstakeprofitchecked={setIstakeprofitchecked}
                setIsstoplosschecked={setIsstoplosschecked}
                newBet={newBet}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <WinPredictionChart
          team1Name={score.team1}
          team2Name={score.team2}
          team1Amount={matchbets[0]?.amount}
          team2Amount={matchbets[1]?.amount}
        />

        <OddsHistoryGraph
          matchbetId={matchbets[0]?.matchbetId}
          team1Name={score.team1}
          team2Name={score.team2}
        />

        <div className="h-full w-full border border-base-content/10 rounded-xl md:col-span-2">
          <div className="p-3 border-b border-base-content/10">
            <p className="font-poppins text-sm font-semibold">Comments()</p>
          </div>
          <CommentSection
            comments={comments}
            newComment={newComment}
            variant="fixed"
          />
        </div>
      </div>
    </div>
  );
}

export default EventScore;
