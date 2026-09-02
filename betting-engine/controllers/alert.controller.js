import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})
import prisma from '../utils/prisma.js'

const newAlert=async(req,res)=>{
    try{
    const userId=req.userId
    console.log(userId)
    const user=await prisma.user.findUnique({
        where:{id:userId}
    })
    if(!user){
        return res.status(400).json({error:"not a user"})
    }
    const data=req.body
    console.log(data)
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
    console.log(alert)

    if(!alert){
        return res.status(400).json({error:"alert not created"})
    }
    return res.json({alert})
}
catch(e){
    return res.status(500).json({error:e.message})
}
}
const deleteAlert=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{id:userId}
})
if(!user){
    return res.status(400).json({error:"not a user"})
}
const alertId=req.params.id
const alert=await prisma.alert.delete({
    where:{id:alertId,userId:user.id}
})
if(!alert){
    return res.status(404).json({error:"alert not found"})
}
return res.json({alert})
}
catch(e){
    return res.status(500).json({error:e.message})
}
}
export {newAlert,deleteAlert}