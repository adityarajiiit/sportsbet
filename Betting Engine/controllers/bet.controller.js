import dotenv from 'dotenv'
dotenv.config()
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
import { producer } from "../utils/kafka.js/producer.js";
const newBet=async(req,res)=>{
    try{
     const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId
    }
})
     if(!user){
        return res.json({error:"No user"})
     }
      const data=req.body;
      const bet=await prisma.bet.create({
        data:{
            userId:user.id,
            matchId:data.matchId,
            details:data.details,
            amount:data.amount,
            odds:data.odds,
            status:data.status,
            type:data.type,
            matchbetId:data.matchbetId,
            matchoutcomeId:data.matchoutcomeId,
        }
      })
      if(!bet){
        return res.json({error:"bet not created"})
      }
      await producer.connect()
      await producer.send({
        topic:'betting',
        messages:[
            {
                key:bet.id,
                value:JSON.stringify(bet)
            }
        ]
      })
      await producer.disconnect()
      return res.json({bet})
    }
    catch(e){
       return res.status(500).json({error:e.message})
    }
}
const getBets=async(req,res)=>{
    try{
  const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId
    }
})
if(!user){
    return res.json({error:"no user found"})
}
const matchId=req.params.id
const bets=await prisma.bet.findMany({
    where:{
        matchId:matchId,
        issold:false
    },
    include:{
        user:true,
        match:true,
    },
    orderBy:{
        createdAt:"desc"
    }
})
if(!bets){
    return res.json({error:"no bets found"})
}
return res.json({bets})
    }
    catch(e){
       return res.status(500).json({error:e.message})
    }
}
const getUserBets=async(req,res)=>{
    try{
  const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId
    }
})
if(!user){
    return res.json({error:"no user found"})
}
const bets=await prisma.bet.findMany({
    where:{
        userId:user.id
    },
    include:{
        match:true
    },
    orderBy:{
        createdAt:"desc"
    }
})
if(!bets){
    return res.json({error:"no bets found"})
}
return res.json({bets})
    }
    catch(e){
       return res.status(500).json({error:e.message})
    }
}
const getUserBetsbyMatch=async(req,res)=>{
    try{
  const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId
    }
})
if(!user){
    return res.json({error:"no user found"})
}
const matchId=req.params.id
if(!matchId){
    return res.json({error:"no matchId provided"})
}
const bets=await prisma.bet.findMany({
    where:{
        userId:user.id,
        matchId:matchId
    },
    include:{
        match:true
    },
    orderBy:{
        createdAt:"desc"
    }
})
if(!bets){
    return res.json({error:"no bets found"})
}
return res.json({bets})
    }
    catch(e){
      return  res.status(500).json({error:e.message})
    }
}
const modifyBet=async(req,res)=>{
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
const betId=req.params.id
if(!betId){
    return res.json({error:"no betid is present"})
}
const data=req.body
const bet=await prisma.bet.update({
    where:{
        id:betId,
        userId:user.id,
        issold:false
    },
    data:{
amount:data.amount,
odds:data.odds,
details:data.details,
status:data.status,
    }
})
if(!bet){
    return res.json({error:"bet not updated"})
}
await producer.connect()
await producer.send({topic:'betting',
    messages:[{key:bet.id,value:JSON.stringify(bet)}]
})
await producer.disconnect()
return res.json({bet})
    }
    catch(e){
      return  res.status(500).json({error:e.message})
    }
}
const sellBet=async(req,res)=>{
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
        const betId=req.params.id
        if(!betId){
            return res.json({error:"no betid"})
        }
        const bet=await prisma.bet.findUnique({
            where:{
                id:betId,
                userId:user.id
            },
            include:{
                match:true
            }

        })
        if(!bet){
            return res.json({error:"no bet found"})
        }
        if(bet.status!=="pending"){
            return res.json({error:"bet is not pending"})
        }
        const data=req.body
        const price=data.price
        const soldbet=await prisma.bet.update({
            where:{
                id:betId,
                userId:user.id,
                issold:false
            },
            data:{
                issold:true,
                status:"sold",
                result:{
                    price:price,
                    soldat:new Date(),
                }
            }
        })
        if(!soldbet){
            return res.json({error:"bet not sold"})
        }
        await producer.connect()
        await producer.send({
            topic:'betting',
            messages:[{key:soldbet.id,value:JSON.stringify(soldbet)}]
        })
        await producer.disconnect()
        return res.json({soldbet})

    }
    catch(e){
      return  res.status(500).json({error:e.message})
    }
}
const betOutcome=async(req,res)=>{
    try{
         const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId
    }
})
if(!user){
    return res.json({error:"not a user"})
}
const betId=req.params.id
const result=req.body.result
if(!betId||!result){
    return res.json({error:"betId or result not there"})
}
const bet=await prisma.bet.update({
    where:{
        id:betId,
        status:"pending"
    },
    data:{
        status:"completed",
        result:{
            result:result,
            gotresultAt:new Date()
        }
    },
    include:{
        match:true,
        user:true
    }
})
if(!bet){
    return res.json({error:"bet not updated"})
}
await producer.connect()
await producer.send({
    topic:'betting',
    messages:[{key:bet.id,value:JSON.stringify(bet)}]
})
await producer.disconnect()
return res.json({bet})
    }
    catch(e){
        return res.status(500).json({error:e.message})
    }
}
export{newBet,getBets,getUserBets,getUserBetsbyMatch,modifyBet,sellBet,betOutcome}