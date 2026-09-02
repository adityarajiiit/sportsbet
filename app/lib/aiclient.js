'use client'
import {useState,useCallback} from 'react'
import{toast} from 'sonner'

const api= '/api-backend'

export const useMatchInsight=()=>{
    const[data,setData]=useState(null)
    const[loading,setLoading]=useState(false)
    
    const generate=useCallback(async(matchId)=>{
        if(!matchId){
            return
        }
        setLoading(true)
        try{
           const res=await fetch(`${api}/api/ai/insight/${matchId}`,{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                context:{
                    matchId,
                    pageType:'match'
                }
            })
           })
           const resj=await res.json()
           if(resj.success){
            setData(resj.data)
           }
           else{
            toast.error(resj.error)
           }
        }
        catch(e){
            toast.error(e.message)
        }
        finally{
            setLoading(false)
        }
    },[])
    return{data,loading,generate}
}

export const useBetAdvisor=()=>{
    const[data,setData]=useState(null)
    const[loading,setLoading]=useState(false)
    const[isStreaming,setStreaming]=useState(false)

    const generate=useCallback(async(matchId)=>{
        if(!matchId){
            return
        }
        setLoading(true)
        setStreaming(true)
        setData(null)
        try{
           const res=await fetch(`${api}/api/ai/betadvisor/${matchId}`,
            {
                credentials:'include'
            }
           )
           const reader=res.body.getReader()
           const decoder=new TextDecoder()
           let buffer=''
           while(true){
            const{value,done}=await reader.read()
            if(done){
                break
            }
            buffer+=decoder.decode(value,{stream:true})
            const lines=buffer.split('\n')
            buffer=lines.pop()||''
            for(const l of lines){
                if(!l.startsWith('data:')){
                    continue
                }
                const raw=l.slice(5).trim()
                if(!raw){
                    continue
                }
                try{
                    const parsed=JSON.parse(raw)
                    if(parsed.type==='result'){
                        setData(parsed.data)
                    }
                    if(parsed.type==='error'){
                        toast.error(parsed.message)
                    }
                }
                catch{}
            }
           }
        }
        catch(e){
            toast.error(e.message)
        }
        finally{
            setLoading(false)
            setStreaming(false)
        }
    },[])
    return{data,loading,isStreaming,generate}
}

export const useStockPrediction=()=>{
    const[data,setData]=useState(null)
    const[loading,setLoading]=useState(false)
    const generate=useCallback(async(stockId)=>{
        if(!stockId){
            return
        }
        setLoading(true)
        try{
           const res=await fetch(`${api}/api/ai/stockpredict/${stockId}`,{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                context:{
                    stockId,
                    pageType:'stock'
                }
            })
           })
           const resj=await res.json()
           if(resj.success){
            setData(resj.data)
           }
           else{
            toast.error(resj.error)
           }
        }
        catch(e){
            toast.error(e.message)
        }
        finally{
            setLoading(false)
        }
    },[])
    return{data,loading,generate}
}

export const useAlerts=()=>{
    const[alerts,setAlerts]=useState([])
    const[loading,setLoading]=useState(false)
    const fetchAlerts=useCallback(async(limit=10)=>{
        setLoading(true)
        try{
          const res=await fetch(`${api}/api/ai/alerts?limit=${limit}`,{
            credentials:'include'
          })
          const resj=await res.json()
          if(resj.success){
            setAlerts(resj.data?.alerts||[])
          }
          else{
            toast.error(resj.error)
          }
        }
        catch(e){
            toast.error(e.message)
        }
        finally{
            setLoading(false)
        }
    },[])
    const triggerAlert=useCallback(async(matchId)=>{
        try{
           const res=await fetch(`${api}/api/ai/alerts/trigger`,{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                matchId})
           })
           return res.json()
        }
        catch(e){
            return{
                success:false,
                error:e.message
            }
        }
    },[]
)
return{alerts,loading,fetchAlerts,triggerAlert}
}
