import { PrismaClient } from "@prisma/client";
import axios from "axios";
const prisma=new PrismaClient()
import dotenv from "dotenv"
import crypto from "crypto"
dotenv.config({path:'../../.env'})

const frontendBaseUrl=process.env.FRONTEND_URL
const backendBaseUrl=process.env.BACKEND_URL
const paymentCurrency=process.env.MAXELPAY_CURRENCY
const frontendUrl=`${frontendBaseUrl}/dashboard`
const callbackUrl=process.env.MAXELPAY_CALLBACK_URL.trim()
const successUrl=process.env.MAXELPAY_SUCCESS_URL.trim()
const cancelUrl=process.env.MAXELPAY_CANCEL_URL.trim()

const isValidAbsoluteUrl=(value)=>{
    try{
        const parsed=new URL(value)
        return parsed.protocol==='http:'||parsed.protocol==='https:'
    }catch{
        return false
    }
}

const isPublicHttpsUrl=(value)=>{
    try{
        const parsed=new URL(value)
        const host=parsed.hostname.toLowerCase()
        const isLocalHost=host==='localhost'||host==='127.0.0.1'||host==='0.0.0.0'||host==='::1'
        return parsed.protocol==='https:'&&!isLocalHost
    }catch{
        return false
    }
}

const normalizeOrderId=(orderId)=>{
    if(typeof orderId!=='string') return orderId
    if(orderId.startsWith('order_')){
        return orderId.slice(6)
    }
    return orderId
}

const verifyWebhookSignature=(payload,signature,secretKey)=>{
    if(!signature||!secretKey){
        return false
    }
    const hash=crypto.createHmac('sha256',secretKey).update(payload).digest('hex')
    if(hash.length!==signature.length){
        return false
    }
    return crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(signature))
}


const markOrderAndCreditWallet=async(orderId,nextStatus,shouldCredit=false)=>{
    const internalOrderId=normalizeOrderId(orderId)
    const order=await prisma.order.findUnique({
        where:{id:internalOrderId}
    })
    if(!order){
        return {error:'order not found'}
    }
    if(order.status!=='pending'){
        return {message:'order already processed'}
    }
    await prisma.$transaction(async(tx)=>{
        if(shouldCredit){
            await tx.wallet.upsert({
                where:{userId:order.userId},
                update:{
                    balance:{increment:order.amount}
                },
                create:{
                    userId:order.userId,
                    balance:order.amount
                }
            })
        }
        await tx.order.update({
            where:{id:internalOrderId},
            data:{
                status:nextStatus
            }
        })
    })
    return {message:shouldCredit?"Payment successful and wallet updated":"Payment cancelled and order updated"}
}


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
        await prisma.wallet.upsert({
            where:{userId},
            update:{},
            create:{
                userId,
                balance:0
            }
        })
        const {amount}=req.body
        if(!amount||typeof amount!=='number'||amount<=0){
         return res.json({error:"invalid amount"})
        }
        const neworder=await prisma.order.create({
         data:{
            userId,
            amount:amount,
         }
        })
        console.log(neworder)
        if(!isValidAbsoluteUrl(successUrl)||!isValidAbsoluteUrl(cancelUrl)||!isValidAbsoluteUrl(callbackUrl)){
            return res.status(400).json({error:'Invalid redirect URLs configuration'})
        }
        if(!isPublicHttpsUrl(successUrl)||!isPublicHttpsUrl(cancelUrl)||!isPublicHttpsUrl(callbackUrl)){
            return res.status(400).json({error:'Set MAXELPAY_SUCCESS_URL, MAXELPAY_CANCEL_URL and MAXELPAY_CALLBACK_URL to public https URLs'})
        }
        const normalizedAmount=Number(Number(amount).toFixed(2))
        const externalOrderId=`order_${neworder.id}`
        const payload={
            orderId:externalOrderId,
            amount:normalizedAmount,
            currency:paymentCurrency,
            description:`Wallet topup #${externalOrderId}`,
            callbackUrl,
            successUrl,
            cancelUrl
        }
        const response=await axios.post(`${process.env.MAXELPAY_URL}/api/v1/payments/sessions`,payload,{
            headers:{
                'X-API-KEY':process.env.MAXELPAY_API_KEY,
                'Content-Type':'application/json'
            }
        })
        console.log(response.data)
        const paymentUrl=response.data?.paymentUrl||response.data?.data?.paymentUrl
        if(!paymentUrl){
            return res.status(500).json({error:'Payment URL missing from provider response',details:response.data})
        }
        return res.json({paymentUrl,provider:response.data})
    }
    catch(e){
        const status=e?.response?.status||500
        const providerData=e?.response?.data
        const providerMessage=providerData?.error||providerData?.message||providerData?.details?.message
        return res.status(status).json({
            error:providerMessage||e.message||'Unable to create payment session',
            details:providerData||null
        })
    }
}

const getPaymentStatus=async(req,res)=>{
    try{
        const {sessionId}=req.params
        const response=await axios.get(`${process.env.MAXELPAY_URL}/api/v1/payments/sessions/${sessionId}/status`,{
            headers:{
                'X-API-KEY':process.env.MAXELPAY_API_KEY
            }
        })
        return res.json({status:response.data.status})
    }
    catch(e){
        return res.json({error:e.message})
    }
}

const successPayment=async(req,res)=>{
    try{
        const signature=req.headers['x-maxelpay-signature']
        const payload=JSON.stringify(req.body)
        if(!verifyWebhookSignature(payload,signature,process.env.MAXELPAY_WEBHOOK_SECRET)){
            return res.status(400).json({error:"Invalid signature"})
        }
        const {orderId}=req.body
        const result=await markOrderAndCreditWallet(orderId,'success',true)
        if(result.error){
            return res.status(400).json({error:result.error})
        }
        return res.json({message:result.message})
    }
    catch(e){
        return res.json({error:e.message})
    }
}

const cancelPayment=async(req,res)=>{
    try{
        const signature=req.headers['x-maxelpay-signature']
        const payload=JSON.stringify(req.body)
        if(!verifyWebhookSignature(payload,signature,process.env.MAXELPAY_WEBHOOK_SECRET)){
            return res.status(400).json({error:"Invalid signature"})
        }
        const {orderId}=req.body
        const result=await markOrderAndCreditWallet(orderId,'failed')
        if(result.error){
            return res.status(400).json({error:result.error})
        }
        return res.json({message:result.message})
    }
    catch(e){
        return res.json({error:e.message})
    }
}

const callbackPayment=async(req,res)=>{
    try{
        const signature=req.headers['x-maxelpay-signature']
        const payload=JSON.stringify(req.body)
        if(!verifyWebhookSignature(payload,signature,process.env.MAXELPAY_WEBHOOK_SECRET)){
            return res.status(400).json({error:"Invalid signature"})
        }
        const {event,data}=req.body
        const orderId=data?.orderId
        if(!event){
            return res.status(400).json({error:'event not found'})
        }
        if(!orderId){
            return res.status(400).json({error:'orderId not found'})
        }
        if(event==='payment.processing'){
            return res.json({received:true,message:'payment processing'})
        }
        if(event==='payment.completed'){
            const result=await markOrderAndCreditWallet(orderId,'success',true)
            if(result.error){
                return res.status(400).json({error:result.error})
            }
            return res.json({received:true,message:result.message})
        }
        if(event==='payment.failed'||event==='payment.expired'){
            const result=await markOrderAndCreditWallet(orderId,'failed')
            if(result.error){
                return res.status(400).json({error:result.error})
            }
            return res.json({received:true,message:result.message})
        }
        return res.json({received:true,message:'event ignored'})
    }
    catch(e){
        return res.json({error:e.message})
    }
}

const successReturn=async(req,res)=>{
    const {orderId}=req.query
    const query=orderId?`?payment=success&orderId=${orderId}`:'?payment=success'
    return res.redirect(`${frontendUrl}${query}`)
}

const cancelReturn=async(req,res)=>{
    const {orderId}=req.query
    const query=orderId?`?payment=cancelled&orderId=${orderId}`:'?payment=cancelled'
    return res.redirect(`${frontendUrl}${query}`)
}

export {
    createWallet,
    newOrder,
    getPaymentStatus,
    successPayment,
    cancelPayment,
    callbackPayment,
    successReturn,
    cancelReturn
}