import express from 'express'
import {createServer} from 'node:http'
import {Server} from 'socket.io'
import {serve} from 'inngest/express'
import { isSpoofedBot } from "@arcjet/inspect";
import dotenv from "dotenv"
import adminRoutes from './routes/admin.routes.js'
import alertRoutes from './routes/alert.routes.js'
import betRoutes from './routes/bet.routes.js'
import  commentsRoutes from './routes/comments.routes.js'
import cryptomusRoutes from './routes/cryptomus.routes.js'
import reminderRoutes from './routes/reminder.routes.js'
import stockRoutes from './routes/stock.routes.js'
dotenv.config({path:'../.env'})
import { inngest,functions } from './inngest/inngest.js';
import { arcjetMiddleware } from './middlewares/arcjet.middleware.js';
import awsRoutes from './routes/aws.routes.js'
import otherRoutes from './routes/other.routes.js'
import cors from 'cors';
import cron from 'node-cron'
import { betsConsumer } from './utils/kafka.js/bet.consumer.js';
import { matchfetch } from './utils/kafka.js/consumer.js';
import { stockConsumer } from './utils/kafka.js/stock.consumer.js';
import { upcomingmatchesFetch,recentmatchesFetch,livematchesFetch } from './utils/kafka.js/matchfetch.js';
import cryptoRoutes from './routes/crypto.routes.js';
import {socketfunction} from './services/socket.js'
import cookieParser from 'cookie-parser';

const app=express()
app.use(express.json())
const server=createServer(app)
const io=new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST","PUT","DELETE","PATCH"],
        credentials:true
    }
})
await socketfunction(io)
await betsConsumer()
await matchfetch()
await stockConsumer()


app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(cookieParser())
app.use(express.static('public'))
app.use('/api/others',otherRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/alerts',alertRoutes)
app.use('/api/bets',betRoutes)
app.use('/api/comments',commentsRoutes)
app.use('/api/payments',cryptomusRoutes)
app.use('/api/reminders',reminderRoutes)
app.use('/api/stocks',stockRoutes)
app.use('/api/aws',awsRoutes)
app.use('/api/crypto',cryptoRoutes)
app.use('/api/inngest',serve({
    client:inngest,
    functions
}))
cron.schedule(`0 0 * * *`,async()=>{
    console.log("fetchingg matches")
    await upcomingmatchesFetch()
})
cron.schedule(`*/30 * * * *`,async()=>{
    console.log("fetching matches")
    await livematchesFetch()
    await recentmatchesFetch()
})

app.get('/',(req,res)=>{
    res.sendFile('index.html')
})
const PORT=4000
server.listen(PORT,()=>{
    console.log('server running',PORT)
})
export {io}
