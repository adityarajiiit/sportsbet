import crypto from 'crypto';
import prisma from '@/app/lib/prismadb'
import {v4 as uuidv4} from 'uuid';
export const generateVerificationToken=async(email)=>{
    try{
        
if(!email){
    throw new Error('Email is required');
}
const user=await prisma.user.findUnique({where:{email}})
if(!user){
    throw new Error('User not found');
}

const token=await prisma.verificationToken.findUnique({
    where:{
        email
    }
})
if(token){
    await prisma.verificationToken.delete({
        where:{
            id:token.id
        }
    })
}
const code=uuidv4();
console.log('Generated Code:',code);
const expiresAt=new Date(Date.now()+30*60*1000);
const verificationToken=await prisma.verificationToken.create({
    data:{
        email,
        token:code,
        expiresAt
    }
})

return verificationToken;
    }
    catch(error){
        console.log('Error generating token:',error);
    }
}
export const verifyToken=async(token)=>{
    try{
if(!token){
    throw new Error('Token is required');
}
const verificationToken=await prisma.verificationToken.findUnique({
    where:{
        token
    }
})
if(!verificationToken){
    throw new Error('Token not found');
}
const currentDate=new Date();
if(verificationToken.expiresAt<currentDate){
    await prisma.verificationToken.delete({
        where:{
            id:verificationToken.id
        }
    })
    throw new Error('Token expired');
}
await prisma.verificationToken.delete({
    where:{
        id:verificationToken.id
    }
})
const user=await prisma.user.findUnique({
    where:{
        email:verificationToken.email
    }
})
if(!user){
    throw new Error('User not found');
}

await prisma.user.update({
    where:{
        email:verificationToken.email
    },
    data:{
        emailVerified:new Date(),
    }
})
return user;
    }
    catch(error){
        console.log('Error verifying token',error);
    }
}