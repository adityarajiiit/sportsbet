"use client";
import React from "react";
import Image from "next/image";
import { FaBell } from "react-icons/fa";
import { FaFlag } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useUserStore } from "@/app/store/useUserStore";
function UpcomingEventCard({ title, team1, team2,  image1, image2, matchId,status,date }) {
  const session=useSession()
  const {remindedMatchIds,addRemindedMatch}=useUserStore()
  const notified=remindedMatchIds.has(matchId)
  const [notifying,setNotifying]=useState(false)
  const handleNotify=async()=>{
    if(!session?.data?.user){
      toast.error("Please login to set reminder")
      return
    }
    if(notified){
      return
    }
    setNotifying(true)
    try{
      const matchTime=new Date(date).getTime()
      const reminderTime=new Date(matchTime-(30*60*1000))
      if(reminderTime<=new Date()){
        toast.error("Match is too close to set reminder")
        return
      }
      await axios.post(`/api-backend/api/reminders/newreminder`,{
        matchId:matchId||null,
        message:`${title} starts in 30 minutes`,
        time:reminderTime.toISOString(),
        type:"match"
      },{
        withCredentials:true
      })
      toast.success(`Reminder set for 30 min before match`)
      addRemindedMatch(matchId)
    }catch(e){
      toast.error(e.message)
    }finally{
      setNotifying(false)
    }
  }
  return (
    <div className="p-5 flex flex-col justify-center items-center bg-base-200 gap-2 rounded-xl border border-neutral-content/5 h-[205px]">
      <div className="flex justify-between items-center gap-6 w-full">
        <h1 className="font-medium text-sm font-poppins text-neutral-200 flex gap-2 justify-center items-center shrink-0">
          <FaFlag className="size-3.5" />
          {title}
        </h1>
        <span className="font-medium text-xs font-inter text-neutral-300 flex gap-1 justify-center items-center">
          <MdEvent className="size-4" />
          <span className="line-clamp-1">{date}</span>
        </span>
      </div>
      <div className="flex justify-between items-center gap-4 w-full mt-2">
        <div className="flex items-center justify-center gap-3">
          <Image
            src={image1}
            alt={team1}
            className="h-6 w-6 sm:h-7 sm:w-7 rounded-md"
          ></Image>
          <div className="flex flex-col justify-center items-start ">
            <p className="text-sm sm:text-base font-semibold font-poppins">
              {team1}
            </p>
          </div>
        </div>
        <p className="text-sm sm:text-base font-goldman font-semibold">VS</p>
        <div className="flex items-center justify-center gap-3">
          <Image
            src={image2}
            alt={team2}
            className="h-6 w-6 sm:h-7 sm:w-7 rounded-md"
          ></Image>
          <div className="flex flex-col justify-center items-start">
            <p className="text-sm sm:text-base font-semibold font-poppins">
              {team2}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center items-center mt-2">
        <span className="font-poppins font-semibold text-xs line-clamp-2">{status}</span>
      </div>
      <button
        className={`btn rounded-full w-full mt-2 ${notified?"btn-success":"btn-warning"}`}
        onClick={handleNotify}
        disabled={notifying||notified}
      >
        <FaBell /> {notified ? "Reminder Set" : "Notify Me"}
        <FaBell /> {notifying?"Setting...":notified?"Reminder Set":"Notify Me"}
      </button>
      <div className="w-full flex justify-center items-center mt-2">
        <p className="font-poppins font-semibold text-sm">{status}</p>
      </div>
    </div>
  );
}

export default UpcomingEventCard;
