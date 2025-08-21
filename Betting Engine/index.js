import express from 'express'
import {createServer} from 'node:http'
import {Server} from 'socket.io'
import {serve} from 'inngest/express'
import { isSpoofedBot } from "@arcjet/inspect";
import dotenv from "dotenv"
dotenv.config()
import { inngest,functions } from './inngest/inngest.js';
import { arcjetMiddleware } from './middlewares/arcjet.middleware.js';
const app=express()
const server=createServer(app)
const io=new Server(server)

app.use(express.json())
app.use(arcjetMiddleware)
app.use(express.static('public'))
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
