'use client'
import { useState,useEffect,useRef } from "react"
import { FaBell } from "react-icons/fa"
import { Sparkles } from "lucide-react"
import { useAlerts } from "@/app/lib/aiclient"
import { useSession } from "next-auth/react"
export default function AlertsPanel(){
   const {data:session}=useSession()
   const [open,setOpen]=useState(false)
   const {alerts,loading,fetchAlerts}=useAlerts()
   const ref=useRef(null)
   useEffect(()=>{
    if(open) fetchAlerts()
   },[open])
   useEffect(()=>{
    const handler=(e)=>{
        if(ref.current&&!ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown',handler)
    return()=>document.removeEventListener('mousedown',handler)
   },[])
   if(!session) return null
   return(
    <div className="relative" ref={ref}>
        <button className="btn rounded-full p-2.5 border-base-content/20 relative"
        onClick={()=>setOpen(o=>!o)}
        >
            <FaBell className="size-4.5"/>
            {alerts.length>0&&(
                <span className="absolute -top-1 -right-1 size-4 bg-warning rounded-full text-[10px] font-bold text-base-100 flex items-center justify-center">
                    {alerts.length>9?'9+':alerts.length}
                </span>
            )}
        </button>
        {open&&(
            <div className="absolute right-0 top-12 w-80 max-h-96 bg-base-200 border border-base-content/20 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-base-content/10">
                    <Sparkles className="size-4 text-warning"/>
                    <p className="font-poppins font-semibold text-sm">Notifications</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading&&(
                        <div className="flex justify-center items-center p-6">
                            <span className="loading loading-spinner loading-sm text-warning"/>
                        </div>
                    )}
                    {!loading&&alerts.length===0&&(
                        <p className="text-xs text-base-content/40 font-inter text-center p-6">
                            No notifications yet
                        </p>
                    )}
                    {!loading&&alerts.map((alert,i)=>(
                        <div key={i} className="px-4 py-3 border-b border-base-content/5 hover:bg-base-300 transition-colors">
                            <p className="font-poppins font-semibold text-xs">{alert.title||'Notification'}</p>
                            <p className="font-inter text-xs text-base-content/60 mt-0.5 line-clamp-2">
                                {alert.summary||alert.content?.summary||''}
                            </p>
                            <p className="font-inter text-[10px] text-base-content/30 mt-1">
                                {alert.createdAt?new Date(alert.createdAt).toLocaleString():''}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="px-4 py-2 border-t border-base-content/10">
                    <button className="btn btn-xs btn-ghost font-poppins w-full"
                    onClick={()=>fetchAlerts()}
                    >
                        Refresh
                    </button>
                </div>
            </div>
        )}
    </div>
   )
}
