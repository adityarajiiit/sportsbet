import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})
import prisma from "../utils/prisma.js"
import {sendKafkaMessage} from "../utils/kafka.js/producer.js"

const newStockTransaction=async(req,res)=>{
    try{
        const userId=req.userId
        const user=await prisma.user.findUnique({
            where:{
                id:userId
            }
        })
        if(!user){
            return res.status(400).json({error:"no user"})
        }
        const data=req.body
        if(data.type!=="buy"){
            return res.status(400).json({error:"only buy transaction"})
        }
        const stock=await prisma.stock.findUnique({
            where:{id:data.stockId}
        })
        if(!stock){
            return res.status(400).json({error:"no stock"})
        }
        const sharestobuy=Math.floor(data.total/stock.price)
        if(sharestobuy<=0){
            return res.status(400).json({error:"not enough total to buy shares"})
        }
        if(sharestobuy>stock.shares){
            return res.status(400).json({error:"not enough shares available"})
        }
        const actualtotal=sharestobuy*stock.price
        const wallet=await prisma.wallet.findUnique({
            where:{userId:user.id}
        })
        if(!wallet||wallet.balance<actualtotal){
            return res.status(400).json({error:"insufficient balance"})
        }
        await sendKafkaMessage('stock-trade',data.stockId,{
            ...data,
            userId
        })
        return res.status(202).json({queued:true})
}
catch(e){
    res.status(400).json({error:e.message})
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
            return res.status(400).json({error:"no user"})
        }
        const data=req.body
        if(data.type!=="sell"){
            return res.status(400).json({error:"only sell transaction"})
        }
        const sharesToSell=parseInt(data.shares)
        if(!sharesToSell||isNaN(sharesToSell)||sharesToSell<=0){
            return res.status(400).json({error:"invalid shares"})
        }
        const stockholder=await prisma.stockholder.findUnique({
            where:{
                userId_stockId:{
                    userId:user.id,
                    stockId:data.stockId
                }
            }
        })
        if(!stockholder){
            return res.status(400).json({error:"no stockholder"})
        }
        if(stockholder.shares<sharesToSell){
            return res.status(400).json({error:"not enough shares"})
        }
        await sendKafkaMessage('stock-trade',data.stockId,{
            ...data,
            userId,
            sharesToSell
        })
        return res.status(202).json({queued:true})
    }
    catch(e){
        return res.status(400).json({error:e.message})
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
    return res.status(400).json({error:"no user"})
}
const stockholders=await prisma.stockholder.findMany({
    where:{userId:user.id},
    include:{
        transactions:true,
        stock:true,
        player:true,
        team:true
    }
})
return res.json({stockholders})
    }
    catch(e){
        return res.status(400).json({error:e.message})
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
    return res.status(400).json({error:"no user"})
}
const stockholders=await prisma.stockholder.findMany({
    where:{stockId:req.query.stockId},
    include:{
        transactions:true,
        stock:true,
        player:true,
        team:true
    }
})
return res.json({stockholders})
    }
    catch(e){
        return res.status(400).json({error:e.message})
    }
}

const searchStock=async(req,res)=>{
    try{
const query=req.query.q
console.log(query)
if(!query){
    return res.status(400).json({error:"no query"})
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
            $limit:10
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
console.log(searchresults)
const stocks=searchresults.cursor.firstBatch
const date=new Date(Date.now()-24*60*60*1000)

const transcounts=await Promise.all(stocks.map(async(stock)=>{
    const volume=await prisma.stockTransaction.count({
        where:{
            stockId:stock._id.$oid.toString(),
            createdAt:{
                gte:date
            }

        }
    })
    let pricechange=0
    const earliesttrans=await prisma.stockTransaction.findFirst({
        where:{
            stockId:stock._id.$oid.toString(),
            createdAt:{
                gte:date
            }
        },
        orderBy:{
            createdAt:'asc'
        }
    })
    const latesttrans=await prisma.stockTransaction.findFirst({
        where:{
            stockId:stock._id.$oid.toString(),
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    if(earliesttrans&&latesttrans){
        pricechange=latesttrans.price-earliesttrans.price
    }
    return {...stock,volume,pricechange}
}))

console.log(transcounts)
return res.json(transcounts)
    }
    catch(e){
        return res.status(400).json({error:e.message})
    }
}

export const getStockholder=async(req,res)=>{
    try{
       const userId=req.userId
       const user=await prisma.user.findUnique({
        where:{id:userId}
      })
        if(!user){
            return res.status(400).json({error:"no user"})
        }
        const stockId=req.query.stockId
        if(!stockId){
            return res.status(400).json({error:"no stockholder id"})
        }
        const stockholder=await prisma.stockholder.findUnique({
            where:{
                userId_stockId:{
                    userId:user.id,
                    stockId:stockId
                }
            },
            include:{
                stock:true,
                player:true,
                team:true,
                transactions:true
            }
        })
        if(!stockholder){
            return res.json({
                shares:0,
                averageprice:0
            })
        }
        return res.json(stockholder)
    }
    catch(e){
        return res.status(400).json({error:e.message})
    }
}

const getPriceHistory=async(req,res)=>{
    try{
        const {stockId}=req.query
        if(!stockId)return res.status(400).json({error:"stockId required"})
        const history=await prisma.priceHistory.findMany({
            where:{stockId},
            orderBy:{createdAt:"asc"}
        })
        return res.json({history})
    }catch(e){
        return res.status(400).json({error:e.message})
    }
}

export {newStockTransaction,sellTransaction,getuserPortfolio,searchStock,getStockholders,getPriceHistory}