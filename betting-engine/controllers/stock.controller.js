import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
import { producer } from "../utils/kafka.js/producer.js"
import {io} from "../index.js"
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
        const transaction = await prisma.$transaction(async (tx) => {
            const stock=await tx.stock.findUnique({
                where:{
                    id:data.stockId
                }
            })
            if(!stock){
                throw new Error("no stock")
            }
            console.log("data is :",data)
            const sharestobuy=Math.floor(data.total/stock.price)
            if(sharestobuy<=0){
                throw new Error("not enough total to buy shares")
            }
            if(sharestobuy>stock.shares){
                throw new Error("not enough shares available")
            }
            const newprice=stock.price+(sharestobuy*0.1)
            await tx.stock.update({
                where:{
                    id:stock.id
                },
                data:{
                    shares:{
                        decrement:sharestobuy
                    },
                    price:newprice
                }
            })
            await tx.priceHistory.create({
                data:{
                    stockId:stock.id,
                    price:newprice,
                    pagetype:data.stocktype
                }
            })
            const actualtotal=sharestobuy*stock.price
            const wallet=await tx.wallet.findUnique({
                where:{
                    userId:user.id
                }
            })
            if(!wallet||wallet.balance<actualtotal){
                throw new Error("insufficient balance")
            }
            await tx.wallet.update({
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
            const existingStockholder=await tx.stockholder.findUnique({
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
                stockholder=await tx.stockholder.update({
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
                stockholder=await tx.stockholder.create({
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
            const transaction=await tx.stockTransaction.create({
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
            return transaction
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
        io.to(userId).emit('notification',{
            message:`Bought ${transaction.shares} shares at ₹${parseFloat(transaction.price).toFixed(2)}`
        })
        return res.json(transaction)
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
        const transaction = await prisma.$transaction(async (tx) => {
            const stockholder=await tx.stockholder.findUnique({
                where:{
                    userId_stockId:{
                        userId:user.id,
                        stockId:data.stockId
                    }
                }
            })
            if(!stockholder){
                throw new Error("no stockholder")
            }
            
            if(stockholder.shares<data.shares){
                throw new Error("not enough shares")
            }
            const stock=await tx.stock.findUnique({
                where:{
                    id:data.stockId
                }
            })
            if(!stock){
                throw new Error("stock not found")
            }
            let newprice=stock.price-(data.shares*0.1)
            if(newprice<1)newprice=1
            await tx.stock.update({
                where:{
                    id:stock.id
                },
                data:{
                    shares:{
                        increment:data.shares
                    },
                    price:newprice
                }
            })
            await tx.priceHistory.create({
                data:{
                    stockId:stock.id,
                    price:newprice,
                    pagetype:stock.pagetype
                }
            })
            const sellvalue=data.shares*stock.price
            const newtotalshares=stockholder.shares-data.shares
            let newavgprice=stockholder.averageprice
            // average price remains the same when selling
            const updatedstockholderId=await tx.stockholder.update({
                where:{
                    id:stockholder.id
                },
                data:{
                    shares:newtotalshares,
                    averageprice:newavgprice
                }
            })

            const transaction=await tx.stockTransaction.create({
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

            await tx.wallet.update({
                where:{userId:user.id},
                data:{
                    balance:{
                        increment:sellvalue
                    }
                }
            })
            
            if(newtotalshares===0){
                await tx.stockholder.delete({
                    where:{
                        id:updatedstockholderId.id
                    }
                })
            }
            return transaction
        })
        
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
        io.to(userId).emit('notification',{
            message:`Sold ${transaction.shares} shares at ₹${parseFloat(transaction.price).toFixed(2)}`
        })
        return res.json(transaction)
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