import bcrypt from 'bcrypt';
import prisma from '@/app/lib/prismadb'
import { generateVerificationToken } from '@/app/lib/token';
import { NextResponse } from 'next/server';
import sendEmail from '@/app/lib/nodemailer';
export async function POST(request){
    const body=await request.json()
    const {name,email,password}=body
    const role='User'
    if(!name||!email||!password||!role){
        return new NextResponse('Missing Fields',{status: 400})
    }
    const exist=await prisma.user.findUnique({where:{email}})
    if(exist){
        return new NextResponse('User Already Exists')
    }
    const hashedPassword=await bcrypt.hash(password,10)
    const user=await prisma.user.create({
        data:{
            name,
            email,
            password:hashedPassword,
            role
        }
    })
    const token=await generateVerificationToken(email)
    console.log('Token:',token)
    if(!token){
        return new NextResponse('Error Generating Token')
    }
let link;
if(process.env.DOMAIN=='localhost'){
    link=`http://${process.env.DOMAIN}:3000/verify/${token.token}`
    console.log('Verification Link:',link)
}
else{
    link=`http://${process.env.DOMAIN}/verify/${token.token}`
}
const sendemail=await sendEmail(email,link)
if(!sendemail){
    return new NextResponse('Error Sending Email')
}

    return NextResponse.json(user)
}