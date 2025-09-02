"use client";
import React from "react";
import Image from "next/image";
import { IoMdPricetags } from "react-icons/io";
import { TbCoinRupeeFilled } from "react-icons/tb";
import { FaUsers } from "react-icons/fa";
import { TrendingUp } from "lucide-react";
import { FaInfo } from "react-icons/fa";
import { FaFlag } from "react-icons/fa";
import { useState } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

import coins from "@/public/coins.png";
import growth from "@/public/gowth.jpg";
import bar from "@/public/bar.jpg";
import volume from "@/public/volume.png";
import TeamStats from "./Stats/teamStat";
import TradeChart from "./chart";
function TeamStock({ team }) {
  const [noOfStocks, setnoOfStocks] = useState(0);
  const [noOfStocksSell, setnoOfStocksSell] = useState(0);
  const [ExitPrice, setExitPrice] = useState(0);
  const [StopLossPrice, setStopLossPrice] = useState(0);
  const items = [
    {
      title: "Market Price",
      description: team.price,
      icon: (
        <IoMdPricetags className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: growth,
    },

    {
      title: "Volume",
      description: team.volume,
      icon: (
        <FaUsers className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: volume,
    },
    {
      title: "Market Capital",
      description: team.marketCapital,
      icon: (
        <TrendingUp className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: coins,
    },
    {
      title: "Price Change (1D)",
      description: team.PriceChange,
      icon: (
        <TbCoinRupeeFilled className="size-8 text-warning p-2 bg-warning/15 rounded-full" />
      ),
      image: bar,
    },
  ];
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

            <div className="flex md:flex-col items-center justify-center md:justify-start gap-2 h-full">
              <button
                className="btn btn-active btn-info min-w-full sm:min-w-40 rounded-xl"
                onClick={() => document.getElementById("Buy_stock").showModal()}
              >
                Buy
              </button>
              <dialog id="Buy_stock" className="modal">
                <div className="modal-box">
                  <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                      ✕
                    </button>
                  </form>
                  <p className="pb-2 text-xs font-poppins">
                    Press ESC key or click on ✕ button to close
                  </p>
                  <h3 className="text-lg font-semibold font-poppins">
                    {team.name}
                  </h3>
                  <div className="badge badge-soft badge-info rounded-sm text-sm px-4">
                    {team.sport}
                  </div>
                  <p className="text-sm mt-2">Number of stocks</p>
                  <form action="" className="mt-4 flex flex-col gap-2">
                    <input
                      type="range"
                      min={0}
                      max="100"
                      className="range range-info"
                      value={noOfStocks}
                      onChange={(e) => setnoOfStocks(e.target.value)}
                    />
                    <div className="flex justify-between">
                      <p className="ml-2 text-base font-medium font-inter">
                        Number of stocks <br />
                        <span className="text-xl">{noOfStocks}</span>
                      </p>
                      <p className="ml-2 text-base font-medium font-inter">
                        Total amount <br />
                        <span className="text-xl">
                          &#8377;{noOfStocks * team.price}
                        </span>
                      </p>
                    </div>
                    <fieldset className="fieldset bg-base-100  rounded-box w-full border border-base-content p-4">
                      <legend className="fieldset-legend text-base font-poppins px-2">
                        Exit
                      </legend>
                      <label className="label">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="checkbox"
                        />
                        Take Profit
                      </label>
                      <p className="text-base font-semibold font-poppins flex justify-between w-full">
                        Price <span>₹{ExitPrice}</span>
                      </p>
                      <input
                        type="number"
                        min={0}
                        max="1000000"
                        step="5"
                        value={ExitPrice}
                        className="input input-info rounded-md w-full"
                        onChange={(e) => {
                          setExitPrice(e.target.value);
                        }}
                      />
                      <label className="label mt-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="checkbox"
                        />
                        Stop Loss
                      </label>
                      <p className="text-base font-semibold font-poppins flex justify-between w-full">
                        Price <span>₹{StopLossPrice}</span>
                      </p>
                      <input
                        type="number"
                        min={0}
                        max="1000000"
                        step="5"
                        value={StopLossPrice}
                        className="input input-info rounded-md w-full"
                        onChange={(e) => {
                          setStopLossPrice(e.target.value);
                        }}
                      />
                    </fieldset>

                    <button className="btn btn-info font-poppins text-base mt-1">
                      Buy
                    </button>
                  </form>
                </div>
              </dialog>
              <button
                className="btn btn-active btn-error min-w-full sm:min-w-40 rounded-xl"
                onClick={() =>
                  document.getElementById("sell_stocks").showModal()
                }
              >
                Sell
              </button>
              <dialog id="sell_stocks" className="modal">
                <div className="modal-box">
                  <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                      ✕
                    </button>
                  </form>
                  <p className="pb-2 text-xs font-poppins">
                    Press ESC key or click on ✕ button to close
                  </p>
                  <h3 className="text-lg font-semibold font-poppins">
                    {team.name}
                  </h3>
                  <div className="badge badge-soft badge-error rounded-sm text-sm px-4">
                    {team.sport}
                  </div>
                  <p className="text-sm mt-2">Number of stocks</p>
                  <form action="" className="mt-4 flex flex-col gap-2">
                    <input
                      type="range"
                      min={0}
                      max="100"
                      className="range range-error"
                      value={noOfStocksSell}
                      onChange={(e) => setnoOfStocksSell(e.target.value)}
                    />
                    <div className="flex justify-between">
                      <p className="ml-2 text-base font-medium font-inter">
                        Number of stocks <br />
                        <span className="text-xl">{noOfStocksSell}</span>
                      </p>
                      <p className="ml-2 text-base font-medium font-inter">
                        Total amount <br />
                        <span className="text-xl">
                          &#8377;{noOfStocksSell * team.price}
                        </span>
                      </p>
                    </div>
                    <fieldset className="fieldset bg-base-100  rounded-box w-full border border-base-content p-4">
                      <legend className="fieldset-legend text-base font-poppins px-2">
                        Exit
                      </legend>
                      <label className="label">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="checkbox"
                        />
                        Take Profit
                      </label>
                      <p className="text-base font-semibold font-poppins flex justify-between w-full">
                        Price <span>₹{ExitPrice}</span>
                      </p>
                      <input
                        type="number"
                        min={0}
                        max="1000000"
                        step="5"
                        value={ExitPrice}
                        className="input input- rounded-md w-full"
                        onChange={(e) => {
                          setExitPrice(e.target.value);
                        }}
                      />
                      <label className="label mt-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="checkbox"
                        />
                        Stop Loss
                      </label>
                      <p className="text-base font-semibold font-poppins flex justify-between w-full">
                        Price <span>₹{StopLossPrice}</span>
                      </p>
                      <input
                        type="number"
                        min={0}
                        max="1000000"
                        step="5"
                        value={StopLossPrice}
                        className="input input- rounded-md w-full"
                        onChange={(e) => {
                          setStopLossPrice(e.target.value);
                        }}
                      />
                    </fieldset>

                    <button
                      className="btn btn-error font-poppins text-base mt-1"
                      onClick={() =>
                        document.getElementById("sell_stocks").showModal()
                      }
                    >
                      Sell
                    </button>
                  </form>
                </div>
              </dialog>
            </div>
          </div>
          <div className="w-full flex flex-col justify-center md:items-start items-center">
            <p className="text-sm font-poppins font-semibold mt-4">
              More Information
            </p>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                  Position
                </legend>
                <p className="px-3 font-poppins font-medium text-sm">Striker</p>
              </fieldset>
              <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                  Gender
                </legend>
                <p className="px-3 font-poppins font-medium text-sm">Male</p>
              </fieldset>
              {team.sport === "Cricket" ? (
                <>
                  <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                    <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                      Cricbuzz TeamId
                    </legend>
                    <p className="px-3 font-poppins font-medium text-sm">
                      Individual
                    </p>
                  </fieldset>
                  <fieldset className="fieldset bg-base-200 border-base-content/10 rounded-full w-full border p-3">
                    <legend className="fieldset-legend px-2 font-poppins text-neutral-400 p-0">
                      Cricbuzz teamId
                    </legend>
                    <p className="px-3 font-poppins font-medium text-sm">
                      29 Aug 2025
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
        <TradeChart />
        <TeamStats team={team} />
      </div>
    </div>
  );
}

export default TeamStock;
