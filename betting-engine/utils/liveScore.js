import axios from "axios"
import {PrismaClient} from "@prisma/client"
import {producer} from "./kafka.js/producer.js"
import dotenv from "dotenv"
dotenv.config({path:'../../.env'})

const prisma=new PrismaClient()

export const fetchLiveMatchScore=async()=>{
    try{
        await producer.connect()
        const token=process.env.SPORTMONKS_API_TOKEN
        if(!token){
            return
        }
        const endpoints=[
            {sport:"Cricket",url:`https://cricket.sportmonks.com/api/v2.0/livescores?api_token=${token}&include=localteam,visitorteam,runs`},
            {sport:"Football",url:`https://api.sportmonks.com/v3/football/livescores?api_token=${token}&include=participants;scores`}
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
                        state=match.note||"Live"
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
                        status=match.state?.state||"LIVE"
                        state=match.name||"Live"
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
                            state:state,
                            matchState:"Live",
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
                            state:state,
                            matchState:"Live",
                            sportType:ep.sport,
                            liveScore:liveScore
                        }
                    })
                    
                    await producer.send({
                        topic:'live-matches',
                        messages:[
                            {
                                key:matchId.toString(),
                                value:JSON.stringify({matchId,liveScore,status,sportType:ep.sport})
                            }
                        ]
                    })
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
