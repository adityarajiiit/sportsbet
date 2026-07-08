import { create } from "zustand";
import axios from "axios";

export const useUserStore=create((set)=>({
  user:null,
  walletBalance:0,
  refreshUser:async()=>{
    try{
      const response=await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/others/getuser`,{
        withCredentials:true
      })
      set({
        user:response.data,
        walletBalance:Number(response.data?.wallet?.balance||0)
      })
    }catch(e){
      set({user:null,walletBalance:0})
    }
  }
}))
