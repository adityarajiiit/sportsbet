import{Kafka} from "kafkajs"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { io } from "@/betting-engine/index.js"
import {PrismaClient} from "@prisma/client"
import { match } from "assert"
const prisma=new PrismaClient()
dotenv.config({path:'../../.env'})
const filename=fileURLToPath(import.meta.url)
const dirname=dirname(filename)
const kafka=new Kafka({
    brokers:[process.env.KAFKA_URI],
    sasl:{
        mechanism:"plain",
        username:process.env.KAFKA_USER,
        password:process.env.KAFKA_PASS
    },
    ssl:{
        ca:process.env.KAFKA_CERTIFICATE
    }
})
const consumer=kafka.consumer({groupId:'betting-consumers'})
const betsConsumer=async()=>{
    try{
        await consumer.connect()
        await consumer.subscribe({topics:['betting'],fromBeginning:true})
        await consumer.run({
            eachMessage:async({topic,partition,message,heartbeat})=>{
                const data=JSON.parse(message.value.toString())
                const outcomes=await prisma.matchbet.findMany({
                    where:{id:data.matchbetId}
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
                    outcomeamount.push({outcomeId:outcome.id,amount:total})
                }
                let totalamount=0
                for(const i of outcomeamount){
                    totalamount+=i.amount
                }
                for(const i of outcomeamount){
                    i.percentage=(i.amount/totalamount)*100
                    i.odds=totalamount===0?0:+(1/(i.percentage/100)).toFixed(2)
                    await prisma.matchbetoutcomes.update({
                        where:{id:i.outcomeId},
                        data:{
                            odds:i.odds,
                            total:i.amount
                        }
                    })
                }
                io.emit('betting-update',{
                    outcomeamount,
                    matchbetId:data.matchbetId,
                    matchId:data.matchId
                })
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
await betsConsumer()
