import{Kafka} from "kafkajs"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { io } from "../../index.js"
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

const consumer=kafka.consumer({groupId:'matchconsumers'})
export const matchfetch=async()=>{
    
    try{
        await consumer.connect()
        await consumer.subscribe({
            topics:['upcoming-matches','recent-matches','live-matches'],
            fromBeginning:false
        })
        await consumer.run({
            eachMessage:async({topic,partition,message,heartbeat})=>{
                const data=JSON.parse(message.value.toString())
                console.log(data)
                io.emit('match-update',{
                    topic,
                    partition,
                    data
                })
await heartbeat()
                console.log('done')
            }
        })
    }
    catch(e){
        console.log(e.message)
        setTimeout(matchfetch,5000)
    }
}

