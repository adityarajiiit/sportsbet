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
const app=express()
const server=createServer(app)
const io=new Server(server)

app.use(express.json())

app.use(express.static('public'))
app.use('/api/admin',adminRoutes)
app.use('/api/alerts',alertRoutes)
app.use('/api/bets',betRoutes)
app.use('/api/comments',commentsRoutes)
app.use('/api/payments',cryptomusRoutes)
app.use('/api/reminders',reminderRoutes)
app.use('/api/stocks',stockRoutes)
app.use('/api/aws',awsRoutes)
app.use('/api/inngest',serve({
    client:inngest,
    functions
}))
app.get('/',(req,res)=>{
    res.sendFile('index.html')
})
const PORT=4000
server.listen(PORT,()=>{
    console.log('server running',PORT)
})
export {io}
