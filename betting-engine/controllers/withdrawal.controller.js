import {PrismaClient} from "@prisma/client"
const prisma=new PrismaClient()
import dotenv from "dotenv"
dotenv.config({path:'../../.env'})

const withdrawFunds=async(req,res)=>{
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
        const result=await prisma.$transaction(async(tx)=>{
            const wallet=await tx.wallet.findUnique({where:{userId}})
            if(!wallet||wallet.balance<amountNum){
                throw new Error("insufficient funds")
            }
            await tx.wallet.update({
                where:{userId},
                data:{
                    balance:{decrement:amountNum}
                }
            })
            const withdrawalReq=await tx.withdrawalRequest.create({
                data:{
                    userId,
                    amount:amountNum,
                    status:"pending"
                }
            })
            return withdrawalReq
        })
        
        return res.json({success:true,withdrawal:result,message:"Withdrawal request submitted successfully"})
    }
    catch(e){
        return res.status(400).json({error:e.message})
    }
}

export{withdrawFunds}
