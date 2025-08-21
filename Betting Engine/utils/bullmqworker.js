import { Worker } from "bullmq";
import Redis from "ioredis";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config()
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
const connection=new Redis(process.env.REDIS_URI)
import { io } from "@/Betting Engine/index.js";
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.GAUTH_EMAIL,
        pass:process.env.GAUTH_PASSWORD
    },
})
const reminderworker=new Worker('reminder-queue',async(job)=>{
    const {reminderId,userId}=job.data
    const reminder=await prisma.reminder.findUnique({
        where:{
            id:reminderId
        },
        include:{
            user:true
        }
    })
    if(reminder&&reminder.status!=="dismissed"){
        await prisma.reminder.update({
            where:{
                id:reminderId
            },
            data:{
                status:'sent'
            }
        })
        await prisma.notification.create({
            data:{
                userId,
                message:reminder.message,
                type:'reminder'
            }
        })
        io.to(userId).emit('reminder',{
            id:reminder.id,
            message:reminder.message
        })
        const mail={
            from:process.env.GAUTH_EMAIL,
            to:reminder.user.email,
            subject:'Reminder Notification',
            html:`<p>${reminder.message}</p>`
        }
    }
},{connection})
reminderworker.on('failed',(job,e)=>{
    console.log(`job failed:${job.id},error:${e.message}`)
})