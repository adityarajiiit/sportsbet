import { Inngest } from "inngest";
import nodemailer from 'nodemailer';
import { io } from "../index.js";
import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()

const inngest=new Inngest({
    id:'sportsbet',
    name:'Betting Engine',
    eventKey:process.env.INNGEST_EVENT_KEY,
})


const betAlerts=inngest.createFunction({
    id:'bet-alerts'
},{event:'bet.alerts'},
async({event,step})=>{
    const data=event.data
    const alerts=await step.run("getalerts",async()=>{
        return await prisma.alert.findMany({
            where:{
                betId:data.betId,
                status:"alertcreated"
            }
        })

    })
    if(alerts.length===0){
        return {message:"no alerts"}
    }
    const bet=await step.run("getbet",async()=>{
        return await prisma.bet.findUnique({
            where:{
                id:data.betId
            },
            include:{
                user:true,
                match:true
            }
        })
        


    })
    if(!bet||bet.status!=="pending"){
            return {message:"bet not found or not pending"}
        }
    const betamount=bet.amount
    for(const alert of alerts){
        const condition=alert.condition
        if(condition.action==="sell"){
            if(condition.type==="high"&&betamount>condition.value){
                await step.run("sellbet",async()=>{
                    return await prisma.bet.update({
                        where:{
                            id:bet.id
                        },
                        data:{
                            issold:true,
                            status:"sold"
                        }
                    })
                })
            }
            else if(condition.type==="low"&&betamount<condition.value){
                await step.run("sellbet",async()=>{
                    return await prisma.bet.update({
                        where:{
                            id:bet.id
                        },
                        data:{
                            issold:true,
                            status:"sold"
                        }
                    })
                })
            }
            else{
                return {message:"within range"}
            }
        }
        else{
            await step.run("notifybet",async()=>{
                await prisma.notification.create({
                    data:{
                        userId:bet.userId,
                        message:`You have reached your bet alert threshold for bet on match ${bet.match.title} and your current
            amount is ${bet.amount}`,
            type:"alert",
                    }
                })
                const transporter=nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:process.env.GAUTH_EMAIL,
                        pass:process.env.GAUTH_PASSWORD
                    },
                })
                const mail={
            from:process.env.GAUTH_EMAIL,
            to:bet.user.email,
            subject:'Bet Alert Notification',
            html:`<p>You have reached your bet alert threshold for bet on match ${bet.match.title} and your current
            amount is ${bet.amount}</p>`
        }
        await transporter.sendMail(mail)
        io.to(bet.userId).emit('betalert',{
            id:alert.id,
            message:`You have reached your bet alert threshold for bet on match ${bet.match.title} and your current
            amount is ${bet.amount}`
        })
        await prisma.alert.update({
            where:{
                id:alert.id
            },
            data:{
                status:"done"
            }
        })
            })
        }
    }
    
return {message:'done'}
}
)
const stockAlerts=inngest.createFunction({
    id:"stock-alerts"
},{event:'stock.alerts'},
async({event,step})=>{
    const data=event.data
    const alerts=await step.run("getalerts",async()=>{
        return await prisma.alert.findMany({
            where:{
                stockholderId:data.stockholderId,
                status:"alertcreated"
            }
        })
    })
    if(alerts.length===0){
        return{message:"no alerts found"}
    }
    const stock=await step.run("getstock",async()=>{
        return await prisma.stockholder.findUnique({
            where:{
                id:data.stockholderId
            },
            include:{
                stock:true,
                alerts:true,
                user:true,
                transactions:true,
                player:true,
                team:true
            }
        })
    })
    if(!stock){
        return {message:"not a stockholder"}
    }
    const amount=stock.averageprice*stock.shares
    for(const alert of alerts){
        const condition=alert.condition
        if(condition.action==="sell"){
            if(condition.type==="high"&&amount>condition.value){
                await step.run("sellstock",async()=>{
                    return await prisma.stockholder.update({
                        where:{
                            id:data.stockholderId
                        },
                        data:{
                            shares:0,
                            averageprice:0
                        }
                    })
                })
            }
            else if(condition.type==="low"&&amount<condition.value){
                await step.run("sellstock",async()=>{
                    return await prisma.stockholder.update({
                        where:{
                            id:data.stockholderId
                        },
                        data:{
                            shares:0,
                            averageprice:0
                        }
                    })
                })
            }
            else{
                return {message:"within range"}
            }
        }
        else{
            await step.run("notifystock",async()=>{
                await prisma.notification.create({
                    data:{userId:stock.userId,
                        message:`You have reached the thresold of stock alert for stock ${stock.stock.title} and current value is ${amount}`,
                        type:"alert"

                    }
                })
                const transporter=nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:process.env.GAUTH_EMAIL,
                        pass:process.env.GAUTH_PASSWORD
                    },
                })
                const mail={
                    from:process.env.GAUTH_EMAIL,
                    to:stock.user.email,
                    subject:'Stock Alert Notification',
                    html:`<p>You have reached your stock alert threshold for stock ${stock.stock.title} and your current value is ${amount}</p>`
                }
                await transporter.sendMail(mail)
                io.to(stock.userId).emit('stockalert',{
                    id:alert.id,
                    message:`You have reached your stock alert threshold for stock ${stock.stock.title} and your current value is ${amount}`
                })
                await prisma.alert.update({
                    where:{
                        id:alert.id
                    },
                    data:{
                        status:"done"
                    }
                })
            })
        }

    }
    return {message:'done'}
})
const functions=[betAlerts,stockAlerts]
export {inngest,functions}