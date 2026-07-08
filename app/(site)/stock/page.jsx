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
import axios from "axios"
import {useEffect} from "react"
function Stocks() {
  const { selectedPlayer, selectedTeam } = useSelectedStock();
  const [searchPlayer, setSearchPlayer] = useState([])
  const [searchTeam, setSearchTeam] = useState([])
  const [CommentIndex, setCommentIndex] = useState(null);
  const [showReplies, setShowReplies] = useState(null);
  const [replyIndex, setReplyIndex] = useState(null);
  const selectedEntity = selectedPlayer || selectedTeam;
  const [teams,setTeams] = useState([])
  const [players,setPlayers] = useState([])
  useEffect(()=>{
    getPlayers()
    getTeams()
  },[])
  const [category, setcategory] = useState("Player");
  
  const getPlayers=async()=>{
    const response=await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/others/gettrendingplayers`)
    const players=response.data.map((player)=>{
      return {
        id:player.id,
        image:player.image||dummy,
        name:player.name,
        sport:"Cricket",
        price:player.stock[0].price,
        marketCapital:player.stock[0].total,
        volume:player.count||0,
        PriceChange:player.pricechange||0,
        role:player.position.name,
        teamname:player.teamName,
        career:[
          {
            type:player.career[0]?.type||"ODI",
            bowling:player.career[0]?.bowling||null,
            batting:player.career[0]?.batting||null,
          }
        ],
        stock:player.stock
      };
    })
    console.log(response.data)
    setPlayers(players)
  }
  const getTeams=async()=>{
    const response=await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/others/gettrendingteams`)
    const teams=response.data.map((team)=>{
      return{
        id:team.id,
        image:team.image||dummy,
        name:team.name,
        sport:"Cricket",
        price:team.stock[0].price,
        marketCapital:team.stock[0].total,
        volume:team.count||0,
        cricbuzzid:team.cricbuzzteamId,
        prevmatch:team.results[0].note||"No match played yet",
        PriceChange:team.pricechange||0,
        results:team.results,
        stock:team.stock
      }
    })
setTeams(teams)
    console.log(response.data)
  }
 
  const getSearchResults=async(query)=>{
    const response=await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/stocks/search`,
      {
        params:{
          q:query
        }
      },
    )
    const players=response.data.filter(result=>result.pagetype==="player").map((result)=>{
      return{
        id:result.playerId.$oid,
        image:result.player[0]?.image||dummy,
        name:result.name,
        sport:"Cricket",
        price:result.price,
        marketCapital:result.total,
        volume:result.volume||0,
        PriceChange:result.pricechange||0,
        role:result.player[0]?.position.name,
        teamname:result.player[0]?.teamName,
        career:[
          {
            type:result.player[0]?.career[0]?.type||"ODI",
            bowling:result.player[0]?.career[0]?.bowling||null,
            batting:result.player[0]?.career[0]?.batting||null,
          }
        ],
        stock:result.player[0]?.stock||[]
      }
    })
   const teams=response.data.filter(result=>result.pagetype==="team").map((result)=>{
    return{
      id:result.teamId.$oid,
      image:result.team[0]?.image||dummy,
      name:result.name,
      sport:"Cricket",
      price:result.price,
      marketCapital:result.total,
      volume:result.volume||0,
      PriceChange:result.pricechange||0,
      prevmatch:result.team[0]?.results[0]?.note||"No match played yet",
      cricbuzzid:result.team[0]?.cricbuzzteamId,
      results:result.team[0]?.results,
      stock:result.team[0]?.stock||[]
    }
   })
    setSearchPlayer(players)
    setSearchTeam(teams)
    console.log(response.data)
    console.log(players,teams)
  }
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
            onChange={(e)=>{
              if(e.target.value.length>3){
                getSearchResults(e.target.value)
              }
              else{
                setSearchPlayer([])
                setSearchTeam([])
              }
            }}
            placeholder="Search"
          />
          <kbd className="kbd kbd-sm">⌘</kbd>
          <kbd className="kbd kbd-sm">K</kbd>
        </label>
      </div>
      <div className="flex h-[calc(100vh-13rem)] overflow-hidden gap-4">
        <Sidebar players={
          searchPlayer.length>0?searchPlayer:players} category={category} teams={searchTeam.length>0?searchTeam:teams} />
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
      
    </div>
  );
}

export default Stocks;
