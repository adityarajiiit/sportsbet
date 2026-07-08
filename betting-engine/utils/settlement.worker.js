import{PrismaClient}from "@prisma/client"
import{producer}from "./kafka.js/producer.js"
import{io}from "../index.js"

const prisma=new PrismaClient()

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

        await producer.connect()

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
                console.log(`Could not automatically determine winner for match ${match.id} with status: ${match.status}`)
                continue
            }

            for(const bet of match.bets){
                const betResult=bet.matchoutcome.teamId.toString()===winningTeamId.toString()||bet.matchoutcome.teamname.toLowerCase()===match.teams.find(t=>t.id===winningTeamId)?.name.toLowerCase()?"won":"lost"
                
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

                await producer.send({
                    topic:'betting',
                    messages:[{key:updatedBet.id,value:JSON.stringify(updatedBet)}]
                })
                io.to(bet.userId).emit('notification',{
                    message:`Your bet on ${match.title||"match"} ${betResult==="won"?"won":"lost"}`
                })
            }
            console.log(`Settled ${match.bets.length} bets for match ${match.title}`)
        }
        await producer.disconnect()
    }catch(e){
        console.error("Error in settlement worker:",e)
    }
}
