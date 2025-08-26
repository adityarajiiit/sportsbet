import dotenv from "dotenv"
dotenv.config({path:'../../.env'})
import arcjet,{shield,detectBot,tokenBucket} from "@arcjet/node"
import { isSpoofedBot } from "@arcjet/inspect"

const aj=arcjet({
    key:process.env.ARCJET_KEY,
    rules:[
        shield({mode:"LIVE"}),
        detectBot({
            mode:"LIVE",
            allow:[
                "CATEGORY:SEARCH_ENGINE",
                "CATEGORY:SOCIAL_MEDIA",
                "CATEGORY:MONITOR",
                "CATEGORY:PREVIEW"
            ]
        }),
        tokenBucket({
            mode:"LIVE",
            refillRate:5,
            interval:10,
            capacity:10
        })
    ]
})

export const arcjetMiddleware=async(req,res,next)=>{
    const arcjet=await aj.protect(req)
    if(arcjet.isDenied()){
        if(arcjet.reason.isRateLimit()){
            return res.json({error:"Rate limit exceeded"})
        }
        if(arcjet.reason.isBot()&&!isSpoofedBot(req)){
            return res.json({error:"user is a bot"})
        }
        if(arcjet.reason.isShield()){
            return res.json({error:"your request has been blocked"})
        }
        return res.json({error:"unknown error"})
    }
    next()
}