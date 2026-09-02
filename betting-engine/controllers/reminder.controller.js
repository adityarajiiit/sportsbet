import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})
import prisma from '../utils/prisma.js'
import { delayJob,removeJob } from "../utils/bullmq.js";
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
const currentReminder=await prisma.reminder.findUnique({
    where:{
        id:data.reminderId
    }
})
if(!currentReminder){
    return res.json({error:"reminder not found"})
}

if(currentReminder.status!=="pending"){
    return res.json({error:"only pending reminders can be snoozed"})
}
await removeJob(data.reminderId)
const newTime=new Date(Date.now()+data.snoozeTime)
const reminder=await prisma.reminder.update({
    where:{
        id:data.reminderId
    },
    data:{
        time:newTime,
    }
})
await delayJob(reminder.id,userId,data.snoozeTime)

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