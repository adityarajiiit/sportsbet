import{PrismaClient}from "@prisma/client"
const prisma=new PrismaClient()
import dotenv from "dotenv"
dotenv.config({path:'../../.env'})

const createWallet=async(req,res)=>{
    try{
        const userId=req.userId
        const user=await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user){
            return res.status(400).json({error:"user not found"})
        }
        const wallet=await prisma.wallet.findUnique({
            where:{userId}
        })
        if(wallet){
            return res.status(400).json({error:"wallet already exists"})
        }
        const newwallet=await prisma.wallet.create({
            data:{
                userId
            }
        })
        return res.json({newwallet})
    }catch(e){
        return res.status(400).json({error:e.message})
    }
}

const mockDeposit=async(req,res)=>{
    try{
        const userId=req.userId
        const user=await prisma.user.findUnique({where:{id:userId}})
        if(!user){
            return res.status(400).json({error:"user not found"})
        }
        const data=req.body
        const amountNum=Number(data.amount)
        if(isNaN(amountNum)||amountNum<=0){
            return res.status(400).json({error:"invalid amount"})
        }
        const wallet=await prisma.wallet.findUnique({where:{userId}})
        if(!wallet){
            await prisma.wallet.create({data:{userId,balance:amountNum}})
        }else{
            await prisma.wallet.update({
                where:{userId},
                data:{
                    balance:{increment:amountNum}
                }
            })
        }
        
        return res.json({success:true,amount:amountNum,message:"Mock deposit successful"})
    }catch(e){
        return res.status(400).json({error:e.message})
    }
}

export{createWallet,mockDeposit}
