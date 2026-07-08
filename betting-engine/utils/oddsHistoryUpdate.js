import {PrismaClient} from "@prisma/client"
const prisma=new PrismaClient()

export const fetchOddsHistoryUpdate=async()=>{
    try{
        const matches=await prisma.match.findMany({
            where:{
                matchState:"Live"
            }
        })

        if(matches.length===0){
            return {success:true,message:"No live matches"}
        }

        for(const match of matches){
            const matchbet=await prisma.matchbet.findUnique({
                where:{matchId:match.id},
                include:{outcomes:true}
            })

            if(matchbet&&matchbet.outcomes.length>0){
                for(const outcome of matchbet.outcomes){
                    await prisma.oddsHistory.create({
                        data:{
                            matchbetId:outcome.matchbetId,
                            teamId:outcome.teamId,
                            teamname:outcome.teamname,
                            odds:outcome.odds
                        }
                    })
                }
            }
        }
        return {success:true}
    }
    catch(e){
        console.log(e.message)
        return {error:e.message}
    }
}
