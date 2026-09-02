import prisma from "../utils/prisma.js"
import {sendKafkaMessage} from "./kafka.js/producer.js"
import {io} from "../index.js"

export const settleMatchesWorker=async()=>{
    try{
        console.log("running automated bet settlement worker")
        const completedMatches=await prisma.match.findMany({
            where:{
                matchState:"Recent",
                state:"Complete",
                bets:{
                    some:{status:"pending"}
                }
            },
            include:{
                bets:{
                    where:{status:"pending"},
                    include:{matchoutcome:true,user:true}
                },
                teams:true
            }
        })

        if(completedMatches.length===0){
            console.log("no matches to settle")
            return
        }

        for(const match of completedMatches){
            const statusString=match.status.toLowerCase()
            let winningTeamId=null

            for(const team of match.teams){
                if(statusString.includes(team.name.toLowerCase())){
                    winningTeamId=team.id
                    break
                }
            }

            if(!winningTeamId){
                console.log(`cant determine winner for match ${match.id} with status: ${match.status}`)
                continue
            }

            const winningTeam=match.teams.find(t=>t.id===winningTeamId)
            for(const bet of match.bets){
                const betResult=bet.matchoutcome.teamname.toLowerCase()===winningTeam?.name.toLowerCase()?"won":"lost"
                
                const updatedBet=await prisma.$transaction(async(tx)=>{
                    const b=await tx.bet.update({
                        where:{id:bet.id},
                        data:{
                            status:"completed",
                            result:{
                                result:betResult,
                                gotresultAt:new Date(),
                                automatic:true
                            }
                        }
                    })

                    if(betResult==="won"){
                        const winnings=b.amount*b.odds
                        await tx.wallet.update({
                            where:{userId:bet.userId},
                            data:{balance:{increment:winnings}}
                        })
                    }
                    return b
                })

                await sendKafkaMessage('betting',updatedBet.id,updatedBet)
                io.to(bet.userId).emit('notification',{
                    message:`Your bet on ${match.title||"match"} ${betResult==="won"?"won":"lost"}`
                })
            }
            console.log(`settled ${match.bets.length} bets for match ${match.title}`)
        }
    }catch(e){
        console.error(e.message)
    }
}
