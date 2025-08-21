import jwt from 'jsonwebtoken'
export const verifyToken=(req,res,next)=>{
    const token=req.cookies.token
    if(!token){
        return res.json({error:"no token"})
    }
    try{
        const user=jwt.verify(token,process.env.SECRET)
        if(!user){
            return res.json({error:"error while decoding"})
        }
        req.userId=user.id
        next()
    }
    catch(e){
        return res.json({error:e.message})
    }
}