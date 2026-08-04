import axios from 'axios'
import dotenv from 'dotenv'
import {fileURLToPath} from 'url'
import path from 'path'
const __dirname=path.dirname(fileURLToPath(import.meta.url))
dotenv.config({path:path.resolve(__dirname,'../../.env')})

const aiurl=process.env.AI_ENGINE_URL

export const getMatchInsight=async(req,res)=>{
    try{
        const{matchId}=req.params
        const userId=req.userId
        const response=await axios.post(
            `${aiurl}/api/v1/insights/${matchId}`,
            {
                userId,
                context:req.body.context||{},
                query:req.body.query||''
            }
        )
        res.json(response.data)
    }
    catch(e){
        res.status(500).json({error:e.message})
    }
}
export const getBetAdvice=async(req,res)=>{
    try{
       const {matchId}=req.params
       const userId=req.userId
       const query=req.query.query||''
       res.writeHead(200,{
        'Content-Type':'text/event-stream',
        'Cache-Control':'no-cache',
        'Connection':'keep-alive'
       })
       const response=await axios.get(`${aiurl}/api/v1/bet-advisor/${matchId}?userId=${userId}&query=${encodeURIComponent(query)}`,{
        responseType:'stream'
       })
       response.data.pipe(res)
       req.on('close',()=>{
        response.data.destroy()
       })
    }
    catch(e){
        console.log(e.message)
        if(!res.headersSent){
            res.status(500).json({error:e.message})
        }else{
            res.write(`data: ${JSON.stringify({type:'error',message:e.message})}\n\n`)
            res.end()
        }
    }
}

export const getStockPrediction=async(req,res)=>{
    try{
        const{stockId}=req.params
        const userId=req.userId
        const response=await axios.post(
            `${aiurl}/api/v1/stock-predict/${stockId}`,
            {
                userId,
                context:req.body.context||{},
                query:req.body.query||''
            }
        )
        res.json(response.data)
    }
    catch(e){
        console.log(e.message)
        res.status(500).json({error:e.message})
    }
}

export const getAlerts=async(req,res)=>{
    try{
        const userId=req.userId
        const response=await axios.get(`${aiurl}/api/v1/alerts?userId=${userId}&limit=${20}`)
        res.json(response.data)
    }
    catch(e){
        console.log(e.message)
        res.status(500).json({error:e.message})
    }
}

export const triggerAlert=async(req,res)=>{
    try{
       const response=await axios.post(
        `${aiurl}/api/v1/alerts/trigger`,
        {
            matchId:req.body.matchId
        }
       )
       res.json(response.data)
    }
    catch(e){
        console.log(e.message)
        res.status(500).json({error:e.message})
    }
}

export const chatStream=async(req,res)=>{
    try{
       const userId=req.userId
       const query=req.body.query
       if(!query){
           return res.status(400).json({error:'query is required'})
       }
       res.writeHead(200,{
        'Content-Type':'text/event-stream',
        'Cache-Control':'no-cache',
        'Connection':'keep-alive'
       })
       const response=await axios.post(
        `${aiurl}/api/v1/chat`,
        {
            userId,
            sessionId:req.body.sessionId||userId,
            query,
            context:req.body.context||{}
        },{
            responseType:'stream'
        }
       )
       response.data.pipe(res)
       req.on('close',()=>{
        response.data.destroy()
       })
    }
    catch(e){
        console.log(e.message)
        if(!res.headersSent){
            res.status(500).json({error:e.message})
        }
        else{
            res.write(`data: ${JSON.stringify({type:'error',message:e.message})}\n\n`)
            res.end()
        }
    }
}