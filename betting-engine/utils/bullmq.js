import { Queue } from "bullmq"; 
import Redis from "ioredis";

const connection=new Redis(process.env.REDIS_URI)
const reminderQueue=new Queue('reminder-queue',{connection})
const delayJob=async(reminderId,userId,delay)=>{
    await reminderQueue.add('delay-reminder',{
        reminderId,
        userId
    },{
        delay:delay,
        jobId:`reminder-${reminderId}`
    })
} 
const removeJob=async(reminderId)=>{
    const job=await reminderQueue.getJob(`reminder-${reminderId}`)
    if(job){
        await job.remove()
    }
}


export {reminderQueue,delayJob,removeJob}