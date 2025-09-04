import {PrismaClient} from "@prisma/client"
import crypto from "crypto"
const prisma=new PrismaClient()
import dotenv from "dotenv"
dotenv.config({path:'../../.env'})
import axios from "axios"
import CryptoJS from "crypto-js"
import { error } from "console"

/*
1) To initiate a payment, your online store must send a payment request to the Paymento API. 

2) A successful request will create an order for the transaction and return a token in the response. This token is used to redirect the user to the payment page.

3) With the token received from creating the payment request, redirect the user to the Paymento payment page where they can choose from the allowed cryptocurrencies to complete the payment.

Payment URL: https://app.paymento.io/gateway?token=TOKEN_HERE

Replace TOKEN_HERE with the token you received in the previous step.

4) After the payment is made, Paymento sends the payment status and details to the callback URL you've specified. Also, the end user will be redirected back to your site.

5) It's crucial to verify the payment to finalize the order on your end. Upon receiving the payment notification, make an API call to confirm the payment status with the token you received.
*/
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
        const userId=req.headers['user-id']
        const user=await prisma.user.findUnique({ where:{id:userId} })
        if(!user){
            return res.json({error:"user not found"})
        }

        const wallet=await prisma.wallet.findUnique({ where:{ userId } })
        if(!wallet){
            await prisma.wallet.create({ data:{ userId } })
        }

        const data=req.body
        const amountNum = Number(data.amount)
        const apiKey=process.env.PAYMENTO_API_KEY
        const order=await prisma.order.create({
            data:{ amount: amountNum, userId }
        })
        const payload={
            fiatAmount:String(amountNum),  
            fiatCurrency:"USD",
            ReturnUrl:process.env.PAYMENTO_RETURN_URL||"http://localhost:3000/payments/success",
            orderId:String(order.id), 
            Speed:1
        }
        const payment=await axios.post(
            "https://api.paymento.io/v1/payment/request",
            payload,
            {
                headers:{
                    "Api-key": apiKey,
                    "Content-Type":"application/json",
                    "Accept":"text/plain"
                },
                timeout: 15000,
                validateStatus:()=>true
            }
        )
        const token=payment.data.body
        return res.json({
            token,
            url:`https://app.paymento.io/gateway?token=${token}`
        })
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const successPayment=async(req,res)=>{
    try{
        const receivedSignature=req.get('X-HMAC-SHA256-SIGNATURE')||req.headers['x-hmac-sha256-signature']
        if(!receivedSignature){
            return res.json({error:"missing signature header"})
        }
        const rawPayload=Buffer.from(JSON.stringify(req.body),'utf8')
        const secretKey=process.env.PAYMENTO_SECRET_KEY
        if(!secretKey){
            return res.json({error:"missing PAYMENTO_SECRET_KEY"})
        }
        const calcSig=crypto.createHmac('sha256',secretKey).update(rawPayload).digest('hex').toUpperCase()
        if (calcSig!==receivedSignature){
            return res.json({error:"invalid signature"})
        }
        const data=req.body
        const token=data.Token||data.token
        const paymentId=String(data.PaymentId)
        const orderIdStr=String(data.OrderId)
        const orderStatusNum=Number(data.OrderStatus)
        if(!token){
            return res.json({error:"invalid callback"})
        }
        const verify=await axios.post(
            'https://api.paymento.io/v1/payment/verify',
            {token},
            {
                headers:{
                    'Api-key':process.env.PAYMENTO_API_KEY,
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                timeout:15000,
                validateStatus:()=>true
            }
        )
        const order=await prisma.order.findUnique({where:{id:orderIdStr}})
        if(!order){
            return res.json({error:"order not found"})
        }
        let statusText
        switch (orderStatusNum) {
            case 0: statusText="Payment request accepted by the API."; break
            case 1: statusText="User has chosen a coin to pay."; break
            case 2: statusText="User paid less than the order amount."; break
            case 3: statusText="User's transaction received in the blockchain network."; break
            case 4: statusText="Payment deadline expired."; break
            case 5: statusText="User canceled at the gateway."; break
            case 7: statusText="User's transaction confirmed in the blockchain network (Paid)."; break
            case 8: statusText="Payment verified by the store (Approve)."; break
            case 9: statusText="Payment rejected."; break
            default: statusText="Unknown status."
        }
        const additionalInfo=data.AdditionalData??null
        const paymentRecord=await prisma.payment.upsert({
            where:{paymentId},
            update:{
                status:statusText,
                amount:order.amount,
                additionalInfo
            },
            create:{
                paymentId,
                orderId:orderIdStr,
                status:statusText,
                amount:order.amount,
                additionalInfo
            }
        })
        if(orderStatusNum=== 7||orderStatusNum===8){
            await prisma.wallet.update({
                where:{userId:order.userId},
                data:{
                    balance:{increment:order.amount*100}
                }
            })
        } 
        else {
            return res.json({success:false,status:statusText})
        }

        console.log("payment successful:",paymentRecord)
        return res.json({success:true})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export{createWallet,newOrder,successPayment}
