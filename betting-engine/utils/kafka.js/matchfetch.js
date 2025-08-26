import { producer } from "./producer.js";
import dotenv from "dotenv";
dotenv.config({path:'../../.env'})
import axios from "axios";
import cron from "node-cron";
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
const upcomingmatchesFetch=async()=>{
    try{
        await producer.connect()
        const response=await axios.get(`https://${process.env.APISPORTS_API_HOST}/matches/v1/upcoming`,{
            headers:{
                'x-rapidapi-host': process.env.APISPORTS_API_HOST,
                'x-rapidapi-key': process.env.APISPORTS_API_KEY
            }
        })
        const data=response.data
        const matches=data.typeMatches.flatMap((matchtype)=>{
            return matchtype.seriesMatches.filter((series)=>series.seriesAdWrapper)
            .flatMap((series)=>series.seriesAdWrapper.matches)
        })
        for(const match of matches){
            await prisma.match.upsert({
                where:{cricbuzzmatchId:match.matchInfo.matchId},
                update:{
                    title:match.matchInfo.matchDesc,
                    team1:match.matchInfo.team1,
                    team2:match.matchInfo.team2,
                    cricbuzzmatchId:match.matchInfo.matchId,
                    start:new Date(parseInt(match.matchInfo.startDate)),
                    end:new Date(parseInt(match.matchInfo.endDate)),
                    stats:match.matchInfo.venueInfo,
                    seriesname:match.matchInfo.seriesName,
                    cricbuzzseriesId:match.matchInfo.seriesId,
                    status:match.matchInfo.status,
                    state:match.matchInfo.state
                },
                create:{
                    title:match.matchInfo.matchDesc,
                    teamIds:[],
                    playerIds:[],
                    team1:match.matchInfo.team1,
                    team2:match.matchInfo.team2,
                    cricbuzzmatchId:match.matchInfo.matchId,
                    start:new Date(parseInt(match.matchInfo.startDate)),
                    end:new Date(parseInt(match.matchInfo.endDate)),
                    stats:match.matchInfo.venueInfo,
                    seriesname:match.matchInfo.seriesName,
                    cricbuzzseriesId:match.matchInfo.seriesId,
                    status:match.matchInfo.status,
                    state:match.matchInfo.state
                }
            })
        }
        for(const match of matches){
            await producer.send({
                topic:'upcoming-matches',
                messages:[
                    {
                        key:match.matchInfo.matchId,
                        value:JSON.stringify(match)
                    }
                ]
            })
        }
        console.log("matches fetched ")
        await producer.disconnect()
    }
    catch(e){
        console.log(e.message)
    }
}

const recentmatchesFetch=async()=>{
    try{
        await producer.connect()
        const response=await axios.get(`https://${process.env.APISPORTS_API_HOST}/matches/v1/recent`,{
            headers:{
                'x-rapidapi-host': process.env.APISPORTS_API_HOST,
                'x-rapidapi-key': process.env.APISPORTS_API_KEY
            }
        })
        const data=response.data
        const matches=data.typeMatches.flatMap((matchtype)=>{
            return matchtype.seriesMatches.filter((series)=>series.seriesAdWrapper)
            .flatMap((series)=>series.seriesAdWrapper.matches)
        })
        for(const match of matches){
            await prisma.match.upsert({
                where:{cricbuzzmatchId:match.matchInfo.matchId},
                update:{
                    title:match.matchInfo.matchDesc,
                    team1:match.matchInfo.team1,
                    team2:match.matchInfo.team2,
                    cricbuzzmatchId:match.matchInfo.matchId,
                    start:new Date(parseInt(match.matchInfo.startDate)),
                    end:new Date(parseInt(match.matchInfo.endDate)),
                    stats:match.matchInfo.venueInfo,
                    seriesname:match.matchInfo.seriesName,
                    cricbuzzseriesId:match.matchInfo.seriesId,
                    status:match.matchInfo.status,
                    state:match.matchInfo.state
                },
                create:{
                    title:match.matchInfo.matchDesc,
                    teamIds:[],
                    playerIds:[],
                    team1:match.matchInfo.team1,
                    team2:match.matchInfo.team2,
                    cricbuzzmatchId:match.matchInfo.matchId,
                    start:new Date(parseInt(match.matchInfo.startDate)),
                    end:new Date(parseInt(match.matchInfo.endDate)),
                    stats:match.matchInfo.venueInfo,
                    seriesname:match.matchInfo.seriesName,
                    cricbuzzseriesId:match.matchInfo.seriesId,
                    status:match.matchInfo.status,
                    state:match.matchInfo.state
                }
            })
        }
        for(const match of matches){
            await producer.send({
                topic:'recent-matches',
                messages:[
                    {
                        key:match.matchInfo.matchId,
                        value:JSON.stringify(match)
                    }
                ]
            })
        }
        console.log("recent matches fetched")
        await producer.disconnect()
    }
    catch(e){
        console.log(e.message)
    }
}
const livematchesFetch=async()=>{
    try{
        await producer.connect()
        const response=await axios.get(`https://${process.env.APISPORTS_API_HOST}/matches/v1/live`,{
            headers:{
                'x-rapidapi-host': process.env.APISPORTS_API_HOST,
                'x-rapidapi-key': process.env.APISPORTS_API_KEY
            }
        })
        const data=response.data
        const matches=data.typeMatches.flatMap((matchtype)=>{
            return matchtype.seriesMatches.filter((series)=>series.seriesAdWrapper)
            .flatMap((series)=>series.seriesAdWrapper.matches)
        })
        for(const match of matches){
            await prisma.match.upsert({
                where:{cricbuzzmatchId:match.matchInfo.matchId},
                update:{
                    title:match.matchInfo.matchDesc,
                    team1:match.matchInfo.team1,
                    team2:match.matchInfo.team2,
                    cricbuzzmatchId:match.matchInfo.matchId,
                    start:new Date(parseInt(match.matchInfo.startDate)),
                    end:new Date(parseInt(match.matchInfo.endDate)),
                    stats:match.matchInfo.venueInfo,
                    seriesname:match.matchInfo.seriesName,
                    cricbuzzseriesId:match.matchInfo.seriesId,
                    status:match.matchInfo.status,
                    state:match.matchInfo.state
                },
                create:{
                    title:match.matchInfo.matchDesc,
                    teamIds:[],
                    playerIds:[],
                    team1:match.matchInfo.team1,
                    team2:match.matchInfo.team2,
                    cricbuzzmatchId:match.matchInfo.matchId,
                    start:new Date(parseInt(match.matchInfo.startDate)),
                    end:new Date(parseInt(match.matchInfo.endDate)),
                    stats:match.matchInfo.venueInfo,
                    seriesname:match.matchInfo.seriesName,
                    cricbuzzseriesId:match.matchInfo.seriesId,
                    status:match.matchInfo.status,
                    state:match.matchInfo.state
                }
            })
        }
        for(const match of matches){
            await producer.send({
                topic:'live-matches',
                messages:[
                    {
                        key:match.matchInfo.matchId,
                        value:JSON.stringify(match)
                    }
                ]
            })
        }
        console.log("live matches fetched")
        await producer.disconnect()
    }
    catch(e){
        console.log(e.message)
    }
}

cron.schedule(`0 0 * * *`,async()=>{
    console.log("fetchingg matches")
    await upcomingmatchesFetch();
})
cron.schedule(`*/30 * * * *`,async()=>{
    console.log("fetching matches")
    await livematchesFetch();
    await recentmatchesFetch();
})