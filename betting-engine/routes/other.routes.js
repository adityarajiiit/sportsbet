import express from 'express'
const router=express.Router()
import { PrismaClient } from '@prisma/client'
const prisma=new PrismaClient()
router.get('/livematches',async(req,res)=>{
  const matches=await prisma.match.findMany({
    where:{
      matchState:'Live'
    }
  })

  res.json(matches)
})
router.get('/upcomingmatches',async(req,res)=>{
  const matches=await prisma.match.findMany({
    where:{
      matchState:'Upcoming'
    }
  })
  console.log(matches)
  res.json(matches)
})
router.get('/recentmatches',async(req,res)=>{
    const matches=await prisma.match.findMany({
      where:{
        matchState:'Recent'
      }
    })
    res.json(matches)
})
router.get('/match/:id',async(req,res)=>{
    const score=await prisma.match.findUnique({
        where:{
            cricbuzzmatchId:parseInt(req.params.id)
        }
    })
    res.json(score)
})
export default router