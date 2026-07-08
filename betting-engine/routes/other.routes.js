import express from 'express'
const router=express.Router()
import { PrismaClient } from '@prisma/client'
const prisma=new PrismaClient()
import { getMatchBets,getUser,allLiveMatches,allUpcomingMatches,allRecentMatches,getLeaderboard,getOddsHistory } from '../controllers/other.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js'
router.get('/livematches',allLiveMatches)
router.get('/upcomingmatches',allUpcomingMatches)
router.get('/recentmatches',allRecentMatches)
router.get('/match/:id',async(req,res)=>{
    const score=await prisma.match.findUnique({
        where:{
            cricbuzzmatchId:parseInt(req.params.id)
        }
    })
    res.json(score)
})
router.get('/getmatchbets',getMatchBets)
router.get('/oddshistory',getOddsHistory)
router.get('/getmatchid',async(req,res)=>{
  const {cricbuzzmatchId}=req.query
  const match=await prisma.match.findUnique({
    where:{
      cricbuzzmatchId:parseInt(cricbuzzmatchId)
    }
  })
  if(!match){
    return res.status(404).json({error: "match not found"})
  }
  res.json({matchId:match.id})
})
router.get('/gettrendingplayers',async(req,res)=>{
  const date=new Date(Date.now()-24*60*60*1000)
  const transactions=await prisma.stockTransaction.findMany({
    where:{
      pagetype:'player',
      createdAt:{
        gte:date
      },
      playerId:{
        not:null
      }
    },
    select:{
      playerId:true,
    }
  })

  const playercounts={}
transactions.forEach((transaction)=>{
  playercounts[transaction.playerId]=(playercounts[transaction.playerId]||0)+1
})

const topplayers=Object.entries(playercounts).sort(([,a],[,b])=>b-a).slice(0,10).map(([playerId,count])=>({playerId,count}))

let players=[]

for(const player of topplayers){
  const playerdata=await prisma.player.findUnique({
    where:{
      id:player.playerId
    },
    include:{
      stock:true
    }
  })
  let pricechange=0
  const currentStockPrice = playerdata.stock.length > 0 ? playerdata.stock[0].price : 50;
  let startprice=currentStockPrice
  const trans=await prisma.stockTransaction.findFirst({
    where:{
      playerId:player.playerId,
      createdAt:{
        gte:date
      }
    },
    orderBy:{
      createdAt:'asc'
    }
  })
  if(trans){
    startprice=trans.price
  }
  pricechange=currentStockPrice-startprice
  players.push({...playerdata,count:player.count,pricechange})
}

if(players.length<10){
  const moreplayers=await prisma.player.findMany({
    take:10-players.length,
    where:{
      id:{notIn:players.map(p=>p.id)}
    },
    include:{
      stock:true
    }
  })
  players=[...players,...moreplayers]
}
res.json(players)
})



router.get('/gettrendingteams',async(req,res)=>{
  const date=new Date(Date.now()-24*60*60*1000)
  const transactions=await prisma.stockTransaction.findMany({
    where:{
      pagetype:'team',
      createdAt:{
        gte:date
      },
      teamId:{
        not:null
      }
    },
    select:{
      teamId:true,
    }
  })
  const teamcounts={}
  transactions.forEach((transaction)=>{
    teamcounts[transaction.teamId]=(teamcounts[transaction.teamId]||0)+1
  })
  const topteams=Object.entries(teamcounts).sort(([,a],[,b])=>b-a).slice(0,10).map(([teamId,count])=>({teamId,count}))
  
  let teams=[]
  for(const team of topteams){
    const teamdata=await prisma.team.findUnique({
      where:{
        id:team.teamId
      },
      include:{
        stock:true
      }
    })
    let pricechange=0
    const currentStockPrice = teamdata.stock.length > 0 ? teamdata.stock[0].price : 50;
    let startprice=currentStockPrice
    const trans=await prisma.stockTransaction.findFirst({
      where:{
        teamId:team.teamId,
        createdAt:{
          gte:date
        }
      },
      orderBy:{
        createdAt:'asc'
      }
    })
    if(trans){
      startprice=trans.price
    }
    pricechange=currentStockPrice-startprice
    teams.push({...teamdata,count:team.count,pricechange})
  }
  if(teams.length<10){
    const moreteams=await prisma.team.findMany({
      take:10-teams.length,
      where:{
        id:{notIn:teams.map(t=>t.id)}
      },
      include:{ stock:true }
    })
    teams=[...teams,...moreteams]
  }
    console.log(teams)

  return res.json(teams)
})
router.get('/getplayer',async(req,res)=>{
  const {id}=req.query
  const player=await prisma.player.findUnique({
    where:{
      id
    },
    include:{
      stock:true
    }
  })
  res.json(player)
})
router.get('/getteam',async(req,res)=>{
  const {id}=req.query
  const team=await prisma.team.findUnique({
    where:{
      id
    },
    include:{
      stock:true
    }
  })
  res.json(team)
})
router.get('/getuser',verifyToken,getUser)
router.get('/leaderboard',getLeaderboard)
export default router

