import{Kafka,Partitioners} from "kafkajs"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import {fileURLToPath} from "url"
import {dirname} from "path"

const __filename=fileURLToPath(import.meta.url)
const __dirname=dirname(__filename)
dotenv.config({path:path.resolve(__dirname,'../../.env')})
export const kafka=new Kafka({
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

export const producer=kafka.producer({createPartitioner:Partitioners.LegacyPartitioner})

let _connected=false
export const sendKafkaMessage=async(topic,key,value)=>{
    if(!_connected){
        await producer.connect()
        _connected=true
    }
    await producer.send({
        topic,
        messages:[{key,value:JSON.stringify(value)}]
    })
}
