import axios from "axios"
import {PrismaClient} from "@prisma/client"
import {producer} from "./kafka.js/producer.js"
import dotenv from "dotenv"
dotenv.config({path:'../../.env'})

const prisma=new PrismaClient()

export const fetchRecentMatchScore=async()=>{
    try{
        await producer.connect()
        const token=process.env.SPORTMONKS_API_TOKEN
        if(!token)return
        
        const today=new Date().toISOString().split('T')[0]
        const endpoints=[
            {sport:"Cricket",url:`https://cricket.sportmonks.com/api/v2.0/fixtures?api_token=${token}&filter[starts_between]=${today},${today}&include=localteam,visitorteam,runs`},
            {sport:"Football",url:`https://api.sportmonks.com/v3/football/fixtures/date/${today}?api_token=${token}&include=participants;scores`}
        ]
        
        for(const ep of endpoints){
            try{
                const response=await axios.get(ep.url)
                const data=response.data
                if(!data||!data.data)continue
                const matches=data.data
                for(const match of matches){
                    let matchId,title,team1,team2,status,state,start,liveScore
                    
                    if(ep.sport==="Cricket"){
                        matchId=match.id
                        status=match.status
                        state=match.note||"Recent"
                        start=new Date(match.starting_at)
                        liveScore=match.runs||[]
                        
                        team1={
                            teamSName:match.localteam?.code||match.localteam?.name||"TBA",
                            teamName:match.localteam?.name||"TBA",
                            imageId:match.localteam?.image_path||""
                        }
                        team2={
                            teamSName:match.visitorteam?.code||match.visitorteam?.name||"TBA",
                            teamName:match.visitorteam?.name||"TBA",
                            imageId:match.visitorteam?.image_path||""
                        }
                        title=`${team1.teamName} vs ${team2.teamName}`
                    }
                    else if(ep.sport==="Football"){
                        matchId=match.id
                        status=match.state?.state||"FT"
                        state=match.name||"Recent"
                        start=new Date(match.starting_at)
                        liveScore=match.scores||[]
                        
                        const participants=match.participants||[]
                        const home=participants.find(p=>p.meta?.location==="home")||participants[0]
                        const away=participants.find(p=>p.meta?.location==="away")||participants[1]
                        
                        team1={
                            teamSName:home?.short_code||home?.name||"TBA",
                            teamName:home?.name||"TBA",
                            imageId:home?.image_path||""
                        }
                        team2={
                            teamSName:away?.short_code||away?.name||"TBA",
                            teamName:away?.name||"TBA",
                            imageId:away?.image_path||""
                        }
                        title=match.name||`${team1.teamName} vs ${team2.teamName}`
                    }
                    
                    const isFinished=(status==="Finished"||status==="FT"||status==="AET"||status==="PEN")
                    const matchState=isFinished?"Recent":"Live"
                    const mappedState=isFinished?"Complete":state

                    const updatematch=await prisma.match.upsert({
                        where:{cricbuzzmatchId:matchId},
                        update:{
                            title:title,
                            team1:team1,
                            team2:team2,
                            cricbuzzmatchId:matchId,
                            start:start,
                            end:start,
                            status:status,
                            state:mappedState,
                            matchState:matchState,
                            sportType:ep.sport,
                            liveScore:liveScore
                        },
                        create:{
                            title:title,
                            teamIds:[],
                            playerIds:[],
                            team1:team1,
                            team2:team2,
                            cricbuzzmatchId:matchId,
                            start:start,
                            end:start,
                            status:status,
                            state:mappedState,
                            matchState:matchState,
                            sportType:ep.sport,
                            liveScore:liveScore
                        }
                    })
                    
                    if(isFinished){
                        await producer.send({
                            topic:'recent-matches',
                            messages:[
                                {
                                    key:matchId.toString(),
                                    value:JSON.stringify(updatematch)
                                }
                            ]
                        })
                    }
                }
            }
            catch(err){
                console.log(err.message)
            }
        }
        await producer.disconnect()
    }
    catch(e){
        console.log(e.message)
    }
}
