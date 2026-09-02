"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { IoMdPricetags } from "react-icons/io";
import { TbCoinRupeeFilled } from "react-icons/tb";
import { FaUsers } from "react-icons/fa";
import { TrendingUp } from "lucide-react";
import { FaInfo } from "react-icons/fa";
import { FaFlag } from "react-icons/fa";
import { useState } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { useSession } from "next-auth/react";
import coins from "@/public/coins.png";
import growth from "@/public/gowth.jpg";
import bar from "@/public/bar.jpg";
import volume from "@/public/volume.png";
import TeamStats from "./Stats/teamStat";
import CommentSection from "@/components/blocks/ChatComponents/CommentSection";
import PriceHistoryGraph from "./PriceHistoryGraph";
import io from "socket.io-client";

import axios from 'axios'
import { useUserStore } from "@/app/store/useUserStore.jsx";
import { toast } from "sonner";
import TeamTradeControls from "@/components/blocks/stockDialogs/teamTradeControl";
import Loading from "@/app/loading";

const apiurl='/api-backend'
function TeamStock({ team }) {
  const [socket, setSocket] = useState(null);
  const session = useSession();
  const { refreshUser } = useUserStore();
  const [comments, setComments] = useState([]);
  const [stockholder, setstockHolder] = useState({
    shares: 0,
    averageprice: 0,
  });
  const [buyTakeProfit, setBuyTakeProfit] = useState(false);
  const [buyStopLoss, setBuyStopLoss] = useState(false);
  const [sellTakeProfit, setSellTakeProfit] = useState(false);
  const [sellStopLoss, setSellStopLoss] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamStock, setTeamStock] = useState({
    price: team.price,
    volume: team.volume,
    marketCapital: team.marketCapital,
    PriceChange: team.PriceChange,
    shares: team.stock?.[0]?.shares || 1000,
  });
  const [noOfStocks, setnoOfStocks] = useState(0);
  const [noOfStocksSell, setnoOfStocksSell] = useState(0);
  const [ExitPrice, setExitPrice] = useState(0);
  const [StopLossPrice, setStopLossPrice] = useState(0);
  const ExitPriceRef = useRef(0);
  const StopLossPriceRef = useRef(0);
  useEffect(() => {
    ExitPriceRef.current = ExitPrice;
  }, [ExitPrice]);
  useEffect(() => {
    StopLossPriceRef.current = StopLossPrice;
  }, [StopLossPrice]);
  const getComments = async () => {
    const response = await axios.get(
      `${apiurl}/api/comments/getcomments`,
      {
        params: {
          pagetype: "team",
          teamId: team.id,
          parentcommentId: null,
        },
      }
    );
    const result = response.data;
    if(!Array.isArray(result)) return
    const allcomments = result.map((comment) => {
      return {
        author: comment.user.name,
        id: comment.id,
        date: new Date(comment.createdAt).toLocaleString(),
        chat: comment.message,
        replies: comment.replies,
        replyto: comment.replyto || null,
      };
    });
    setComments(allcomments);
    console.log(result);
  };
  const newComment = async (message, parentId, replyto) => {
    if (!session?.data?.user) {
      toast.error("Please login to comment");
      return;
    }
    const data = {
      pagetype: "team",
      teamId: team.id,
      parentcommentId: parentId || null,
      email: session?.data?.user?.email,
      message,
      replyto,
    };

    socket.emit("new-comment", { data });
  };
  const getStockholder = async () => {
    const response = await axios.get(
      `${apiurl}/api/stocks/stockholder`,
      {
        params: {
          stockId: team.stock?.[0]?.id,
        },
        withCredentials: true,
      },
    );
    if (response.data && !response.data.error) {
      setstockHolder({
        shares: response.data.shares || 0,
        averageprice: response.data.averageprice || 0,
      });
    }
  };
  const newBuytransaction = async (shares, price, total) => {
    if (!session?.data?.user) {
      toast.error("Please login to buy stocks");
      return;
    }
    if (parseInt(shares) <= 0) {
      toast.error("Please select at least 1 share");
      return;
    }
    try {
      const data = {
        stocktype: "team",
        stockId: team.stock?.[0]?.id,
        teamId: team.id,
        userId: session?.data?.user?.id,
        type: "buy",
        price: parseFloat(price),
        shares: parseInt(shares),
        total: parseFloat(total),
      };
      if(buyStopLoss&&Number(StopLossPriceRef.current)<=0){
        toast.error("Stop loss must be greater than 0")
        return
      }
      if(buyTakeProfit&&Number(ExitPriceRef.current)<=0){
        toast.error("Take profit must be greater than 0")
        return
      }
      if(buyStopLoss&&buyTakeProfit){
        if(Number(StopLossPriceRef.current)>=Number(ExitPriceRef.current)){
          toast.error("Stop loss should be less than take profit")
          return
        }
      }
      const response = await axios.post(
        `${apiurl}/api/stocks/newtrans`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (response.data?.error) {
        toast.error(response.data.error);
        return;
      }
      const stockholderId =
        response.data?.stockholderId ||
        response.data?.transaction?.stockholderId;
      if (buyStopLoss) {
        await setStopLossAlert("buy", stockholderId);
      }
      if (buyTakeProfit) {
        await setTakeprofitAlert("buy", stockholderId);
      }
      console.log(response.data);
      toast.success(
        `Bought ${shares} shares of ${team.name} at ₹${parseFloat(price).toFixed(2)}`,
      );
      refreshUser();
      getStockholder();
      document.getElementById("Buy_stock").close();
      setnoOfStocks(0);
      setBuyTakeProfit(false);
      setBuyStopLoss(false);
      setExitPrice(0);
      setStopLossPrice(0);
    } catch (e) {
      toast.error(e.message);
    }
  };
  const newSelltransaction = async (shares, price, total) => {
    if (!session?.data?.user) {
      toast.error("Please login to sell stocks");
      return;
    }
    if (parseInt(shares) <= 0) {
      toast.error("Please select at least 1 share to sell");
      return;
    }
    if (parseInt(shares) > stockholder.shares) {
      toast.error(`You only own ${stockholder.shares} shares`);
      return;
    }
    try {
      const data = {
        stocktype: "team",
        stockId: team.stock?.[0]?.id,
        teamId: team.id,
        userId: session?.data?.user?.id,
        type: "sell",
        price: parseFloat(price),
        shares: parseInt(shares),
        total: parseFloat(total),
      };
      if (sellStopLoss && Number(StopLossPriceRef.current) <= 0) {
        toast.error("Stop loss must be greater than 0");
        return;
      }
      if (sellTakeProfit && Number(ExitPriceRef.current) <= 0) {
        toast.error("Take profit must be greater than 0");
        return;
      }
      if (sellStopLoss && sellTakeProfit) {
        if (Number(StopLossPriceRef.current) >= Number(ExitPriceRef.current)) {
          toast.error("Stop loss should be less than take profit");
          return;
        }
      }
      const response = await axios.post(
        `${apiurl}/api/stocks/selltrans`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (response.data?.error) {
        toast.error(response.data.error);
        return;
      }
      console.log(response.data);
      toast.success(
        `Sold ${shares} shares of ${team.name} at ₹${parseFloat(price).toFixed(2)}`,
      );
      refreshUser();
      getStockholder();
      document.getElementById("sell_stocks").close();
      setnoOfStocksSell(0);
      const stockholderId =
        response.data?.stockholderId ||
        response.data?.transaction?.stockholderId;
      if (sellStopLoss) {
        await setStopLossAlert("sell", stockholderId);
      }
      if (sellTakeProfit) {
        await setTakeprofitAlert("sell", stockholderId);
      }
      setSellTakeProfit(false);
      setSellStopLoss(false);
      setExitPrice(0);
      setStopLossPrice(0);
    } catch (e) {
      toast.error(e.message);
    }
  };
  const setStopLossAlert = async (type, stockholderId) => {
    const data = {
      pagetype: "team",
      stockholderId: stockholderId,
      condition: {
        type: "sl",
        order: type,
        value: Number(StopLossPriceRef.current),
      },
    };
    await axios.post(
      `${apiurl}/api/alerts/newalert`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    );
  };
  const setTakeprofitAlert = async (type, stockholderId) => {
    const data = {
      pagetype: "team",
      stockholderId: stockholderId,
      condition: {
        type: "tp",
        order: type,
        value: Number(ExitPriceRef.current),
      },
    };
    await axios.post(
      `${apiurl}/api/alerts/newalert`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    );
  };
  useEffect(() => {
    setIsLoading(true);
    const socketInstance = io(
       (process.env.NEXT_PUBLIC_SOCKET_URL || 'https://sportsbet-betting.onrender.com') ,
    );
    setSocket(socketInstance);
    socketInstance.on("connect", () => {
      socketInstance.emit("join-room", team.id);
    });
    socketInstance.on("stock-update", (data) => {
      if (data.stockId === team.stock?.[0]?.id) {
        const updatedstock = data.stock;
        setTeamStock((prev) => ({
          ...prev,
          price: updatedstock.price,
          shares: updatedstock.shares,
          marketCapital: updatedstock.total,
        }));
        getStockholder();
      }
    });
    socketInstance.on("comment-added", (data) => {
      if (data.teamId !== team.id) return;
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
    return () => {
      socketInstance.emit("leave-room", team.id);
      socketInstance.off("stock-update");
      socketInstance.off("comment-added");
      socketInstance.off("connect");
      socketInstance.disconnect();
    };
  }, [team.id]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.allSettled([getComments(), getStockholder()]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [team.id]);
  const items = [
    {
      title: "Market Price",
      description: Number(teamStock.price || 0).toFixed(2),
      icon: (
        <IoMdPricetags className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: growth,
    },

    {
      title: "Volume",
      description: teamStock.volume,
      icon: (
        <FaUsers className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: volume,
    },
    {
      title: "Market Capital",
      description: Number(teamStock.marketCapital || 0).toFixed(2),
      icon: (
        <TrendingUp className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: coins,
    },
    {
      title: "Price Change (1D)",
      description: Number(teamStock.PriceChange || 0).toFixed(2),
      icon: (
        <TbCoinRupeeFilled className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: bar,
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full bg-base-300/50 rounded-xl p-2 sm:p-8 overflow-y-auto">
      <div className="flex flex-col justify-center md:justify-start items-center gap-4 w-full border px-2 py-6 sm:px-3 rounded-2xl border-base-content/20">
        <div className="w-full flex flex-col bg-base-300 p-3 sm:px-6 sm:pt-6 rounded-xl border border-base-content/10 justify-center md:items-start items-center gap-2 py-6">
          <p className="uppercase font-poppins font-bold flex items-center gap-2">
            <FaInfo className="size-6 p-1.5 bg-info-content rounded-full" />
            team Info
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-start md:justify-between items-center  w-full ">
            <div className="flex flex-col sm:flex-row justify-start items-center gap-4 w-full">
              <div className="p-1  border-2 bg-base-200 border-base-content/20 rounded-full z-1">
                <Image
                  src={team.image}
                  alt="team"
                  width={400}
                  height={400}
                  className="h-24 w-24 rounded-full object-cover"
                ></Image>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center gap-2 w-10/12">
                <div className="flex flex-col items-center sm:items-start gap-1 w-full">
                  <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4">
                    {team.name}
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 w-full">
                  <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4 flex items-center gap-2">
                    <FaFlag className="size-3" />
                    {team.sport}
                  </div>
                </div>
              </div>
            </div>

            <TeamTradeControls
              team={team}
              teamStock={teamStock}
              stockholder={stockholder}
              noOfStocks={noOfStocks}
              setnoOfStocks={setnoOfStocks}
              noOfStocksSell={noOfStocksSell}
              setnoOfStocksSell={setnoOfStocksSell}
              ExitPrice={ExitPrice}
              setExitPrice={setExitPrice}
              StopLossPrice={StopLossPrice}
              setStopLossPrice={setStopLossPrice}
              buyTakeProfit={buyTakeProfit}
              buyStopLoss={buyStopLoss}
              sellTakeProfit={sellTakeProfit}
              sellStopLoss={sellStopLoss}
              setBuyTakeProfit={setBuyTakeProfit}
              setBuyStopLoss={setBuyStopLoss}
              setSellTakeProfit={setSellTakeProfit}
              setSellStopLoss={setSellStopLoss}
              newBuytransaction={newBuytransaction}
              newSelltransaction={newSelltransaction}
            />
          </div>
          <div className="w-full flex flex-col justify-center md:items-start items-center">
            <p className="text-sm font-poppins font-semibold mt-4">
              More Information
            </p>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {team.sport === "Cricket" ? (
                <>
                  <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                    <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                      TeamId
                    </legend>
                    <p className="px-3 font-poppins font-medium text-sm">
                      {team.cricbuzzid}
                    </p>
                  </fieldset>
                  <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                    <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                      Latest Match
                    </legend>
                    <p className="px-3 font-poppins font-medium text-sm">
                      {team.prevmatch}
                    </p>
                  </fieldset>
                </>
              ) : (
                <>
                  <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                    <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                      Team
                    </legend>
                    <p className="px-3 font-poppins font-medium text-sm">
                      Individual
                    </p>
                  </fieldset>
                  <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                    <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                      Created At
                    </legend>
                    <p className="px-3 font-poppins font-medium text-sm">
                      29 Aug 2025
                    </p>
                  </fieldset>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row  justify-center md:justify-start items-center gap-4 w-full">
          <BentoGrid className="w-full ">
            {items.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={
                  i == 0 || i == 2 ? "₹" + item.description : item.description
                }
                header={item.header}
                icon={item.icon}
                image={item.image}
                className={
                  i === 1 || i === 2 ? "md:col-span-3" : "md:col-span-2"
                }
              />
            ))}
          </BentoGrid>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-4">
        <PriceHistoryGraph stockId={team.stock?.[0]?.id} />
        <TeamStats team={team} />
      </div>
      <div className="h-full w-full border border-base-content/10 rounded-xl mt-6 flex flex-col">
        <div className="p-3 border-b border-base-content/10">
          <p className="font-poppins text-sm font-semibold">Comments()</p>
        </div>
        <CommentSection
          comments={comments}
          newComment={newComment}
          variant="grow"
        />
      </div>
    </div>
  );
}

export default TeamStock;
