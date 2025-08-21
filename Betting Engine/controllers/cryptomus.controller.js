import {PrismaClient} from "@prisma/client"
import crypto from "crypto"
const prisma=new PrismaClient()
import dotenv from "dotenv"
dotenv.config()
import axios from "axios"
const createWallet=async(req,res)=>{
    try{
        const userId=req.userId
        const user=await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user){
            return res.json({error:"user not found"})
        }
        const wallet=await prisma.wallet.findUnique({
            where:{userId}
        })
        if(wallet){
            return res.json({error:"wallet already exists"})
        }
        const newwallet=await prisma.wallet.create({
            data:{
                userId
            }
        })
        return res.json({newwallet})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const newOrder=async(req,res)=>{
    try{
       const userId=req.userId
       const user=await prisma.user.findUnique({
           where:{id:userId}
       })
       if(!user){
           return res.json({error:"user not found"})
       }
       const {order}=req.body
       if(!order){
        return res.json({error:"order not found"})
       }
       const neworder=await prisma.order.create({
        data:{
            userId,
            amount:order.amount,
        }
       })
       const payload={
        amount:order.amount,
        currency:"usd",
        order_id:`${userId}-${Date.now()}`,
        url_callback:`${process.env.SERVER_URI}/payment/success`
       }
       const buffer=Buffer.from(JSON.stringify(payload)).toString('base64').concat(process.env.CRYPTOMUS_PAYMENT_KEY)
       const data=await axios.post(`${process.env.CRYPTOMUS_URI}/payment`,payload,{
        headers:{
            merchant:process.env.CRYPTOMUS_MERCH_ID,
            sign:crypto.createHash("md5").update(buffer).digest("hex"),
            "Content-Type":"application/json"
        }
       })
       res.json({data,link:data.result.url})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const successPayment=async(req,res)=>{
    try{
        const userId=req.userId
        const data=req.body
        if(!data){
            return res.json({error:"no data in body"})
        }
        const newdata=data
        delete newdata.sign
        const buffer=Buffer.from(JSON.stringify(newdata)).toString('base64').concat(process.env.CRYPTOMUS_PAYMENT_KEY)
        const sign=crypto.createHash("md5").update(buffer).digest("hex")
        if(sign!==data.sign){
            return res.json({error:"invalid signature"})
        }
        const order=await prisma.order.findUnique({
            where:{
                orderId:data.order_id
            }
        })
        if(!order){
            return res.json({error:"order not found"})
        }
        const payment=await prisma.payment.create({
            data:{
                userId,
                orderId:data.order_id,
                payercurrency:data.payer_currency,
                amount:data.amount,
                paymentamount:data.payment_amount,
                currency:data.currency,
                network:data.network,
            }
        })
        await prisma.order.update({
            where:{
                id:order.id
            },
            data:{
                status:"success"
            }
        })
        await prisma.wallet.update({
            where:{
                userId
            },
            data:{
                balance:{
                    increment:data.payment_amount
                }
            }
        })
       
    }
    catch(e){
        return res.json({error:e.message})
    }
}