import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
const upcomingmatchesFetch=async()=>{
    try{
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
        console.log("done")
    }
    catch(e){
        console.log(e.message)
    }
}
const recentmatchesFetch=async()=>{
    try{
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
        console.log("done")
    }
    catch(e){
        console.log(e.message)
    }
}
const livematchesFetch=async()=>{
    try{
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
        console.log("done")
    }
    catch(e){
        console.log(e.message)
    }
}

const getteamInternational=async()=>{
    try{
        const response=await axios.get(`https://${process.env.APISPORTS_API_HOST}/teams/v1/international`,{
            headers:{
                'x-rapidapi-host': process.env.APISPORTS_API_HOST,
                'x-rapidapi-key': process.env.APISPORTS_API_KEY
            }
        })
        const data=response.data
        const teams=data.list.filter((team)=>team.teamId)
        const allteams=await prisma.$transaction(
            teams.map((team)=>prisma.team.upsert({
                where:{cricbuzzteamId:team.teamId},
                update:{
                    name:team.teamName
                },
                create:{
                    cricbuzzteamId:team.teamId,
                    name:team.teamName,
                    playerIds:[],
                    matchIds:[]
                }
            }))
        )
        let allteamids=[]
        for(const team of allteams){
            allteamids.push(team.cricbuzzteamId)
        }
        console.log(allteams)
    }
    catch(e){
        console.log(e.message)
    }
}

const getteamDomestic=async()=>{
    try{
        const response=await axios.get(`https://${process.env.APISPORTS_API_HOST}/teams/v1/domestic`,{
            headers:{
                'x-rapidapi-host': process.env.APISPORTS_API_HOST,
                'x-rapidapi-key': process.env.APISPORTS_API_KEY
            }
        })
        const data=response.data
        const teams=data.list.filter((team)=>team.teamId)
        const allteams=await prisma.$transaction(
            teams.map((team)=>prisma.team.upsert({
                where:{cricbuzzteamId:team.teamId},
                update:{
                    name:team.teamName
                },
                create:{
                    cricbuzzteamId:team.teamId,
                    name:team.teamName,
                    playerIds:[],
                    matchIds:[]
                }
            }))
        )
        let allteamids=[]
        for(const team of allteams){
            allteamids.push(team.cricbuzzteamId)
        }
        console.log(allteams)
    }
    catch(e){
        console.log(e.message)
    }
}
const getteamLeague=async()=>{
    try{
        const response=await axios.get(`https://${process.env.APISPORTS_API_HOST}/teams/v1/league`,{
            headers:{
                'x-rapidapi-host': process.env.APISPORTS_API_HOST,
                'x-rapidapi-key': process.env.APISPORTS_API_KEY
            }
        })
        const data=response.data
        const teams=data.list.filter((team)=>team.teamId)
        const allteams=await prisma.$transaction(
            teams.map((team)=>prisma.team.upsert({
                where:{cricbuzzteamId:team.teamId},
                update:{
                    name:team.teamName
                },
                create:{
                    cricbuzzteamId:team.teamId,
                    name:team.teamName,
                    playerIds:[],
                    matchIds:[]
                }
            }))
        )
        let allteamids=[]
        for(const team of allteams){
            allteamids.push(team.cricbuzzteamId)
        }
    }
    catch(e){
        console.log(e.message)
    }
}
const getallTeams=async()=>{
    try{
        const response=await axios.get(`https://cricket.sportmonks.com/api/v2.0/teams?api_token=z2yOdpv8PZUsHVJqaptauQEoIcGYqWV9BDZcnGOX6BSY0ewtmfng54SpLA8Q&include=country,results,fixtures`)
        const data=response.data.data
        for(const team of data){
            await prisma.team.upsert({
                where:{cricbuzzteamId:team.id},
                update:{
                    name:team.name,
                    results:team.results,
                    fixtures:team.fixtures,
                    image:team.image_path,
                },
                create:{
                    cricbuzzteamId:team.id,
                    name:team.name,
                    results:team.results,
                    fixtures:team.fixtures,
                    image:team.image_path
                }

            })
        }
        console.log("done")

    }
    catch(e){
        console.log(e.message)
    }
}

const getallPlayers=async()=>{
    try{
        const response=await axios.get(`https://cricket.sportmonks.com/api/v2.0/players?api_token=uvSCbQyDQTozr6Hp326ZfQwgbLFEVQgPiK7C8lsPiJogyDMzWcA5JfGNxsVu&include=career`)
        const data=response.data.data
        for(const player of data){
            await prisma.player.upsert({
                where:{cricbuzzplayerId:player.id},
                update:{
                    name:player.fullname,
                    image:player.image_path,
                    cricbuzzteamId:player.country_id,
                    battingstyle:player.batting_style,
                    bowlingstyle:player.bowling_style,
                    position:player.position,
                    career:player.career,
                    gender:player.gender
                },
                create:{
                    name:player.fullname,
                    image:player.image_path,
                    cricbuzzteamId:player.country_id,
                    battingstyle:player.batting_style,
                    bowlingstyle:player.bowling_style,
                    position:player.position,
                    career:player.career,
                    cricbuzzplayerId:player.id,
                    gender:player.gender
                }
            })
        }
console.log("done")
        
    }
    catch(e){
        console.log(e.message)
    }
}
