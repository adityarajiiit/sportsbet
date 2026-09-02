"use client"
import React from "react"
import {init,dispose} from "klinecharts"
import {useState,useEffect,useRef} from "react"
import axios from "axios"

const apiurl='/api-backend'

const buildCandles=(history)=>{
    if(!history||history.length===0) return []
    const interval=24*60*60*1000
    const buckets={}
    history.forEach(item=>{
        const t=new Date(item.createdAt).getTime()
        const bucket=Math.floor(t/interval)*interval
        if(!buckets[bucket]){
            buckets[bucket]={
                timestamp:bucket,
                open:parseFloat(item.price),
                high:parseFloat(item.price),
                low:parseFloat(item.price),
                close:parseFloat(item.price),
                volume:1
            }
        }else{
            const p=parseFloat(item.price)
            if(p>buckets[bucket].high) buckets[bucket].high=p
            if(p<buckets[bucket].low) buckets[bucket].low=p
            buckets[bucket].close=p
            buckets[bucket].volume+=1
        }
    })
    return Object.values(buckets).sort((a,b)=>a.timestamp-b.timestamp)
}

function TradeChart({stockId}){
    const chartRef=useRef(null)
    const chartInstance=useRef(null)
    const [loading,setLoading]=useState(true)

    useEffect(()=>{
        if(!chartRef.current||chartInstance.current) return
        chartInstance.current=init(chartRef.current)
        const handleResize=()=>chartInstance.current?.resize()
        window.addEventListener("resize",handleResize)
        return ()=>{
            window.removeEventListener("resize",handleResize)
            dispose(chartRef.current)
            chartInstance.current=null
        }
    },[])

    useEffect(()=>{
        if(!stockId||typeof stockId!=="string"||stockId.length!==24) return
        const fetchData=async()=>{
            setLoading(true)
            try{
                const response=await axios.get(`${apiurl}/api/stocks/pricehistory`,{params:{stockId}})
                const candles=buildCandles(response.data.history||[])
                if(chartInstance.current&&candles.length>0){
                    chartInstance.current.applyNewData(candles)
                }
            }catch(e){
                console.error(e)
            }finally{
                setLoading(false)
            }
        }
        fetchData()
    },[stockId])

    return(
        <div className="h-[28rem] w-full border border-base-content/10 rounded-xl relative">
            {loading&&<div className="absolute inset-0 flex items-center justify-center"><span className="loading loading-spinner loading-md text-info"></span></div>}
            <div ref={chartRef} className="h-[28rem] w-full"></div>
        </div>
    )
}

export default TradeChart
