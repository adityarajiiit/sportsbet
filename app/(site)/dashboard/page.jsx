'use client'
import { useSession,signOut } from "next-auth/react"
const dashboard=()=>{
    const session=useSession()
    
    if(session.status==="loading"){
        return <div>Loading...</div>
    }
    let url;
    if(process.env.DOMAIN=='localhost'){
        url=`http://${process.env.DOMAIN}:3000`
    }
    else{
        url=`http://${process.env.DOMAIN}`
    }
    return(
        <div>
            <h1>Dashboard</h1>
            <p>Status: {session.status}</p>
            
            <p>Hi {session?.data?.user?.email}</p>
            {session?.data?.user?.email && <button onClick={()=>signOut({callbackUrl:url})}>Sign Out</button>}
        </div>
    )
}
export default dashboard