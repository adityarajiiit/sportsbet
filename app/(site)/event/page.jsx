"use client";
import LiveEvent from "@/app/components/EventComponents/Events";
import LiveEvent from "@/app/components/LiveEvents";
import { useThemeStore } from "@/app/store/useThemestore";
import { useState,useEffect } from "react";
import { io } from "socket.io-client"
import axios from "axios";

function Event() {
  const { theme } = useThemeStore();
   const [liveevents,setLiveevents]=useState([])
   const [upcomingevents,setUpcomingevents]=useState([])


useEffect(()=>{
      fetchMatches()
      const socket=io("http://localhost:4000")
      socket.on("connect",()=>{
        console.log("connected to socket server")
      })
      socket.on('match-update',(data)=>{
        
        if(data.topic==="live-matches"){
          console.log(data)
          setLiveevents(data.data)
        }
        else if(data.topic==="upcoming-matches"){
           console.log(data)
           setUpcomingevents(data.data)
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
  return (
    <div className="pt-20">
      <LiveEvent />
     
    </div>
  );
}

export default Event;
