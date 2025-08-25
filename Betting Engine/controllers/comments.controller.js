import dotenv from 'dotenv'
dotenv.config()
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
const newComment=async(req,res)=>{
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
const newcomment=await prisma.comment.create({
    data:{
        pagetype:data.pagetype,
        userId:user.id,
        matchId:data.matchId||null,
        playerId:data.playerId||null,
        teamId:data.teamId||null,
        parentcommentId:data.parentcommentId||null,
        replies:[],
        message:data.message
    }
})
if(!newcomment){
    return res.json({error:"comment not created"})
}
return res.json({newcomment})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const getComments=async(req,res)=>{
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
const comments=await prisma.comment.findMany({
    where:{
        pagetype:data.pagetype,
        matchId:data.matchId||null,
        playerId:data.playerId||null,
        teamId:data.teamId||null,
        parentcommentId:null
    },
    include:{
        replies:true,
        user:true,
        match:true,
        player:true,
        team:true
    },
})
return res.json({comments})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
const deleteComment=async(req,res)=>{
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
const id=req.params.id
if(user.id!==id){
    return res.json({error:"not authorized"})
}
const comment=await prisma.comment.findUnique({
    where:{id:id},
    
})
if(!comment){
    return res.json({error:"comment not found"})
}
const commentdelete=await prisma.comment.delete({
    where:{id:id}
})
if(!commentdelete){
    return res.json({error:"comment not deleted"})
}
return res.json({commentdelete})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export {newComment,getComments,deleteComment}