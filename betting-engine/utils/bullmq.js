import { Queue } from "bullmq"; 
import Redis from "ioredis";
import dotenv from 'dotenv'
dotenv.config({ path: '../../.env' })
const connection=new Redis(
    {
        host:process.env.REDIS_HOST,
        port:process.env.REDIS_PORT,
        password:process.env.REDIS_PASSWORD,
        maxRetriesPerRequest:null
    }
)
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