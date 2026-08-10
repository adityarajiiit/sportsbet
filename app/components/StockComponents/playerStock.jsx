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
import PlayerStats from "./Stats/PlayerStats";
import PriceHistoryGraph from "./PriceHistoryGraph";
import io from "socket.io-client";
import CommentSection from "@/components/blocks/ChatComponents/CommentSection";
import axios from "axios";
import { useUserStore } from "@/app/store/useUserStore.jsx";
import { toast } from "sonner";
import PlayerTradeControls from "@/components/blocks/stockDialogs/Playertradecontrols";
import Loading from "@/app/loading";
function PlayerStock({ player }) {
  const [socket, setSocket] = useState(null);
  const session = useSession();
  const { refreshUser } = useUserStore();
  const [buyDialog, setBuyDialog] = useState(false);
  const [sellDialog, setSellDialog] = useState(false);
  const [stockholder, setstockHolder] = useState({
    shares: 0,
    averageprice: 0,
  });
  const [buyStopLoss, setBuyStopLoss] = useState(false);
  const [buyTakeProfit, setBuyTakeProfit] = useState(false);
  const [sellStopLoss, setSellStopLoss] = useState(false);
  const [sellTakeProfit, setSellTakeProfit] = useState(false);
  const [playerStock, setPlayerStock] = useState({
    price: player.price,
    volume: player.volume,
    marketCapital: player.marketCapital,
    PriceChange: player.PriceChange,
    shares: player.stock[0]?.shares || 1000,
  });
  const [comments, setComments] = useState([]);
  const [noOfStocks, setnoOfStocks] = useState(0);
  const [noOfStocksSell, setnoOfStocksSell] = useState(0);
  const [ExitPrice, setExitPrice] = useState(0);
  const [StopLossPrice, setStopLossPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/comments/getcomments`,
      {
        params: {
          pagetype: "player",
          playerId: player.id,
          parentcommentId: null,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const result = response.data;
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
      pagetype: "player",
      playerId: player.id,
      parentcommentId: parentId || null,
      email: session?.data?.user?.email,
      message,
      replyto,
    };

    socket.emit("new-comment", { data });
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
        stocktype: "player",
        stockId: player.stock[0]?.id,
        playerId: player.id,
        userId: session?.data?.user?.id,
        type: "buy",
        price: parseFloat(price),
        shares: parseInt(shares),
        total: parseFloat(total),
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/stocks/newtrans`,
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
        setStopLoss("buy", stockholderId);
      }
      if (buyTakeProfit) {
        setTakeprofit("buy", stockholderId);
      }
      console.log(response.data);
      toast.success(
        `Bought ${shares} shares of ${player.name} at ₹${parseFloat(price).toFixed(2)}`,
      );
      refreshUser();
      getStockholder();
      document.getElementById("Buy_stock").close();
      setnoOfStocks(0);
    } catch (e) {
      toast.error(e.message);
    }
  };
  const getStockholder = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/stocks/stockholder`,
      {
        params: {
          stockId: player.stock[0]?.id,
        },
        withCredentials: true,
      },
    );
    if (response.data && !response.data.error) {
      const data = {
        shares: response.data.shares || 0,
        averageprice: response.data.averageprice || 0,
      };
      console.log(data);
      setstockHolder(data);
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
        stocktype: "player",
        stockId: player.stock[0]?.id,
        playerId: player.id,
        userId: session?.data?.user?.id,
        type: "sell",
        price: parseFloat(price),
        shares: parseInt(shares),
        total: parseFloat(total),
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/stocks/selltrans`,
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
        `Sold ${shares} shares of ${player.name} at ₹${parseFloat(price).toFixed(2)}`,
      );
      refreshUser();
      getStockholder();
      document.getElementById("sell_stocks").close();
      setnoOfStocksSell(0);
      const stockholderId =
        response.data?.stockholderId ||
        response.data?.transaction?.stockholderId;
      if (sellStopLoss) {
        setStopLoss("sell", stockholderId);
      }
      if (sellTakeProfit) {
        setTakeprofit("sell", stockholderId);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };
  const setStopLoss = async (type, stockholderId) => {
    if (!session?.data?.user) {
      toast.error("Please login to set stop loss");
      return;
    }
    const data = {
      pagetype: "player",
      stockholderId: stockholderId,
      condition: {
        type: "sl",
        order: type,
        value: StopLossPriceRef.current,
      },
    };
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/alerts/newalert`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    );
    console.log(response.data);
  };
  const setTakeprofit = async (type, stockholderId) => {
    if (!session?.data?.user) {
      toast.error("Please login to set take profit");
      return;
    }
    const data = {
      pagetype: "player",
      stockholderId: stockholderId,
      condition: {
        type: "tp",
        order: type,
        value: ExitPriceRef.current,
      },
    };
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/alerts/newalert`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    );
    console.log(response.data);
  };
  const getPlayer = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/others/getplayer`,
      {
        params: {
          id: player.id,
        },
      },
    );
    const pdata = response.data;
    console.log(pdata);
    setPlayerStock((prev) => ({
      ...prev,
      price: pdata.stock?.[0].price,
      marketCapital: pdata.stock[0].total,
      shares: pdata.stock?.[0].shares,
    }));
  };
  useEffect(() => {
    setIsLoading(true);
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    );
    setSocket(socketInstance);
    socketInstance.on("connect", () => {
      socketInstance.emit("join-room", player.id);
    });
    socketInstance.on("stock-update", (data) => {
      if (data.stockId === player.stock[0]?.id) {
        const updatedstock = data.stock;
        setPlayerStock((prev) => ({
          ...prev,
          price: updatedstock.price,
          shares: updatedstock.shares,
          marketCapital: updatedstock.total,
        }));
        getStockholder();
      }
    });

    socketInstance.on("comment-added", (data) => {
      if (data.playerId !== player.id) return;
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
      socketInstance.emit("leave-room", player.id);
      socketInstance.off("stock-update");
      socketInstance.off("comment-added");
      socketInstance.off("connect");
      socketInstance.disconnect();
    };
  }, [player.id]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.allSettled([getPlayer(), getComments(), getStockholder()]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [player.id]);
  const items = [
    {
      title: "Market Price",
      description: playerStock.price.toFixed(3),
      icon: (
        <IoMdPricetags className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: growth,
    },

    {
      title: "Volume",
      description: playerStock.volume,
      icon: (
        <FaUsers className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: volume,
    },
    {
      title: "Market Capital",
      description: playerStock.marketCapital.toFixed(3),
      icon: (
        <TrendingUp className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: coins,
    },
    {
      title: "Price Change (1D)",
      description: playerStock.PriceChange.toFixed(3),
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
            Player Info
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-start md:justify-between items-center  w-full ">
            <div className="flex flex-col sm:flex-row justify-start items-center gap-4 w-full">
              <Image
                src={player.image}
                alt={player.name}
                width={400}
                height={400}
                className="input size-30 bg-muted-foreground rounded-full object-cover p-1 border-none"
              />
              <div className="flex-1 flex flex-col justify-center items-center gap-2 w-10/12">
                <div className="flex flex-col items-center sm:items-start gap-1 w-full">
                  <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4">
                    {player.name}
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 w-full">
                  <div className="font-medium font-inter p-2.5 rounded-full bg-base-200 w-full border border-base-content/10 text-sm px-4 flex items-center gap-2">
                    <FaFlag className="size-3" />
                    {player.sport}
                  </div>
                </div>
              </div>
            </div>
            <PlayerTradeControls
              player={player}
              playerStock={playerStock}
              stockholder={stockholder}
              buyDialog={buyDialog}
              setBuyDialog={setBuyDialog}
              sellDialog={sellDialog}
              setSellDialog={setSellDialog}
              noOfStocks={noOfStocks}
              setnoOfStocks={setnoOfStocks}
              noOfStocksSell={noOfStocksSell}
              setnoOfStocksSell={setnoOfStocksSell}
              ExitPrice={ExitPrice}
              setExitPrice={setExitPrice}
              StopLossPrice={StopLossPrice}
              setStopLossPrice={setStopLossPrice}
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
              <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                  Role
                </legend>
                <p className="px-3 font-poppins font-medium text-sm">
                  {player.role}
                </p>
              </fieldset>
              <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                  Gender
                </legend>
                <p className="px-3 font-poppins font-medium text-sm">
                  {player.gender || "N/A"}
                </p>
              </fieldset>
              {player.sport === "Cricket" ? (
                <>
                  <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                    <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                      Team
                    </legend>
                    <p className="px-3 font-poppins font-medium text-sm">
                      {player.teamname}
                    </p>
                  </fieldset>
                  <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                    <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                      Country
                    </legend>
                    <p className="px-3 font-poppins font-medium text-sm">
                      {player.country || player.teamname || "N/A"}
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
                      Country
                    </legend>
                    <p className="px-3 font-poppins font-medium text-sm">
                      England
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
        <PriceHistoryGraph stockId={player.stock?.[0]?.id} />
        <PlayerStats player={player} />
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
export default PlayerStock;
