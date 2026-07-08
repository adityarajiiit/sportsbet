import {getToken} from 'next-auth/jwt'
import dotenv from 'dotenv'
dotenv.config({path:'../../.env'})
export const verifyToken=async(req,res,next)=>{
    try{
        const token=await getToken({req,secret:process.env.SECRET})
        if(!token){
            return res.json({error:"no token"})
        }
        req.userId=token.sub
        next()
    }
    catch(e){
        return res.json({error:e.message})
    }
}