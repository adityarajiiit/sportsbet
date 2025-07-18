import NextAuth from "next-auth/next"
import prisma from "../../../lib/prismadb"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import bcrypt from "bcrypt"
export const authOptions={
    adapter:PrismaAdapter(prisma),
    providers:[
        GoogleProvider({
            clientId:process.env.GOOGLE_ID,
            clientSecret:process.env.GOOGLE_SECRET,
        }),
        CredentialsProvider({
            name:"credentials",
            credentials:{
                email:{label:"Email",type:"text",placeholder:"aditya"},
                password:{label:"Password",type:"password"},
                username:{label:"Username",type:"text",placeholder:"aditya123"},
            },
            async authorize(credentials){
                if(!credentials.email||!credentials.password){
                    throw new Error("Please enter your email and password")
                }
                const user=await prisma.user.findUnique({
                    where:{
                        email:credentials.email,
                    }
                })
                if(!user||!user?.password){
                    throw new Error("No user found")
                }
                const passwordMatch=await bcrypt.compare(credentials.password,user.password)
                if(!passwordMatch){
                    throw new Error("Wrong password")
                }
                if(user.emailVerified==null){
                    throw new Error("Please verify your email")
                }
                return user
            }
        })
    ],
    secret:process.env.SECRET,
    session:{
        strategy:"jwt",
    },
    debug:process.env.NODE_ENV==="development",
}
const handler=NextAuth(authOptions)
export {handler as GET,handler as POST}