import dotenv from 'dotenv'
dotenv.config()
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
import { queue,delayJob,removeJob } from "../utils/bullmq.js";
const newReminder=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId
    }
})
if(!user){
    return res.json({error:"no user"})
}
const data=req.body
const reminder=await prisma.reminder.create({
    data:{
        userId:userId,
        matchId:data.matchId||null,
        playerId:data.playerId||null,
        teamId:data.teamId||null,
        message:data.message,
        time:data.time,
        type:data.type
    }
})
await delayJob(reminder.id,userId,new Date(reminder.time).getTime()-Date.now())
return res.json({reminder})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const snoozeReminder=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId
    }
})
if(!user){
    return res.json({error:"no user"})
}
const data=req.body
if(data.status!=="pending"){
    return res.json({error:"pending reminder only"})
}
const reminder=await prisma.reminder.update({
    where:{
        id:data.reminderId
    },
    data:{
        time:new Date()+data.snoozetime,
    }
})
await delayJob(reminder.id,userId,Math.max(new Date(reminder.time).getTime()-Date.now(),0))
return res.json({reminder})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const dismissedReminder=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId
    }
})
if(!user){
    return res.json({error:"no user"})
}
const id=req.params.id
if(data.status!=="dismissed"){
    return res.json({error:"not dismissed status"})
}
await removeJob(id)
const reminder=await prisma.reminder.update({
    where:{
        id:id
    },
    data:{
        status:"dismissed"
    }
})
return res.json({reminder})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const getuserReminders=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId
    }
})
if(!user){
    return res.json({error:"no user"})
}
const reminders=await prisma.reminder.findMany({
    where:{
        userId:userId
    }
})
return res.json({reminders})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export {newReminder,snoozeReminder,dismissedReminder,getuserReminders}