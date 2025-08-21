import dotenv from 'dotenv'
dotenv.config()
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
import { producer } from "../utils/kafka.js/producer.js";
const newStockTransaction=async(req,res)=>{
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
const data=req.body
if(data.type!=="buy"){
    return res.json({error:"only buy transaction"})
}
let stockhold
if(data.stockholderId==null){
   stockhold= await prisma.stockholder.create({
        data:{
            userId:user.id,
            pagetype:data.stocktype,
            playerId:data.playerId||null,
            teamId:data.teamId||null,
            shares:data.shares,
            averageprice:data.price,
            stockId:data.stockId
        }
    })
}
else{
    const cstockholder=await prisma.stockholder.findUnique({
        where:{
            id:data.stockholderId
        }
    })
    const currprice=cstockholder.shares* cstockholder.averageprice
    const newprice=data.price*data.shares
    const newtotalshares=cstockholder.shares+data.shares
    const newavg=(currprice+newprice)/newtotalshares
stockhold=await prisma.stockholder.update({
    where:{
        id:data.stockholderId
    },
    data:{
        shares:{
            increment:data.shares
        },
        averageprice:newavg
    }
})
    }
const newtrans=await prisma.stocktransaction.create({
    data:{
        pagetype:data.stocktype,
        playerId:data.playerId||null,
        teamId:data.teamId||null,
        userId:user.id,
        type:data.type,
        price:data.price,
        shares:data.shares,
        total:data.total,
        stockholderId:stockhold.id,
        stockId:data.stockId,
    }
})
await producer.connect()
await producer.send({
    topic:'stock',
    messages:[{key:newtrans.id,value:JSON.stringify(newtrans)}]
})
await producer.disconnect()
return res.json({newtrans,stockhold})

    }
    catch(e){
        res.json({error:e.message})
    }
}
const sellTransaction=async(req,res)=>{
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
const data=req.body
if(data.type!=="sell"){
    return res.json({error:"only sell transaction"})
}
const stockhold=await prisma.stockholder.findUnique({
    where:{
        id:data.stockholderId
    }
})
if(!stockhold){
    return res.json({error:"no stockholder"})
}
if(stockhold.shares<data.shares){
    return res.json({error:"not enough shares"})
}
const currprice=stockhold.shares*stockhold.averageprice
const soldprice=stockhold.averageprice*data.shares
const newtotalshares=stockhold.shares-data.shares
let newavg=stockhold.averageprice
if(newtotalshares>0){
    newavg=(currprice-soldprice)/newtotalshares
}
const newstockhold=await prisma.stockholder.update({
    where:{
        id:data.stockholderId
    },
    data:{
        shares:{
            decrement:data.shares
        },
        averageprice:newavg
    }
})
const newtrans=await prisma.stocktransaction.create({
    data:{
        pagetype:data.stocktype,
        userId:user.id,
        playerId:data.playerId||null,
        teamId:data.teamId||null,
        type:data.type,
        price:data.price,
        shares:data.shares,
        total:data.total,
        stockholderId:stockhold.id,
        stockId:data.stockId,
    }
})
if(newstockhold.shares===0){
    await prisma.stockholder.delete({
        where:{
            id:newstockhold.id
        }
    })
}
await producer.connect()
await producer.send({
    topic:'stock',
    messages:[{key:newtrans.id,value:JSON.stringify(newtrans)}]
})
await producer.disconnect()
return res.json({newtrans,newstockhold})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const getuserPortfolio=async(req,res)=>{
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
const stockholders=await prisma.stockholder.findMany({
    where:{userId:user.id},
    include:{
        stocktransaction:true,
        stock:true,
        player:true,
        team:true
    }
})
return res.json({stockholders})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const getStockholders=async(req,res)=>{
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
const stockholders=await prisma.stockholder.findMany({
    where:{stockId:req.query.stockId},
    include:{
        stocktransaction:true,
        stock:true,
        player:true,
        team:true
    }
})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const searchStock=async(req,res)=>{
    try{
const query=req.query.q
if(!query){
    return res.json({error:"no query"})
}
const searchresults=await prisma.$runCommandRaw({
    aggregate:"Stock",
    pipeline:[
        {
            $search:{
                autocomplete:{
                    query,
                    path:"name",
                    fuzzy:{
                        maxEdits:2,
                        prefixLength:3
                    }
                }
            }
        },
        {
            $limit:20
        },
        {
            $lookup:{
                from:"Player",
                localField:"playerId",
                foreignField:"_id",
                as:"player"
            }
        },
        {
            $lookup:{
                from:"Team",
                localField:"teamId",
                foreignField:"_id",
                as:"team"
            }
        }
    ],
    cursor:{}
})
const stocks=searchresults.cursor.firstBatch
return res.json({stocks})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export {newStockTransaction,sellTransaction,getuserPortfolio,searchStock}