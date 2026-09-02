import{Kafka} from "kafkajs"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { io } from "../../index.js"
import {PrismaClient} from "@prisma/client"
import {inngest} from "../../inngest/inngest.js"
const prisma=new PrismaClient()
dotenv.config({path:'../../.env'})
const filename=fileURLToPath(import.meta.url)
const __dirname=dirname(filename)
const kafka=new Kafka({
    brokers:[process.env.KAFKA_URI],
    sasl:{
        mechanism:"plain",
        username:process.env.KAFKA_USER,
        password:process.env.KAFKA_PASS
    },
    ssl:{
         ca:[fs.readFileSync(path.resolve(__dirname,'../../certificates/ca.pem'),'utf-8')]
    }
})
const consumer=kafka.consumer({groupId:'betting-consumers'})
export const betsConsumer=async()=>{
    try{
        await consumer.connect()
        await consumer.subscribe({topics:['betting'],fromBeginning:false})
        await consumer.run({
            eachMessage:async({topic,partition,message,heartbeat})=>{
                const data=JSON.parse(message.value.toString())
                const outcomes=await prisma.matchbetoutcomes.findMany({
                    where:{matchbetId:data.matchbetId}
                })
                let outcomeamount=[]
                for(const outcome of outcomes){
                    const bets=await prisma.bet.findMany({
                        where:{
                            matchoutcomeId:outcome.id,
                            issold:false
                        }
                    })
                    let total=0
                    for(const bet of bets){
                        total+=bet.amount
                    }
                    outcomeamount.push({outcomeId:outcome.id,amount:total,matchbetId:outcome.matchbetId,name:outcome.teamname})
                }
                let totalamount=0
                for(const i of outcomeamount){
                    totalamount+=i.amount
                }
                let answer=[]
                let allPendingBets = []
                for(const item of outcomeamount){
                    const percentage=totalamount===0?0:(item.amount/totalamount)*100
                    const newodds=percentage===0?1.01:parseFloat((100/percentage).toFixed(2))
                    
                    const result=await prisma.matchbetoutcomes.update({
                        where:{id:item.outcomeId},
                        data:{
                            odds:isFinite(newodds)?newodds:0,
                            total:isFinite(item.amount)?item.amount:0
                        }
                    })
                    await prisma.oddsHistory.create({
                        data:{
                            matchbetId:item.matchbetId,
                            teamId:result.teamId,
                            teamname:item.name,
                            odds:result.odds
                        }
                    })
                    answer.push({odds:result.odds,teamId:result.teamId,amount:item.amount,matchbetId:item.matchbetId,name:item.name,matchoutcomesId:item.outcomeId})
                    const pendingBets=await prisma.bet.findMany({
                        where:{
                            matchoutcomeId:result.id,
                            issold:false,
                            status:"pending"
                        }
                    })
                    allPendingBets=[...allPendingBets,...pendingBets]
                }
                for(const bet of allPendingBets){
                    await inngest.send({
                        name: "bet.alerts",
                        data: bet
                    })
                }

                io.emit('betting-update',answer)
                await heartbeat()
                console.log('betting update done')
            }
        })

    }
    catch(e){
        console.log(e.message)
        setTimeout(betsConsumer,5000)
    }
}