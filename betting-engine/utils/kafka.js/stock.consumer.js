import{Kafka} from "kafkajs"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { io } from "../../index.js"
import {PrismaClient} from "@prisma/client"

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
const consumer=kafka.consumer({groupId:'stock-consumers'})
export const stockConsumer=async()=>{
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
                let newprice,newshares,newtotal
                if(data.type==='buy'){
                    const actualtotal=data.shares*data.price
                    newprice=(stock.price*1000+actualtotal)/1000
                    newshares=stock.shares-data.shares
                }
                else if(data.type==='sell') {
                    const sellvalue=data.shares*data.price
                    newprice=(stock.price*1000-sellvalue)/1000
                    newshares=stock.shares+data.shares
                }
                else{
                    console.log("unknown transaction type")
                    return
                }
                if(newshares<0) {
                    console.log("invalid shares calculation")
                    return
                }
                newtotal=newprice*1000
                const updatedstock=await prisma.stock.update({
                    where:{id:data.stockId},
                    data:{
                        price:newprice,
                        total:newtotal
                    }
                })
                console.log(`stock:${JSON.stringify(updatedstock)}`)
                io.emit('stock-update', {
                    stockId:data.stockId,
                    stock:updatedstock,
                    transaction:data
                })
                await heartbeat()
            }
        })
    }
    catch(e){
        console.log(e.message)
        setTimeout(stockConsumer, 5000)
    }
}