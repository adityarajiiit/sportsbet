import{Kafka} from "kafkajs"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { io } from "@/betting-engine/index.js"
import {PrismaClient} from "@prisma/client"

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
const consumer=kafka.consumer({groupId:'stock-consumers'})
const stockConsumer=async()=>{
    try{
        await consumer.connect()
        await consumer.subscribe({topics:['stock'],fromBeginning:true})
        await consumer.run({
            eachMessage:async({topic,partition,message,heartbeat})=>{
                const data=JSON.parse(message.value.toString())
                const stock=await prisma.stock.findUnique({
                    where:{id:data.stockId}
                })
                if(!stock){
                    console.log("stock not found")
                    return
                }
                let newshares=stock.shares
                if(data.type==='buy'){
                    newshares+=data.shares
                }
                else if(data.type==='sell'){
                    newshares-=data.shares
                }
                if(newshares<0){
                    console.log("not enough shares")
                    return
                }
                const newprice=data.price
                const newtotal=newshares*newprice
                const updatedstock=await prisma.stock.update({
                    where:{id:data.stockId},
                    data:{
                        shares:newshares,
                        price:newprice,
                        total:newtotal
                    }
                })
                console.log(`stock:${JSON.stringify(updatedstock)}`)
                io.emit('stock-update',{
                    stockId:data.stockId,
                    stock:updatedstock
                })
                await heartbeat()
            }
        })
    }
    catch(e){
        console.log(e.message)
        setTimeout(stockConsumer,5000)
    }
}
await stockConsumer()
