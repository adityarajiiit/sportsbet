"use client";
import React from "react";
import { RiTeamFill } from "react-icons/ri";
import { FaUserNinja } from "react-icons/fa";
import { useState } from "react";
import Sidebar from "@/app/components/StockComponents/sidebar";
import dummy from "@/public/mma.jpg";
import { IoSend } from "react-icons/io5";
import Image from "next/image";
import { IoSearch } from "react-icons/io5";
import { useSelectedStock } from "@/app/store/useSelectedStock.jsx";
import NoSelected from "@/app/components/StockComponents/NoSelected";
import PlayerStock from "@/app/components/StockComponents/playerStock";
import { FaReply } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { motion, AnimatePresence } from "motion/react";
import { FaCommentDots } from "react-icons/fa";
import TeamStock from "@/app/components/StockComponents/TeamStock";
import { useSelectedUser } from "@/app/store/useSelectedUser.jsx";
import NoSelected from "@/app/components/NoSelected";
import PlayerStock from "@/app/components/playerStock";
import axios from "axios"
import {useEffect} from "react"

function Stocks() {
  const { selectedPlayer, selectedTeam } = useSelectedStock();
  const [CommentIndex, setCommentIndex] = useState(null);
  const [showReplies, setShowReplies] = useState(null);
  const [replyIndex, setReplyIndex] = useState(null);
  const selectedEntity = selectedPlayer || selectedTeam;
  const teams = [
    {
      id: 1,
      image: dummy,
      name: "team 1",
      sport: "Cricket",
      price: 500,
      marketCapital: "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      results: [
        {
          round: "T20I",
          status: "Finished",
          note: "Pakistan won by 13 runs",
        },
      ],
      comments: [
        {
          author: "Jhon Doe",
          image: dummy,
          date: "13 Aug 2025",
          comment: "Hey there !!!",
          results: [
            {
              round: "T20I",
              status: "Finished",
              note: "Pakistan won by 13 runs",
            },
          ],
          replies: [
            {
              author: "Rajan",
              image: dummy,
              date: "29 Aug 2025",
              comment: "hello There!",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      image: dummy,
      name: "team2",
      sport: "Cricket",
      price: 500,
      marketCapital: "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      results: [
        {
          round: "T20I",
          status: "Finished",
          note: "Pakistan won by 13 runs",
        },
      ],
    },
    {
      id: 3,
      image: dummy,
      name: "Team 3",
      sport: "MMA",
      price: 500,
      marketCapital: "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      results: [
        {
          round: "T20I",
          status: "Finished",
          note: "Pakistan won by 13 runs",
        },
      ],
    },
  ];
  const players = [
    {
      id: 1,
      image: dummy,
      name: "Jhon Doe",
      sport: "Cricket",
      price: 500,
      marketCapital: "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      career: [
        {
          type: "T20",
          batting: {
            matches: 8,
            innings: 8,
            runs_scored: 311,
            highest_inning_score: 99,
            strike_rate: 112,
            average: 51.83,
          },
          bowling: null,
        },
      ],
    },
    {
      id: 2,
      image: dummy,
      name: "robert Doe",
      sport: "Cricket",
      price: 500,
      marketCapital: "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      career: [
        {
          type: "T20",
          bowling: {
            matches: 8,
            innings: 8,
            econ_rate: 6.13,
            wickets: 15,
            overs: 30,
            medians: 5,
          },
          batting: {
            matches: 8,
            innings: 8,
            runs_scored: 311,
            highest_inning_score: 99,
            strike_rate: 112,
            average: 51.83,
          },
        },
      ],
    },
    {
      id: 3,
      image: dummy,
      name: "jhonny Doe",
      sport: "Cricket",
      price: 500,
      marketCapital: "12,346",
      volume: "12,56,150",
      PriceChange: -1.3,
      career: [
        {
          type: "T20",
          bowling: {
            matches: 8,
            innings: 8,
            econ_rate: 6.13,
            wickets: 15,
            overs: 30,
            medians: 5,
          },
          batting: null,
        },
      ],
      comments: [
        {
          author: "Jhon Doe",
          image: dummy,
          date: "13 Aug 2025",
          comment: "Hey there",
          replies: [
            {
              author: "Rajan",
              image: dummy,
              date: "29 Aug 2025",
              comment:
                "hello!<div className=lg:p-4 lg:bg-base-300 rounded-xl lg:border border-base-content/20",
            },
          ],
        },
      ],
    },
  ];
  console.log(players[2]);
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
        <label className="input border-0 bg-muted-foreground rounded-lg">
          <IoSearch className="size-5" />
          <input
            type="search"
            className="grow placeholder:text-white"
            placeholder="Search"
          />
          <kbd className="kbd kbd-sm">⌘</kbd>
          <kbd className="kbd kbd-sm">K</kbd>
        </label>
      </div>
      <div className="flex h-[calc(100vh-13rem)] overflow-hidden gap-4">
        <Sidebar players={players} category={category} teams={teams} />
        <div className="w-full h-full">
          <div className={category === "Player" ? "block h-full" : "hidden"}>
            {selectedPlayer ? (
              <PlayerStock player={selectedPlayer} />
            ) : (
              <NoSelected />
            )}
          </div>

          <div className={category !== "Player" ? "block h-full" : "hidden"}>
            {selectedTeam ? <TeamStock team={selectedTeam} /> : <NoSelected />}
          </div>
        </div>
      </div>
      {selectedEntity && (
        <div>
          <div className="flex items-center gap-2 mt-4">
            <FaCommentDots className="size-5" />
            <p className="text-base font-poppins font-semibold">
              Comments({selectedEntity?.comments?.length || 0})
            </p>
          </div>

          <div className="join w-full my-3">
            <input
              type="text"
              className="input join-item w-full"
              placeholder="Type your comment here"
            />
            <button className="btn join-item bg-white text-black">
              <IoSend />
            </button>
          </div>

          <div className="mt-2 mb-2">
            {selectedEntity?.comments?.map((chat, index) => {
              const isReplying = CommentIndex === index;
              return (
                <div key={index} className="p-1 flex items-start gap-3 w-full">
                  <Image
                    src={chat.image}
                    className="size-8 rounded-full object-cover"
                    alt={chat.image}
                  />
                  <div className="flex flex-col items-start justify-center w-full">
                    <p className="text-sm font-inter text-neutral-300  font-medium">
                      {chat.author}{" "}
                      <span className="font-inter text-xs text-neutral-400 font-medium ml-1">
                        {chat.date}
                      </span>
                    </p>
                    <p className="font-inter text-sm font-medium">
                      {chat.comment}
                    </p>

                    <div className="mt-1 flex justify-center items-center gap-4">
                      <button
                        className="text-xs font-poppins text-info flex items-center gap-1 relative h-6"
                        onClick={() =>
                          setCommentIndex(isReplying ? null : index)
                        }
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {isReplying ? (
                            <motion.span
                              key="cancel"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.25 }}
                              className="flex items-center gap-1 "
                            >
                              <MdCancel /> Cancel
                            </motion.span>
                          ) : (
                            <motion.span
                              key="reply"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.25 }}
                              className="flex items-center gap-1 "
                            >
                              <FaReply /> Reply
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>

                      {chat.replies ? (
                        showReplies === index ? (
                          <p
                            className="relative text-xs font-poppins text-neutral-300"
                            onClick={() => setShowReplies(null)}
                          >
                            Show less replies
                          </p>
                        ) : (
                          <p
                            className="relative text-xs font-poppins text-neutral-300"
                            onClick={() => setShowReplies(index)}
                          >
                            Show all replies
                          </p>
                        )
                      ) : null}
                    </div>

                    {CommentIndex === index && (
                      <form action="" className="w-full mt-2">
                        <div className="join w-full">
                          <input
                            type="text"
                            className="input join-item w-full"
                            placeholder="Type your reply here"
                          />
                          <button className="btn join-item bg-white text-black">
                            <IoSend />
                          </button>
                        </div>
                      </form>
                    )}

                    {showReplies === index &&
                      chat.replies?.map((reply, replyIdx) => (
                        <div
                          key={replyIdx}
                          className="p-1 flex items-start gap-3 w-full mt-2"
                        >
                          <Image
                            src={reply.image}
                            className="size-8 rounded-full object-cover"
                            alt={reply.image}
                          />
                          <div className="flex flex-col items-start justify-center w-full">
                            <p className="text-sm font-inter text-neutral-300  font-medium">
                              {reply.author}{" "}
                              <span className="font-inter text-xs text-neutral-400 font-normal ml-1">
                                {reply.date}
                              </span>
                            </p>
                            <p className="font-inter text-sm font-medium">
                              {reply.comment}
                            </p>
                            {/* Nested Reply */}
                            <div className="mt-1 flex flex-col justify-center items-start w-full">
                              <button
                                className="text-xs font-poppins text-info flex items-center gap-1 relative h-6"
                                onClick={() =>
                                  setReplyIndex(
                                    replyIndex === replyIdx ? null : replyIdx
                                  )
                                }
                              >
                                <AnimatePresence mode="wait" initial={false}>
                                  {replyIndex === replyIdx ? (
                                    <motion.span
                                      key="cancel"
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 5 }}
                                      transition={{ duration: 0.25 }}
                                      className="flex items-center gap-1 "
                                    >
                                      <MdCancel /> Cancel
                                    </motion.span>
                                  ) : (
                                    <motion.span
                                      key="reply"
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 5 }}
                                      transition={{ duration: 0.25 }}
                                      className="flex items-center gap-1 "
                                    >
                                      <FaReply /> Reply
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </button>
                              {replyIndex === replyIdx && (
                                <form action="" className="w-full mt-1">
                                  <div className="join w-full">
                                    <input
                                      type="text"
                                      className="input join-item w-full"
                                      placeholder="Type your reply here"
                                    />
                                    <button className="btn join-item bg-white text-black">
                                      <IoSend />
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Stocks;
