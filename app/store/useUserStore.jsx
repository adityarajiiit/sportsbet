import { create } from "zustand";
import axios from "axios";

export const useUserStore=create((set)=>({
  user:null,
  walletBalance:0,
  remindedMatchIds:new Set(),
  refreshUser:async()=>{
    try{
      const response=await axios.get(`/api-backend/api/others/getuser`,{
        withCredentials:true
      })
      set({
        user:response.data,
        walletBalance:Number(response.data?.wallet?.balance||0)
      })
    }catch(e){
      set({user:null,walletBalance:0})
    }
  },
  fetchReminders:async()=>{
    try{
      const res=await axios.get(`/api-backend/api/reminders/reminders`,{withCredentials:true})
      const ids=new Set(res.data?.reminders?.filter(r=>r.status==="pending"&&r.matchId).map(r=>r.matchId))
      set({remindedMatchIds:ids})
    }catch(e){}
  },
  addRemindedMatch:(matchId)=>set(s=>({remindedMatchIds:new Set([...s.remindedMatchIds,matchId])}))
}))
