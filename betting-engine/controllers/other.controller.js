import { PrismaClient } from '@prisma/client'
const prisma=new PrismaClient()
export const allLiveMatches=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1
        const limit=parseInt(req.query.limit)||10
        const skip=(page-1)*limit
        const matches=await prisma.match.findMany({
            where:{
                matchState:"Live"
            },
            orderBy:{
                start:'asc'
            },
            skip,
            take:limit
        })
        if(!matches){
            return res.status(400).json({error:"no matches found"})
        }
        const total=await prisma.match.count({where:{matchState:"Live"}})
        return res.json({matches,totalPages:Math.ceil(total/limit),currentPage:page})
    }
    catch(e){
        return res.status(400).json({error:e.message})
    }
}
export const allUpcomingMatches=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1
        const limit=parseInt(req.query.limit)||10
        const skip=(page-1)*limit
        const matches=await prisma.match.findMany({
            where:{
                matchState:"Upcoming"
            },
            orderBy:{
                start:'asc'
            },
            skip,
            take:limit
        })
        if(!matches){
            return res.status(400).json({error:"no matches found"})
        }
        const total=await prisma.match.count({where:{matchState:"Upcoming"}})
        return res.json({matches,totalPages:Math.ceil(total/limit),currentPage:page})
    }
    catch(e){
        return res.status(400).json({error:e.message})
    }
}

export const allRecentMatches=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1
        const limit=parseInt(req.query.limit)||10
        const skip=(page-1)*limit
        const matches=await prisma.match.findMany({
            where:{
                matchState:"Recent"
            },
            orderBy:{
                start:'desc'
            },
            skip,
            take:limit
        })
        if(!matches){
            return res.status(400).json({error:"no matches found"})
        }
        const total=await prisma.match.count({where:{matchState:"Recent"}})
        return res.json({matches,totalPages:Math.ceil(total/limit),currentPage:page})
    }
    catch(e){
        return res.status(400).json({error:e.message})
    }
}

export const getMatchBets=async(req,res)=>{
    try{
    console.log("Hi")
    const matchId=req.query.matchId

    console.log(matchId)
    if(!matchId){
        return res.status(400).json({error:"matchId is required"})
    }
    const match=await prisma.match.findUnique({
        where:{id:matchId}
    })
    if(!match){
        return res.status(400).json({error:"no match found"})
    }
    let matchbet=await prisma.matchbet.findUnique({
            where:{matchId:match.id}
    })
    let matchbetoutcomes
        if(!matchbet){
            matchbet=await prisma.matchbet.create({
                data:{
                    matchId:match.id,
                    title:match.title,
                    status:match.matchState
                }
            })
            matchbetoutcomes=await prisma.matchbetoutcomes.createMany({
                data:[
                    {
                        matchbetId:matchbet.id,
                        teamId:parseInt(match.team1.teamId),
                        teamname:match.team1.teamName,
                        odds:1.0,
                        total:0
                    },
                    {
                        matchbetId:matchbet.id,
                        teamId:parseInt(match.team2.teamId),
                        teamname:match.team2.teamName,
                        odds:1.0,
                        total:0
                    }
                ]
            })
            matchbetoutcomes=await prisma.matchbetoutcomes.findMany({
                where:{matchbetId:matchbet.id}
            })
        }
        else{
            matchbetoutcomes=await prisma.matchbetoutcomes.findMany({
                where:{matchbetId:matchbet.id}
            })
        }
        console.log(matchbet,matchbetoutcomes)
        return res.json({
            matchbets:matchbet,
            matchbetoutcomes
        })
    }
    catch(e){
         return res.status(400).json({error:e.message})
    }
}
export const getOddsHistory=async(req,res)=>{
    try{
        const matchbetId=req.query.matchbetId
        if(!matchbetId){
            return res.status(400).json({error:"matchbetId is required"})
        }
        const history=await prisma.oddsHistory.findMany({
            where:{matchbetId:matchbetId},
            orderBy:{timestamp:'asc'}
        })
        return res.json({history})
    }
    catch(e){
        return res.status(400).json({error:e.message})
    }
}
export const getUser=async(req,res)=>{
    try{
       const userId=req.userId
       if(!userId){
        return res.status(400).json({error:"no userid"})
       }
       const user=await prisma.user.findUnique({
        where:{
            id:userId
        },
        select:{
            id:true,
            email:true,
            image:true,
            name:true,
            createdAt:true,
            bets:{
                include:{
                    match:true
                }
            },
            stockTransactions:{
                include:{
                    stock:true,
                    stockholder:true
                }
            },
            stockholders:true,
            wallet:true,
            createdAt:true
        }
       })
       const profitamount=user.bets.reduce((total,bet)=>{
            if(bet.status==='won'){
                return total+(bet.amount*bet.odds-bet.amount)
            }
            else if(bet.status==='lost'){
                return total - bet.amount
            }
            return total
        },0)
        const winningamount=user.bets.reduce((total,bet)=>{
            if(bet.status==='won'){
                return total+(bet.amount*bet.odds)
            }
            if(bet.status==='sold' && bet.result && bet.result.price){
                return total+bet.result.price
            }
            return total
        },0)
        const playerstockcount=user.stockholders.filter(stock=>stock.pagetype==='player').length
        const teamstockscount=user.stockholders.filter(stock=>stock.pagetype==='team').length
       const data={
        ...user,
        betscount:user.bets.length,
        profitamount,
        winningamount,
        playerstockcount,
        teamstockscount
       }
       return res.json(data)
    }
    catch(e){
        return res.status(400).json({error:e.message})
    }
}

export const getLeaderboard=async(req,res)=>{
    try{
        const users=await prisma.user.findMany({
            select:{
                id:true,
                name:true,
                image:true,
                bets:{
                    select:{status:true,amount:true,odds:true,result:true}
                }
            }
        })
        const leaderboard=users.map(user=>{
            const profit=user.bets.reduce((total,bet)=>{
                if(bet.status==='won')return total+(bet.amount*bet.odds-bet.amount)
                if(bet.status==='lost')return total-bet.amount
                return total
            },0)
            return{
                id:user.id,
                name:user.name,
                image:user.image,
                profit
            }
        }).sort((a,b)=>b.profit-a.profit).slice(0,10)
        return res.json({leaderboard})
    }catch(e){
        return res.status(400).json({error:e.message})
    }
}