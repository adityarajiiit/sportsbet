import { verifyToken } from "@/app/lib/token"
import Link from "next/link"
export default async function Verify({params}){
    const token= await params?.token||""
    if(!token){
        return <h1>No Token is Provided</h1>
    }
    const verify=await verifyToken(token)
    if(!verify){
        return <h1>Token is Invalid</h1>
    }
    return(
        <>
        <h1>Email Verified</h1>
        <h2>Click The Link Below to Login</h2>
        <Link href="/login">Login</Link>
        </>
    )
}