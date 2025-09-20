"use client";
import React,{use} from "react";
import Image from "next/image";
import ScoreCard from "@/public/Score.png";
import cricket from "@/public/cricket.jpg";
import { useState } from "react";
import { useEffect } from "react";

import { IoSend } from "react-icons/io5";
import { HoverBorderGradient } from "@/components/ui/bg-gradient";
import { useSelectedEvent } from "@/app/store/useSelectedEvent";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { FaReply } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { FaHourglassStart } from "react-icons/fa";
import { FaHourglassEnd } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "next-auth/react";
import Avatar from 'react-avatar'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {io} from "socket.io-client";
import axios from "axios";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
function EventScore({params}) {
  params=use(params)
  const [buyamount, setBuyAmount] = useState(0);
  const [buyamount2, setBuyAmount2] = useState(0);
  const [ExitPrice, setExitPrice] = useState(0);
  const [StopLossPrice, setStopLossPrice] = useState(0);
  const[isstoplosschecked,setIsstoplosschecked]=useState(false)
  const[istakeprofitchecked,setIstakeprofitchecked]=useState(false)
  const [CommentIndex, setCommentIndex] = useState(null);
  const [showReplies, setShowReplies] = useState(null);
  const [replyIndex, setReplyIndex] = useState(null);
  const { selectedEvent } = useSelectedEvent();
  const [matchid,setMatchid]=useState("")
  const [usercomment,setUsercomment]=useState({
    null:""
  })
  const event = selectedEvent;
  const [comments,setComments]=useState([
    
  ])
  const [score,setScore]=useState({})
  const [socket,setSocket]=useState(null)
  const [matchbets,setMatchbets]=useState([])
  const session=useSession()

  useEffect(()=>{
    fetchscore()
    
    const socket=io("http://localhost:4000")
    setSocket(socket)
    socket.on("connect",()=>{
     
      
    })
    socket.on("match-update",(data)=>{
      console.log(data)
      const matchinfo=data?.data?.matchInfo
      const matchscore=data?.data?.matchScore
      if(matchinfo?.matchId===params.matchid){
        setScore({
          start:new Date(matchinfo.startDate).toLocaleString(),
          end:new Date(matchinfo.endDate).toLocaleString(),
          team1:matchinfo.team1.teamSName,
          team2:matchinfo.team2.teamSName,
          score1:matchscore?.team1Score?.inngs1?.runs!==undefined?
          `${matchscore.team1Score.inngs1.runs}/${matchscore.team1Score.inngs1.wickets||"0"}(${matchscore.team1Score.inngs1.overs})`: 
          "Not played yet",
          score2:matchscore?.team2Score?.inngs1?.runs!==undefined? 
          `${matchscore.team2Score.inngs1.runs}/${matchscore.team2Score.inngs1.wickets||"0"}(${matchscore.team2Score.inngs1.overs})`: 
          "Not played yet",
          status:matchinfo.status,
          stadium:matchinfo.venueInfo.ground,
          series:matchinfo.seriesName,
          matchstate:matchinfo.matchState,
          matchId:matchid
        })
      }
    })
  socket.on("comment-added",(data)=>{

  const receivedcomment={
    author:data.name,
    id:data.id,
    date:new Date(data.createdAt).toLocaleString(),
    chat:data.message,
    replies:data.replies,
    replyto:data.replyto||null
  }
  if(data.parentcommentId===null){
    setComments(prevComments=>[...prevComments,receivedcomment])
  }
  else{
    setComments(prevComments=>{
      const updatedComments=[...prevComments]
      const index=updatedComments.findIndex(comment=>comment.id===data.parentcommentId)
      if(index!==-1){
        updatedComments[index]={
          ...updatedComments[index],
          replies:[...(updatedComments[index].replies||[]),receivedcomment]
        }
      }
      return updatedComments
    });
  }
})
socket.on('betting-update',(data)=>{
  console.log(data)
  const oddsandamount=data.map((outcome)=>{
    return{
      id:outcome.teamId,
      odds:outcome.odds,
      amount:outcome.amount,
      name:outcome.name,
      matchbetId:outcome.matchbetId,
      matchoutcomesId:outcome.matchoutcomesId
    }
  })
  setMatchbets(oddsandamount)
})
    return()=>{
      socket.off("connect")
      socket.off("match-update")
      socket.disconnect()
    }
  },[])
  useEffect(()=>{
    if(score.matchId){
      getmatchId()
      getComments()
      getMatchbets()
    }
  },[score.matchId])
  const getmatchId=async()=>{
    const response=await axios.get("http://localhost:4000/api/others/getmatchid",{
      params:{
        cricbuzzmatchId:params.matchid
      }
    })
    setMatchid(response.data.matchId)
  }
  const fetchscore=async()=>{
    const response=await axios.get(`http://localhost:4000/api/others/match/${params.matchid}`)
  
    const data=response.data
    setScore({
      start:new Date(data.start).toLocaleString(),
      end:new Date(data.end).toLocaleString(),
      team1:data.team1.teamSName,
      team2:data.team2.teamSName,
       score1:data.scorecard?.team1Score?.inngs1?.runs!==undefined ?
          `${data.scorecard.team1Score.inngs1.runs}/${data.scorecard.team1Score.inngs1.wickets||"0"}(${data.scorecard.team1Score.inngs1.overs})` : 
          "Not played yet",
        score2:data.scorecard?.team2Score?.inngs1?.runs!==undefined? 
          `${data.scorecard.team2Score.inngs1.runs}/${data.scorecard.team2Score.inngs1.wickets||"0"}(${data.scorecard.team2Score.inngs1.overs})` : 
          "Not played yet",
        status:data.status,
        stadium:data.stats.ground,
        series:data.title,
        matchstate:data.matchState,
        matchId:data.id
    })
  }
  const getComments=async()=>{
    const response=await axios.get('http://localhost:4000/api/comments/getcomments',{
      params:{
        pagetype:"match",
        matchId:score.matchId,
        parentcommentId:null
      }
    },{
      headers:{
        "Content-Type":"application/json"
      }
    })
    const result=response.data
    const allcomments=result.map((comment)=>{
      return{
        author:comment.user.name,
        id:comment.id,
        date:new Date(comment.createdAt).toLocaleString(),
        chat:comment.message,
        replies:comment.replies,
        replyto:comment.replyto|setMatchbets(response.data)|null
      }
    })
    setComments(allcomments)
    console.log(result)
  }
  const newComment=async(message,parentId,replyto)=>{
    if(!session?.data?.user){
      alert("Please login to comment")
      return
    }
    const data={
      pagetype:"match",
      matchId:score.matchId,
      parentcommentId:parentId||null,
      email:session?.data?.user?.email,
      message,
      replyto
    }
    
    socket.emit('new-comment',{data})
  
  }
  const getMatchbets=async()=>{
    console.log("Hi")
      const response=await axios.get("http://localhost:4000/api/others/getmatchbets",{
        params:{
          matchId:score.matchId
        }
      },
    {
      headers:{
        "Content-Type":"application/json"
      }
    })
    console.log(response.data)
    const matchbets=response.data.matchbets
    const matchbetoutcomes=response.data.matchbetoutcomes
    const oddsandamount=matchbetoutcomes.map((outcome)=>{
      return{
        id:outcome.teamId,
        odds:outcome.odds,
        amount:outcome.total,
        name:outcome.teamname,
        matchbetId:outcome.matchbetId,
        matchoutcomesId:outcome.id
      }
    })
    setMatchbets(oddsandamount)
    console.log(oddsandamount)
  }
  const newBet=async(team)=>{
    if(!session?.data?.user){
      alert("Please login to place bet")
      return
    }
    const data={
      matchId:score.matchId,
      type:"full",
      matchbetId:matchbets[0].matchbetId,
      details:{},
      amount:team==="team1"?buyamount:buyamount2,
      status:"pending",
      odds:team==="team1"?matchbets[0].odds:matchbets[1].odds,
      matchoutcomeId:team==="team1"?matchbets[0].matchoutcomesId:matchbets[1].matchoutcomesId,
    }
    console.log(data)
    const response=await axios.post("http://localhost:4000/api/bets/newbet",data,{
      headers:{
        "Content-Type":"application/json"
      },
      withCredentials:true
    })
    if(isstoplosschecked){
      await setStoploss(response.data.bet.id)
    }
    if(istakeprofitchecked){
      await setTakeprofit(response.data.bet.id)
    }
    console.log(response.data)
  }
  const setStoploss=async (betId)=>{
      if(StopLossPrice>=ExitPrice){
        alert("Stop loss should be less than exit price")
        return
      }
      const stoploss=await axios.post("http://localhost:4000/api/alerts/newalert",{
        pagetype:"match",
        betId,
        condition:{
          type:"low",
          value:StopLossPrice,
          action:"sell"
        }


      },{
        headers:{
          "Content-Type":"application/json"
        },
        withCredentials:true
      })
      console.log(stoploss.data)
  }
  const setTakeprofit=async(betId)=>{
    if(ExitPrice<=StopLossPrice){
      alert("Take profit should be greater than stop loss")
      return
    }
    const takeprofit=await axios.post("http://localhost:4000/api/alerts/newalert",{
      pagetype:"match",
      betId,
      condition:{
        type:"high",
        value:ExitPrice,
        action:"sell"
      }
    },{
      headers:{
        "Content-Type":"application/json"
      },
      withCredentials:true
    })
    console.log(takeprofit.data)
  }
  const percentage=(team1,team2)=>{
      const total=team1+team2
      if(total==0){
        return 50
      }
      return Math.round((team1/total)*100)
    }
  const chartConfig = {
    team1: {
      label: score.team1||"Team 1",
      color: "var(--chart-1)",
    },
    team2: {
      label: score.team2||"Team 2",
      color: "var(--chart-2)",
    },
  };

  const chartData =[
    
    {
      team1:percentage(matchbets[0]?.amount,matchbets[1]?.amount),
      team2:percentage(matchbets[1]?.amount,matchbets[0]?.amount),
    }
  ]
const winpercentage=[{
  name:score.team1,
  value:percentage(matchbets[0]?.amount,matchbets[1]?.amount)
},
{
  name:score.team2,
  value:percentage( matchbets[1]?.amount,matchbets[0]?.amount)
}]
  return (
    <div className="p-4 pt-24">
      <h1 className="uppercase font-inter text-2xl font-bold">
        Event <span className="text-warning">score</span>
      </h1>
      <div className="flex justify-between items-center my-2">
        <div className="fieldset">
          <legend className="fieldset-legend font-poppins text-xs py-1">
            Start Time
          </legend>
          <p className="flex items-center gap-1.5 text-xs font-medium font-inter text-neutral-300 h-8 w-fit px-3 input border-none bg-muted-foreground rounded-md">
            <FaHourglassStart />
            {score.start}
          </p>
        </div>
        <div className="fieldset">
          <legend className="fieldset-legend font-poppins text-xs py-1">
            End Time
          </legend>
          <p className="flex items-center gap-1.5 text-xs font-medium font-inter text-neutral-300 h-8 w-fit px-3 input border-none bg-muted-foreground rounded-md">
            <FaHourglassEnd />
            {score.end}
          </p>
        </div>
      </div>
      <div className="lg:p-4 lg:bg-base-300 rounded-xl lg:border border-base-content/20">
        <div className="p-4 flex flex-col justify-center items-center relative gap-2">
          <Image
            src={ScoreCard}
            alt="score"
            className="lg:w-5xl h-[16rem] sm:h-[20rem] absolute top-0 object-center"
            width={1000}
            height={1000}
          ></Image>
          <div className="flex flex-col sm:p-6 p-1 pt-7 sm:pt-12  w-full md:max-w-5xl gap-2 justify-between h-[14rem] sm:h-[18rem] z-1">
            <div className="flex  justify-between gap-4 items-center">
              <HoverBorderGradient className="bg-base-100 rounded-full p-1 px-6 w-full">
                <p className="text-xs font-medium font-poppins text-center w-full">
                  {score.series}
                </p>
              </HoverBorderGradient>
              <div className="flex justify-between items-center">
                <div className="flex  justify-center items-center gap-2 font-poppins font-semibold text-xs sm:text-base">
                  <div className="inline-grid *:[grid-area:1/1]">
                    <div className="status status-error animate-ping"></div>
                    <div className="status status-error"></div>
                  </div>{" "}
                  {score.matchstate}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 -mt-1">
              <div className="flex justify-between items-center gap-2 sm:gap-4">
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className=" flex gap-3 items-center justify-center">
                    <Image
                      src={cricket}
                      alt="team"
                      className="size-10 sm:size-12 rounded-full"
                    ></Image>{" "}
                    <span className="font-bold text-base sm:text-xl font-inter">
                      {score.team1}
                    </span>
                  </div>
                  <div
                    className="p-2 px-3.5 backdrop-blur-lg rounded-xl flex items-center justify-center bg-[rgba(67,67,67,0.1)]
                   shadow-[0px_0px_1px_0px_rgba(248,248,248,0.4)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]"
                  >
                    <p className="text-base sm:text-xl lg:text-2xl font-black font-inter">
                      {score.score1}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center font-bold text-3xl font-goldman">
                  :
                </div>
                <div className="flex items-center justify-between gap-4 w-full">
                  <div
                    className="p-2 px-3.5 backdrop-blur-lg rounded-xl flex items-center justify-center bg-[rgba(67,67,67,0.1)]
                   shadow-[0px_0px_1px_0px_rgba(248,248,248,0.4)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]"
                  >
                    <p className="text-base sm:text-xl lg:text-2xl font-black font-inter">
                      {score.score2}
                    </p>
                  </div>

                  <div className=" flex gap-3 items-center justify-center">
                    <span className="font-bold text-base sm:text-xl font-inter">
                      {score.team2}
                    </span>
                    <Image
                      src={cricket}
                      alt="team"
                      className="size-10 sm:size-12 rounded-full"
                    ></Image>{" "}
                  </div>
                </div>
              </div>

              <p className="text-center font-medium font-inter text-sm">
                {score.stadium}
              </p>
              <p className="text-center font-medium font-inter text-xs -mt-2 text-neutral-300">
                {score.status}
              </p>
            </div>
            <div className="relative lg:max-w-5xl flex flex-col gap-2.5">
              <div className="flex justify-center items-center gap-4 w-full relative ">
                <div className="w-full">
                  <button
                    className="btn btn-active rounded-md p-5 btn-accent w-full"
                    onClick={() =>
                      document.getElementById("my_modal_3").showModal()
                    }
                  >
                    {score.team1} <span className="font-poppins font-bold">x{matchbets[0]?.odds}</span>
                  </button>
                  <dialog id="my_modal_3" className="modal">
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
                        {score.team1} VS {score.team2}
                      </h3>
                      <div className="badge badge-soft badge-accent rounded-sm text-sm mt-2">
                        {score.team1}
                      </div>
                      <div className=" mt-2 bg-base-300 p-2 rounded-lg">
                        <div className="bg-base-100 border-base-300 p-6">
                          <p className="text-sm">Amount</p>
                          <form action="" className="mt-4 flex flex-col gap-2">
                            <input
                              type="range"
                              min={0}
                              max="100"
                              className="range range-success"
                              value={buyamount}
                              onChange={(e) => setBuyAmount(e.target.value)}
                            />
                            <p className="ml-2 text-2xl font-medium font-inter">
                              ${buyamount}
                            </p>
                            <fieldset className="fieldset bg-base-100  rounded-box w-full border border-base-content p-4">
                              <legend className="fieldset-legend text-base font-poppins px-2">
                                Exit
                              </legend>
                              <label className="label">
                                <input
                                  type="checkbox"
                                  className="checkbox"
                                  onChange={(e)=>setIstakeprofitchecked(e.target.checked)}
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
                                className="input input-accent rounded-md w-full"
                                onChange={(e) => {
                                  setExitPrice(e.target.value);
                                }}
                              />
                              <label className="label mt-2">
                                <input
                                  type="checkbox"
                                  className="checkbox"
                                  onChange={(e)=>setIsstoplosschecked(e.target.checked)}
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
                                className="input input-accent rounded-md w-full"
                                onChange={(e) => {
                                  setStopLossPrice(e.target.value);
                                }}
                              />
                            </fieldset>
                            <button
                              className="btn btn-accent font-poppins text-base mt-1"
                              onClick={(e) =>{
                                e.preventDefault();
                                document.getElementById("my_modal_3")
                                  .close();
                                newBet("team1");
                              }}
                            >
                              Place Bet
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </dialog>
                </div>
                <div className="w-full">
                  <button
                    className="btn btn-active p-5 rounded-md btn-info w-full backdrop-blur-md"
                    onClick={() =>
                      document.getElementById("my_modal_1").showModal()
                    }
                  >
                    {score.team2}<span className="font-poppins font-bold">x{matchbets[1]?.odds}</span>
                  </button>
                  <dialog id="my_modal_1" className="modal">
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
                        {score.team1} VS {score.team2}
                      </h3>
                      <div className="badge badge-soft badge-info rounded-sm text-sm mt-2">
                        {score.team2}
                      </div>
                      <div className=" mt-2 bg-base-300 rounded-lg p-2">
                        <div className="bg-base-100 border-base-300 p-6">
                          <p className="text-sm">Amount</p>
                          <form action="" className="mt-4 flex flex-col gap-2">
                            <input
                              type="range"
                              min={0}
                              max="100"
                              className="range range-info"
                              value={buyamount2}
                              onChange={(e) => setBuyAmount2(e.target.value)}
                            />
                            <p className="ml-2 text-2xl font-medium font-inter">
                              ${buyamount2}
                            </p>
                            <fieldset className="fieldset bg-base-100  rounded-box w-full border border-base-content p-4">
                              <legend className="fieldset-legend text-base font-poppins px-2">
                                Exit
                              </legend>
                              <label className="label">
                                <input
                                  type="checkbox"
                                  
                                  onChange={(e)=>setIstakeprofitchecked(e.target.checked)}

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
                                  
                                  onChange={(e)=>setIsstoplosschecked(e.target.checked)}
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
                            <button className="btn btn-info font-poppins text-base mt-1"
                            onClick={(e) => {
                              e.preventDefault()
                              newBet("team2")
                              document.getElementById("my_modal_1").close()
                            }}
                            >
                              Place Bet
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ">
        <Card className="flex flex-col border-base-content/20">
          <CardHeader className="items-center pb-0">
            <CardTitle className="font-poppins">Radial Chart</CardTitle>
            <div className="flex justify-start items-center gap-2 font-poppins font-medium text-sm">
              <div className="inline-grid *:[grid-area:1/1]">
                <div className="status status-error animate-ping"></div>
                <div className="status status-error"></div>
              </div>{" "}
              LIVE WIN PREDICTION
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 items-center justify-center gap-6 pb-0">
            <ChartContainer
              config={chartConfig}
              className="aspect-square min-w-[280px] min-h-[250px]"
            >
              <RadialBarChart
                data={chartData}
                endAngle={360}
                innerRadius={120}
                outerRadius={220}
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            className="font-poppins"
                          >
                            {/* Team 1 (India) */}
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 10}
                              className="fill-base-content text-2xl font-poppins font-bold"
                            >
                              {winpercentage[0].value>50?winpercentage[0].value:winpercentage[1].value}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 8}
                              className="fill-gray-400"
                            >
                              {" "}
                              {winpercentage[0].value>50?winpercentage[0].name:winpercentage[1].name} is leading bets count
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="team1"
                  stackId="a"
                  name={winpercentage[0].name}
                  cornerRadius={6}
                  fill="var(--color-team1)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="team2"
                  fill="var(--color-team2)"
                  name={winpercentage[1].name}
                  stackId="a"
                  cornerRadius={6}
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>

            <div className="flex flex-col gap-2 font-poppins text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-chart-1"></span>
                <span className="font-bold">{score.team1} : {matchbets[0]?.amount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-chart-2"></span>
                <span className="font-bold">{score.team2} : {matchbets[1]?.amount}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-info leading-none">
              Showing the status of ongoing match
            </div>
          </CardFooter>
        </Card>

        <div className="h-full w-full border border-base-content/10 rounded-xl">
          <div className="p-3 border-b border-base-content/10">
            <p className="font-poppins text-sm font-semibold">Comments()</p>
          </div>
          <div className="h-96 max-h-96 p-3 overflow-y-auto flex flex-col gap-1">
            {
            comments.map((chat, index) => {
              const isReplying = CommentIndex === index
              return (
                <div key={index} className="p-1 flex items-start gap-3 w-full">
                  <Avatar name={chat.author} 
                  className="rounded-full object-cover"
                  size="2rem"
                  />
                  <div className="flex flex-col items-start justify-center w-full">
                    <p className="text-sm font-inter text-neutral-300  font-medium">
                      {chat.author}{" "}
                      <span className="font-inter text-xs text-neutral-400 font-normal ml-1">
                        {chat.date}
                      </span>
                    </p>
                    <p className="font-inter text-sm font-normal">
                      {chat.chat}
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
                      ) : (
                        ""
                      )}
                    </div>

                    {CommentIndex === index && (
                      <form action="" className="w-full mt-2">
                        <div className="join w-full">
                          <input
                            type="text"
                            className="input join-item w-full"
                            placeholder="Type your comment here"
                            value={usercomment[chat.id]||""}
                            onChange={(e)=>setUsercomment({...usercomment,[chat.id]:e.target.value})}
                          />
                          <button className="btn join-item bg-white text-black"
                          onClick={(e)=>{
                            e.preventDefault()
                            newComment(usercomment[chat.id],chat.id,null)
                          
                            setUsercomment({...usercomment,[chat.id]:""})
                            setCommentIndex(null)
                          }}
                          >
                            <IoSend />
                          </button>
                        </div>
                      </form>
                    )}
                    {showReplies === index &&
                      chat.replies &&
                      chat.replies.map((reply, replyIdx) => {
                        return (
                          <div
                            key={replyIdx}
                            className="p-1 flex items-start gap-3 w-full mt-2"
                          >
                            <Avatar 
                              name={reply.author} 
                              className="rounded-full object-cover"
                              size="1.5rem"
                            />
                            <div className="flex flex-col items-start justify-center w-full">
                              <p className="text-sm font-inter text-neutral-300  font-medium">
                                {reply.author}{" "}
                                <span className="font-inter text-xs text-neutral-400 font-normal ml-1">
                                  {reply.date}
                                </span>
                              </p>
                              <p className="font-inter text-sm font-normal">
                                {reply.replyto&&<span className="text-blue-500">{"@"+reply.replyto}</span>} {reply.chat}
                              </p>
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
                                        placeholder="Type your comment here"
                                        value={usercomment[reply.id]||""}
                                        onChange={(e)=>setUsercomment({...usercomment,[reply.id]:e.target.value})}
                                      />
                                      <button className="btn join-item bg-white text-black"
                                      onClick={(e)=>{
                                        e.preventDefault();
                                        newComment(usercomment[reply.id],chat.id,reply.author)
                                        setUsercomment({...usercomment,[reply.id]:""})
                                        setReplyIndex(null)
                                      }}
                                      >
                                        <IoSend />
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
          <form
            action=""
            className="w-full p-2 border-t border-base-content/10 flex gap-3 justify-center"
          >
            <div className="join w-full">
              <input
                type="text"
                className="input join-item w-full"
                placeholder="Type your comment here"
                value={usercomment.null}
                onChange={(e) => setUsercomment({...usercomment,null:e.target.value })}
              />
              <button className="btn join-item bg-white text-black"
                onClick={(e) => {
                  e.preventDefault();
                  newComment(usercomment.null,null,null)
                  setUsercomment({...usercomment,null:""})
                }}
              >
                <IoSend />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EventScore;
