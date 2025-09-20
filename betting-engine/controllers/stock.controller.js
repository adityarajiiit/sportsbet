import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
import { producer } from "../utils/kafka.js/producer.js"
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
        const stock=await prisma.stock.findUnique({
            where:{
                id:data.stockId
            }
        })
        if(!stock){
            return res.json({error:"no stock"})
        }
        console.log("data is :",data)
        const sharestobuy=Math.floor(data.total/data.price)
        if(sharestobuy<=0){
            return res.json({error:"not enough total to buy shares"})
        }
        if(sharestobuy>stock.shares){
            return res.json({error:"not enough shares available"})
        }
        const actualtotal=sharestobuy*stock.price
        const wallet=await prisma.wallet.findUnique({
            where:{
                userId:user.id
            }
        })
        if(!wallet||wallet.balance<actualtotal){
            return res.json({error:"insufficient balance"})
        }
        await prisma.wallet.update({
            where:{
                userId:user.id
            },
            data:{
                balance:{
                    decrement:actualtotal
                }
            }
        })
        let stockholder
        const existingStockholder=await prisma.stockholder.findUnique({
            where:{
                userId_stockId:{
                    userId:user.id,
                    stockId:data.stockId
                }
            }
        })
        if(existingStockholder){
            const newtotalshares=existingStockholder.shares+sharestobuy
            const newtotalcost=existingStockholder.shares*existingStockholder.averageprice+actualtotal
            const newaverageprice=newtotalcost/newtotalshares
            stockholder=await prisma.stockholder.update({
                where:{
                    id:existingStockholder.id
                },
                data:{
                    shares:newtotalshares,
                    averageprice:newaverageprice
                }
            })
        }
        else{
            stockholder=await prisma.stockholder.create({
                data:{
                    pagetype:data.stocktype,
                    userId:user.id,
                    playerId:data.playerId||null,
                    teamId:data.teamId||null,
                    shares:sharestobuy,
                    averageprice:stock.price,
                    stockId:data.stockId
                }
            })
        }
        const transaction=await prisma.stockTransaction.create({
            data: {
                pagetype:data.stocktype,
                userId:user.id,
                playerId:data.playerId||null,
                teamId:data.teamId||null,
                type:"buy",
                price:stock.price,
                shares:sharestobuy,
                total:actualtotal,
                stockholderId:stockholder.id,
                stockId:data.stockId
            }
        })
        await producer.connect()
        await producer.send({
            topic:'stock',
            messages:[{
                key:transaction.id,
                value:JSON.stringify({
                    ...transaction,
                    stocktype: data.stocktype
                })
            }]
        })
        await producer.disconnect()
        
        return res.json(transaction)
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
        const stockholder=await prisma.stockholder.findUnique({
            where:{
                userId_stockId:{
                    userId:user.id,
                    stockId:data.stockId
                }
            }
        })
        if(!stockholder){
            return res.json({error:"no stockholder"})
        }
        
        if(stockholder.shares<data.shares){
            return res.json({error:"not enough shares"})
        }
        const stock=await prisma.stock.findUnique({
            where:{
                id:data.stockId
            }
        })
        if(!stock){
            return res.json({error:"stock not found"})
        }
        const sellvalue=data.shares*stock.price
        const newtotalshares=stockholder.shares-data.shares
        let newavgprice=stockholder.averageprice

        if(newtotalshares>0){
            const oldtotalvalue=stockholder.shares*stockholder.averageprice
            const soldvalue=data.shares*stockholder.averageprice
            newavgprice=(oldtotalvalue-soldvalue)/newtotalshares
        }
        const updatedstockholderId=await prisma.stockholder.update({
            where:{
                id:stockholder.id
            },
            data:{
                shares:newtotalshares,
                averageprice:newavgprice
            }
        })

        const transaction=await prisma.stockTransaction.create({
            data:{
                pagetype:data.stocktype,
                userId:user.id,
                playerId:data.playerId||null,
                teamId:data.teamId||null,
                type:"sell",
                price:stock.price,
                shares:data.shares,
                total:sellvalue,
                stockholderId:stockholder.id,
                stockId:data.stockId,
            }
        })

        await prisma.wallet.update({
            where:{userId:user.id},
            data:{
                balance:{
                    increment:sellvalue
                }
            }
        })
        
        if(newtotalshares===0){
            await prisma.stockholder.delete({
                where:{
                    id:updatedstockholderId.id
                }
            })
        }
        
        await producer.connect()
        await producer.send({
            topic:'stock',
            messages:[{
                key:transaction.id,
                value:JSON.stringify({
                    ...transaction,
                    stocktype:data.stocktype
                })
            }]
        })
        await producer.disconnect()
        
        return res.json(transaction)
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
        transactions:true,
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
return res.json({stockholders})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const searchStock=async(req,res)=>{
    try{
const query=req.query.q
console.log(query)
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
        return res.json({error:e.message})
    }
}
export const getStockholder=async(req,res)=>{
    try{
       const userId=req.userId
       const user=await prisma.user.findUnique({
        where:{id:userId}
      })
        if(!user){
            return res.json({error:"no user"})
        }
        const stockId=req.query.stockId
        if(!stockId){
            return res.json({error:"no stockholder id"})
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
        return res.json({error:e.message})
    }
}
export {newStockTransaction,sellTransaction,getuserPortfolio,searchStock,getStockholders}