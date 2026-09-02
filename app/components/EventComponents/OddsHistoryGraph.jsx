"use client";
import React, { useEffect, useState } from "react"
import axios from "axios"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
const OddsHistoryGraph=({matchbetId,team1Name,team2Name,liveOdds})=>{
  const [data,setData]=useState([])
  const [loading,setLoading]=useState(true)
  
  useEffect(()=>{
    if(!matchbetId){
      setLoading(false)
      return
    }
    const fetchHistory=async()=>{
      try{
        const response=await axios.get(
          `/api-backend/api/others/oddshistory?matchbetId=${matchbetId}`
        )
        if(response.data.history){
          const groupedData={}
          response.data.history.forEach(item=>{
            const ts=new Date(item.timestamp).getTime()
            const bucket=Math.floor(ts/(5*60*1000))*(5*60*1000)
            const key=bucket.toString()
            if(!groupedData[key]){
              groupedData[key]={_ts:bucket}
            }
            if(item.teamname===team1Name){
              groupedData[key].team1=parseFloat(item.odds)
            }else{
              groupedData[key].team2=parseFloat(item.odds)
            }
          })
          const sorted=Object.values(groupedData).sort((a,b)=>a._ts-b._ts)
          let lastTeam1=null,lastTeam2=null
          const formattedData=sorted.map(point=>{
            if(point.team1!==undefined) lastTeam1=point.team1
            if(point.team2!==undefined) lastTeam2=point.team2
            return{
              time:new Date(point._ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
              team1:lastTeam1,
              team2:lastTeam2
            }
          }).filter(p=>p.team1!==null&&p.team2!==null)
          setData(formattedData)
        }
      }
      catch(error){
        console.error("Error fetching odds history",error)
      }
      finally{
        setLoading(false)
      }
    }
    fetchHistory()
  },[matchbetId,team1Name,team2Name,liveOdds])

  if(loading){
    return <div className="w-full h-[28rem] flex items-center justify-center text-gray-500 font-inter">Loading chart...</div>
  }

  return (
    <Card className="flex flex-col border-base-content/20 h-full min-h-[400px]">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-poppins">Odds History</CardTitle>
        <div className="flex justify-start items-center gap-2 font-poppins font-medium text-sm">
          Tracking dynamic odds over time
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center gap-6 pb-0 mt-6 relative w-full">
        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-500 font-inter z-10">No odds history available yet.</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data.length > 0 ? data : [{ time: '00:00', team1: 1, team2: 1 }, { time: '23:59', team1: 1, team2: 1 }]}>
            <defs>
              <linearGradient id="colorTeam1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTeam2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="var(--chart-3)" />
            <YAxis stroke="var(--chart-3)" domain={['auto', 'auto']} />
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="team1" name={team1Name || "Team 1"} stroke="var(--chart-1)" fillOpacity={1} fill="url(#colorTeam1)" />
            <Area type="monotone" dataKey="team2" name={team2Name || "Team 2"} stroke="var(--chart-2)" fillOpacity={1} fill="url(#colorTeam2)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default OddsHistoryGraph
