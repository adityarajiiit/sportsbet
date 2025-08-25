import s3 from '../services/aws.client.js'
import dotenv from 'dotenv'
import {PrismaClient} from "@prisma/client"
import {CreateBucketCommand, DeleteBucketCommand,PutObjectCommand,DeleteObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


const prisma=new PrismaClient()

dotenv.config()

export const createBucket=async(req,res)=>{
    try {
        const userId=req.userId
        const user=await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user){
            return res.json({error: "no user found"})
        }
        const bucketname=`sportsbet-${userId}`
        await s3.send(new CreateBucketCommand({
            Bucket:bucketname
        }))
        return res.send("bucket created")
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export const deleteBucket=async(req,res)=>{
    try {
        const userId=req.userId
        const user=await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user){
            return res.json({error:"no user found"})
        }
        const bucketname=`sportsbet-${userId}`
        await s3.send(new DeleteBucketCommand({
            Bucket:bucketname
        }))
        return res.send("bucket deleted")
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export const putFile=async(req,res)=>{
    try{
        const userId=req.userId
        const user=await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user){
            return res.json({error:"no user found"})
        }
        const bucketname=`sportsbet-${userId}`
        const file=req.file
        if(!file){
            return res.json({error:"no file found"})
        }
        const name=`${Date.now()}-${file.originalname}`
        await s3.send(new PutObjectCommand({
            Bucket:bucketname,
            Key:name,
            Body:file.buffer,
            ContentType:file.mimetype,
            
        }))
       const fileinfo= await prisma.file.create({
            data:{
                userId,
                filename:name,
                mimetype:file.mimetype,
                bucketname
            }
        })
        const url=`https://${bucketname}.${process.env.STORJ_DOMAIN}/${name}`
        return res.json({url,fileinfo})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export const deleteFile=async(req,res)=>{
    try{
        const userId=req.userId
        const user=await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user){
            return res.json({error:"no user "})
        }
        const fileId=req.params.id
        if(!fileId){
            return res.json({error:"no file id"})
        }
        const file=await prisma.file.findUnique({
            where:{id:fileId}
        })
        if(!file){
            return res.json({error:"no file found"})
        }
        await s3.send(new DeleteObjectCommand({
            Bucket:file.bucketname,
            Key:file.filename
        }))
        await prisma.file.delete({
            where:{id:fileId}
        })
        return res.send("file deleted")
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export const tempbucket=async(req,res)=>{
    try{
        const bucketname=`sportsbet-${req.body.userId}-temp`
        console.log(bucketname)
        const temp=await s3.send(new CreateBucketCommand({
            Bucket:bucketname
        }))
        console.log(temp)
        return res.send("temp bucket created")
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export const tempbucketdelete=async(req,res)=>{
    try{
        const bucketname=`sportsbet-${req.body.userId}-temp`
        await s3.send(new DeleteBucketCommand({
            Bucket:bucketname
        }))
        return res.send("temp bucket deleted")
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export const tempputfile=async(req,res)=>{
    try{
        
        const bucketname=`sportsbet-${req.body.userId}-temp`
        console.log(bucketname)
        const file=req.file
        if(!file){
            return res.json({error:"no file found"})
        }
        const name=`${Date.now()}-${file.originalname}`
       const result=await s3.send(new PutObjectCommand({
            Bucket:bucketname,
            Key:name,
            Body:file.buffer,
            ContentType:file.mimetype,
        }))

        console.log(result)
        const getobject=new GetObjectCommand({
            Bucket:bucketname,
            Key:name
        })
        console.log(getobject)
        const url=await getSignedUrl(s3,getobject)
        return res.json({url,name,getobject})
    }
    catch(e){
        return res.json({error:e.message})
    }
}
export const deletefiletemp=async(req,res)=>{
    try{
        const bucketname=`sportsbet-${req.body.userId}-temp`
        const key=req.body.key
        await s3.send(new DeleteObjectCommand({
            Bucket:bucketname,
            Key:key
        }))
        return res.send("file deleted")
    }
    catch(e){
        return res.json({error:e.message})
    }
}