import { PrismaClient } from '@prisma/client'
const prisma=new PrismaClient()
export const allLiveMatches=async(req,res)=>{
    try{
        const matches=await prisma.match.findMany({
            where:{
                matchState:"Live"
            }
        })
        if(!matches){
            return res.json({error:"no matches found"})
        }
        return res.json({matches})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export const allUpcomingMatches=async(req,res)=>{
    try{
        const matches=await prisma.match.findMany({
            where:{
                matchState:"Upcoming"
            }
        })
        if(!matches){
            return res.json({error:"no matches found"})
        }
        return res.json({matches})
    }
    catch(e){
        return res.json({error:e.message})
    }
}

export const allRecentMatches=async(req,res)=>{
    try{
        const matches=await prisma.match.findMany({
            where:{
                matchState:"Recent"
            }
        })
        if(!matches){
            return res.json({error:"no matches found"})
        }
        return res.json({matches})
    }
    catch(e){
        return res.json({error:e.message})
    }
}

export const getMatchBets=async(req,res)=>{
    try{
        console.log("Hi")
    const matchId=req.query.matchId

    console.log(matchId)
    if(!matchId){
        return res.json({error:"matchId is required"})
    }
    const match=await prisma.match.findUnique({
        where:{id:matchId}
    })
    if(!match){
        return res.json({error:"no match found"})
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
         return res.json({error:e.message})
    }
}
export const getUser=async(req,res)=>{
    try{
       const userId=req.userId
       if(!userId){
        return res.json({error:"no userid"})
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
        const playerstockcount=user.stockholders.filter(stock=>stock.pagetype==='player').length
        const teamstockscount=user.stockholders.filter(stock=>stock.pagetype==='team').length
       const data={
        ...user,
        betscount:user.bets.length,
        profitamount,
        playerstockcount,
        teamstockscount
       }
       return res.json(data)
    }
    catch(e){
        return res.json({error:e.message})
    }
}