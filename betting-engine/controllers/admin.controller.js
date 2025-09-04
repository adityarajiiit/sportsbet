import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})
import {PrismaClient} from "@prisma/client"

const prisma=new PrismaClient()
export const newTeam=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId,
        role:"admin"
    }
})
if(!user){
    return res.json({error:"No user or user not an admin"})
}
const data=req.body
const team=await prisma.team.create({
    data:{
        name:data.name,
        playerIds:data.playerIds,
        matchIds:[],
        stats:data.stats||null,
        
    }
})
if(!team){
    return res.json({error:"tema not created"})
}
return res.json({team})
    }
    catch(e){
        return res.status(500).json({error:e.message})
    }
}
export const newPlayer=async(req,res)=>{
    try{
    const userId=req.userId
    const user=await prisma.user.findUnique({
    where:{
        id:userId,
        role:"admin"
    }
})
    if(!user){
        return res.json({error:"no user or user not an admin"})
    }
    const data=req.body
    const player=await prisma.player.create({
        data:{
            name:data.name,
            teamId:data.teamId,
            stats:data.stats||null,
            currprice:data.currprice,
            shares:data.shares,
            matchIds:[],
            teamName:data.teamName||null
        }
    })
    if(!player){
        return res.json({error:"player not created"})
    }
    const team=await prisma.team.update({
        where:{
            id:data.teamId
        },
        data:{
            playerIds:{
                push:player.id
            }
        }
    })
    if(!team){
        return res.json({error:"team not updated"})
    }
return res.json({player})
}
catch(e){
    return res.status(500).json({error:e.message})
}
    
}

export const newMatch=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId,
        role:"admin"
    }
})
if(!user){
    return res.json({error:"no user or user not an admin"})
}
const data=req.body
const players1=await prisma.player.findMany({
    where:{
        id:{
            in:data.teamIds[0]
        }
    }
})
if(players1.length===0){
    return res.json({error:"no players found for team 1"})
}
const players2=await prisma.player.findMany({
    where:{
        id:{
            in:data.teamIds[1]
        }
    }
})
if(players2.length===0){
    return res.json({error:"no players found for team 2"})
}
const allplayers=[...players1,...players2]
const playerids=allplayers.map(player=>player.id)
const match=await prisma.match.create({
    data:{
        title:data.title,
        teamIds:data.teamIds,
        playerIds:playerids,
        start:data.start,
        end:data.end,
        status:data.status,
        stats:data.stats||null,

    }
})
if(!match){
    return res.json({error:"match not created"})
}

const newbet=await prisma.matchbet.create({
    data:{
        matchId:match.id,
        title:data.title,
        status:data.status,
        outcomes:[]
    }
})
if(!newbet){
    return res.json({error:"match bet not created"})
}
const outcomes=await prisma.matchbetoutcomes.createMany({
    data:data.outcomes.map(outcome=>({
        matchbetId:newbet.id,
        teamId:outcome.teamId,
        odds:outcome.odds,
        total:outcome.total
    }))
})
if(outcomes.count===0){
    return res.json({error:"match bet outcomes not created"})
}
const updatedplayers=await prisma.player.updateMany({
    where:{
        id:{
            in:playerids
        }
    },
    data:{
        matchIds:{
            push:match.id
        }
    }
})
return res.json({match})
}
catch(e){
    return res.status(500).json({error:e.message})
}
}
export const deleteMatch=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId,
        role:"admin"
    }
})
if(!user){
    return res.json({error:"no user or user not an admin"})
}
const matchId=req.params.id
if(!matchId){
    return res.json({error:"no match id"})
}
const match=await prisma.match.delete({
    where:{
        id:matchId
    },
    include:{
        players:true,
        teams:true
    }
})
if(!match){
    return res.json({error:"match not deleted"})
}
const players=await prisma.player.updateMany({
    where:{
        id:{
            in:match.playerIds
        }
    },
    data:{
        matchIds:{
            set:match.playerIds.filter(id=>id!==matchId)
        }
    }
})
const teams=await prisma.team.updateMany({
    where:{
        id:{
            in:match.teamIds
        }
    },
    data:{
        matchIds:{
            set:match.teamIds.filter(id=>id!==matchId)
        }
    }
})
return res.json({match})
    }
    catch(e){
        return res.status(500).json({error:e.message})
    }
}
export const deletePlayer=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId,
        role:"admin"
    }
})
if(!user){
    return res.json({error:"no user"})
}
const playerId=req.params.id
if(!playerId){
    return res.json({error:"no player id"})
}
const player=await prisma.player.delete({
    where:{
        id:playerId
    },
    include:{
        team:true
    }
})
if(!player){
    return res.json({error:"player not deleted"})
}
const team=await prisma.team.update({
    where:{
        id:player.teamId
    },
    data:{
        playerIds:{
            set:player.team.playerIds.filter(id=>id!==playerId)
        }
    }
})
return res.json({player})
    }
    catch(e){
        return res.status(500).json({error:e.message})
    }
}
export const deleteTeam=async(req,res)=>{
    try{
 const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId,
        role:"admin"
    }
})
if(!user){
    return res.json({error:"no user or user not an admin"})
}
const teamId=req.params.id
if(!teamId){
    return res.json({error:"no team id"})
}
const team=await prisma.team.delete({
    where:{
        id:teamId
    },
    include:{
        players:true
    }
})
if(!team){
    return res.json({error:"team not deleted"})
}
const players=await prisma.player.updateMany({
    where:{
        id:{
            in:team.playerIds
        }
    },
    data:{
        teamId:null
    }
})
return res.json({team})
    }
    catch(e){
        return res.status(500).json({error:e.message})
    }
}
export const newMatchBet=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId,
        role:"admin"
    }
})
    if(!user){
        return res.json({error:"not a user"})
    }
    const data=req.body
    const matchbet=await prisma.matchbet.create({
        data:{
            title:data.title,
            matchId:data.matchId,
            status:data.status,
            outcomes:[]
        }
    })
    if(!matchbet){
        return res.json({error:"match bet not created"})
    }
    const outcomes=await prisma.matchbetoutcomes.createMany({
        data:data.outcomes.map(outcome=>({
            matchbetId:matchbet.id,
            teamId:outcome.teamId,
            odds:outcome.odds,
            total:outcome.total
        }))
    })
    return res.json({matchbet, outcomes})
}
catch(e){
    return res.status(500).json({error:e.message})
}
}
export const newStock=async(req,res)=>{
    try{
const userId=req.userId
const user=await prisma.user.findUnique({
    where:{
        id:userId,
        role:"admin"
    }
})
if(!user){
        return res.json({error:"not a user"})
    }
    const data=req.body
    const stock=await prisma.stock.create({
        data:{
            pagetype:data.stocktype,
            playerId:data.playerId||null,
            teamId:data.teamId||null,
            stockholders:[],
            stockTransactions:[],
            name:data.name,
            price:data.price,
            shares:data.shares,
            total:data.total,
        }
    })
    if(!stock){
        return res.json({error:"stock not created"})
    }
    return res.json({stock})
    }
    

    catch(e){
        return res.json({error:e.message})
    }
}
