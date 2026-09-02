import{Kafka} from "kafkajs"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import {fileURLToPath} from "url"
import {dirname} from "path"
import {io} from "../../index.js"
import prisma from "../../utils/prisma.js"
import {inngest} from "../../inngest/inngest.js"

dotenv.config({path:'../../.env'})
const filename=fileURLToPath(import.meta.url)
const __dirname=dirname(filename)
const kafka=new Kafka({
    brokers:[process.env.KAFKA_URI],
    sasl:{
        mechanism:"plain",
        username:process.env.KAFKA_USER,
        password:process.env.KAFKA_PASS
    },
    ssl:{
        ca:[fs.readFileSync(path.resolve(__dirname,'../../certificates/ca.pem'),'utf-8')]
    }
})
const consumer=kafka.consumer({groupId:'stock-consumers'})
const tradeConsumer=kafka.consumer({groupId:'stock-trade-consumers'})

export const stockConsumer=async()=>{
    try{
        await consumer.connect()
        await consumer.subscribe({topics:['stock'],fromBeginning:false})
        await consumer.run({
            eachMessage:async({topic,partition,message,heartbeat})=>{
                const data=JSON.parse(message.value.toString())
                const stock=await prisma.stock.findUnique({
                    where:{id:data.stockId}
                })
                if(!stock){
                    console.log("stock not found")
                    return
                }
                const room=data.playerId||data.teamId
                if(room){
                    io.to(room).emit('stock-update',{
                        stockId:data.stockId,
                        stock,
                        transaction:data
                    })
                }else{
                    io.emit('stock-update',{
                        stockId:data.stockId,
                        stock,
                        transaction:data
                    })
                }
                await heartbeat()
            }
        })
    }
    catch(e){
        console.log(e.message)
        setTimeout(stockConsumer,5000)
    }
}

const processBuy=async(data)=>{
    const transaction=await prisma.$transaction(async(tx)=>{
        const stock=await tx.stock.findUnique({where:{id:data.stockId}})
        if(!stock) throw new Error("no stock")
        const sharestobuy=Math.floor(data.total/stock.price)
        if(sharestobuy<=0) throw new Error("not enough total to buy shares")
        if(sharestobuy>stock.shares) throw new Error("not enough shares available")
        const actualtotal=sharestobuy*stock.price
        const wallet=await tx.wallet.findUnique({where:{userId:data.userId}})
        if(!wallet||wallet.balance<actualtotal) throw new Error("insufficient balance")
        await tx.wallet.update({
            where:{userId:data.userId},
            data:{balance:{decrement:actualtotal}}
        })
        const newprice=stock.price*(1+(sharestobuy*0.001))
        await tx.stock.update({
            where:{id:stock.id},
            data:{shares:{decrement:sharestobuy},price:newprice}
        })
        await tx.priceHistory.create({
            data:{stockId:stock.id,price:newprice,pagetype:data.stocktype}
        })
        let stockholder
        const existingStockholder=await tx.stockholder.findUnique({
            where:{userId_stockId:{userId:data.userId,stockId:data.stockId}}
        })
        if(existingStockholder){
            const newtotalshares=existingStockholder.shares+sharestobuy
            const newtotalcost=existingStockholder.shares*existingStockholder.averageprice+actualtotal
            const newaverageprice=newtotalcost/newtotalshares
            stockholder=await tx.stockholder.update({
                where:{id:existingStockholder.id},
                data:{shares:newtotalshares,averageprice:newaverageprice}
            })
        }
        else{
            stockholder=await tx.stockholder.create({
                data:{
                    pagetype:data.stocktype,
                    userId:data.userId,
                    playerId:data.playerId||null,
                    teamId:data.teamId||null,
                    shares:sharestobuy,
                    averageprice:stock.price,
                    stockId:data.stockId
                }
            })
        }
        const transaction=await tx.stockTransaction.create({
            data:{
                pagetype:data.stocktype,
                userId:data.userId,
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
    return transaction
}

const processSell=async(data)=>{
    const transaction=await prisma.$transaction(async(tx)=>{
        const stockholder=await tx.stockholder.findUnique({
            where:{userId_stockId:{userId:data.userId,stockId:data.stockId}}
        })
        if(!stockholder) throw new Error("no stockholder")
        const sharesToSell=data.sharesToSell
        if(stockholder.shares<sharesToSell) throw new Error("not enough shares")
        const stock=await tx.stock.findUnique({where:{id:data.stockId}})
        if(!stock) throw new Error("stock not found")
        const newprice=Math.max(1,stock.price*(1-(sharesToSell*0.001)))
        await tx.stock.update({
            where:{id:stock.id},
            data:{shares:{increment:sharesToSell},price:newprice}
        })
        await tx.priceHistory.create({
            data:{stockId:stock.id,price:newprice,pagetype:stock.pagetype}
        })
        const sellvalue=sharesToSell*stock.price
        const newtotalshares=stockholder.shares-sharesToSell
        const updatedstockholder=await tx.stockholder.update({
            where:{id:stockholder.id},
            data:{shares:newtotalshares,averageprice:stockholder.averageprice}
        })
        const transaction=await tx.stockTransaction.create({
            data:{
                pagetype:data.stocktype,
                userId:data.userId,
                playerId:data.playerId||null,
                teamId:data.teamId||null,
                type:"sell",
                price:stock.price,
                shares:sharesToSell,
                total:sellvalue,
                stockholderId:stockholder.id,
                stockId:data.stockId
            }
        })
        await tx.wallet.update({
            where:{userId:data.userId},
            data:{balance:{increment:sellvalue}}
        })
        if(newtotalshares===0){
            await tx.stockholder.delete({where:{id:updatedstockholder.id}})
        }
        return transaction
    })
    return transaction
}

export const stockTradeConsumer=async()=>{
    try{
        await tradeConsumer.connect()
        await tradeConsumer.subscribe({topics:['stock-trade'],fromBeginning:false})
        await tradeConsumer.run({
            eachMessage:async({topic,partition,message,heartbeat})=>{
                const data=JSON.parse(message.value.toString())
                try{
                    let transaction
                    if(data.type==="buy"){
                        transaction=await processBuy(data)
                        io.to(data.userId).emit('notification',{
                            message:`Bought ${transaction.shares} shares at ₹${parseFloat(transaction.price).toFixed(2)}`
                        })
                    }else if(data.type==="sell"){
                        transaction=await processSell(data)
                        io.to(data.userId).emit('notification',{
                            message:`Sold ${transaction.shares} shares at ₹${parseFloat(transaction.price).toFixed(2)}`
                        })
                    }
                    if(transaction){
                        const room=data.playerId||data.teamId
                        if(room){
                            io.to(room).emit('stock-update',{stockId:data.stockId,transaction})
                        }else{
                            io.emit('stock-update',{stockId:data.stockId,transaction})
                        }
                        const stockholders=await prisma.stockholder.findMany({
                            where:{stockId:data.stockId}
                        })
                        for(const stockholder of stockholders){
                            await inngest.send({
                                name:'stock.alerts',
                                data:{stockholderId:stockholder.id}
                            })
                        }
                    }
                }catch(e){
                    console.log("trade failed:",e.message)
                    io.to(data.userId).emit('notification',{message:`Trade failed: ${e.message}`})
                }
                await heartbeat()
            }
        })
    }
    catch(e){
        console.log(e.message)
        setTimeout(stockTradeConsumer,5000)
    }
}