import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})

import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()

const newAlert=async(req,res)=>{
    try{
    const userId=req.userId
    const user=await prisma.user.findUnique({
        where:{id:userId}
    })
    if(!user){
        return res.json({error:"not a user"})
    }
    const data=req.body
    const alert=await prisma.alert.create({
        data:{
            userId:user.id,
            pagetype:data.pagetype,
            betId:data.betId||null,
            stockholderId:data.stockholderId||null,
            condition:data.condition,
            status:"alertcreated"
        }
    })
    if(!alert){
        return res.json({error:"alert not created"})
    }
    return res.json({alert})
}
catch(e){
    return res.json({error:e.message})
}
}
const deleteAlert=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{id:userId}
})
if(!user){
    return res.json({error:"not a user"})
}
const alertId=req.params.id
const alert=await prisma.alert.delete({
    where:{id:alertId}
})
if(!alert){
    return res.json({error:"alert not found"})
}
return res.json({alert})
}
catch(e){
    return res.json({error:e.message})
}
}
export {newAlert,deleteAlert}