import{Kafka,Partitioners} from "kafkajs"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import cron from "node-cron"
dotenv.config({path:'../../.env'})

const __filename=fileURLToPath(import.meta.url)
const __dirname=dirname(__filename)
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
