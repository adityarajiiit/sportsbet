"use client"
import React,{useEffect,useRef,useState} from "react"
import axios from "axios"
import { createChart, CrosshairMode, CandlestickSeries } from "lightweight-charts"

const timeframes=[
  {label:"1H",value:"1H"},
  {label:"1D",value:"1D"},
  {label:"1W",value:"1W"},
  {label:"1M",value:"1M"},
]

const PriceHistoryGraph=({stockId})=>{
  const chartContainerRef=useRef(null)
  const chartRef=useRef(null)
  const seriesRef=useRef(null)
  const [loading,setLoading]=useState(true)
  const [selectedTimeframe,setSelectedTimeframe]=useState("1D")
  const [currentPrice,setCurrentPrice]=useState(null)
  const [priceChange,setPriceChange]=useState(null)

  const buildCandles=(history,tf)=>{
    if(!history||history.length===0) return []
    const msMap={
      "1H":60*60*1000,
      "1D":24*60*60*1000,
      "1W":7*24*60*60*1000,
      "1M":30*24*60*60*1000
    }
    const rangeMap={
      "1H":24*60*60*1000,
      "1D":7*24*60*60*1000,
      "1W":30*24*60*60*1000,
      "1M":180*24*60*60*1000
    }
    const interval=msMap[tf]||msMap["1D"]
    const range=rangeMap[tf]||rangeMap["1D"]
    const now=Date.now()
    const filtered=history.filter(item=>now-new Date(item.createdAt).getTime()<=range)
    const source=filtered.length>0?filtered:history
    const buckets={}
    source.forEach(item=>{
      const t=new Date(item.createdAt).getTime()
      const bucket=Math.floor(t/interval)*interval
      if(!buckets[bucket]){
        buckets[bucket]={
          time:Math.floor(bucket/1000),
          open:parseFloat(item.price),
          high:parseFloat(item.price),
          low:parseFloat(item.price),
          close:parseFloat(item.price)
        }
      }else{
        const p=parseFloat(item.price)
        if(p>buckets[bucket].high) buckets[bucket].high=p
        if(p<buckets[bucket].low) buckets[bucket].low=p
        buckets[bucket].close=p
      }
    })
    return Object.values(buckets).sort((a,b)=>a.time-b.time)
  }

  const fetchAndRender=async(tf)=>{
    if(typeof stockId!=="string"||stockId.length!==24){
      setLoading(false)
      return
    }
    setLoading(true)
    try{
      const response=await axios.get(
        `/api-backend/api/stocks/pricehistory?stockId=${stockId}`
      )
      const history=response.data.history||[]
      const candles=buildCandles(history,tf)
      if(seriesRef.current&&candles.length>0){
        seriesRef.current.setData(candles)
        const last=candles[candles.length-1]
        const first=candles[0]
        setCurrentPrice(last.close)
        setPriceChange(((last.close-first.open)/first.open*100).toFixed(2))
        if(chartRef.current){
          chartRef.current.timeScale().fitContent()
        }
      }
    }catch(e){
      console.error(e)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    let chart=null
    const init=async()=>{
      if(!chartContainerRef.current) return
      chart=createChart(chartContainerRef.current,{
        width:chartContainerRef.current.clientWidth,
        height:380,
        layout:{
          background:{color:"transparent"},
          textColor:"#9ca3af"
        },
        grid:{
          vertLines:{color:"rgba(255,255,255,0.05)"},
          horzLines:{color:"rgba(255,255,255,0.05)"}
        },
        crosshair:{
          mode:CrosshairMode.Normal
        },
        rightPriceScale:{
          borderColor:"rgba(255,255,255,0.1)"
        },
        timeScale:{
          borderColor:"rgba(255,255,255,0.1)",
          timeVisible:true,
          secondsVisible:false
        }
      })
      const candleSeries=chart.addSeries(CandlestickSeries, {
        upColor:"#22c55e",
        downColor:"#ef4444",
        borderUpColor:"#22c55e",
        borderDownColor:"#ef4444",
        wickUpColor:"#22c55e",
        wickDownColor:"#ef4444"
      })
      chartRef.current=chart
      seriesRef.current=candleSeries
      const ro=new ResizeObserver(entries=>{
        if(entries.length>0&&chart){
          chart.applyOptions({width:entries[0].contentRect.width})
        }
      })
      ro.observe(chartContainerRef.current)
      await fetchAndRender(selectedTimeframe)
      return ro
    }
    let ro=null
    init().then(r=>{ro=r})
    return()=>{
      if(ro) ro.disconnect()
      if(chart) chart.remove()
      chartRef.current=null
      seriesRef.current=null
    }
  },[stockId])

  useEffect(()=>{
    if(chartRef.current&&seriesRef.current){
      fetchAndRender(selectedTimeframe)
    }
  },[selectedTimeframe])

  const isPositive=parseFloat(priceChange)>=0

  return(
    <div className="w-full bg-base-100 p-4 rounded-xl border border-base-content/10">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-poppins font-medium text-base">Price History</h3>
          {currentPrice!==null&&(
            <div className="flex items-center gap-2 mt-1">
              <span className="font-inter font-bold text-xl">₹{currentPrice?.toFixed(2)}</span>
              <span className={`text-xs font-poppins font-medium px-2 py-0.5 rounded-full ${isPositive?"bg-success/15 text-success":"bg-error/15 text-error"}`}>
                {isPositive?"+":""}{priceChange}%
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {timeframes.map(tf=>(
            <button
              key={tf.value}
              className={`px-2.5 py-1 text-xs font-poppins rounded-md transition-all ${selectedTimeframe===tf.value?"bg-info text-white":"bg-base-200 text-base-content/60 hover:bg-base-300"}`}
              onClick={()=>setSelectedTimeframe(tf.value)}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      {loading&&(
        <div className="h-[380px] flex items-center justify-center">
          <span className="loading loading-spinner loading-md text-info"></span>
        </div>
      )}
      <div
        ref={chartContainerRef}
        className={`w-full ${loading?"hidden":""}`}
        style={{height:"380px"}}
      />
    </div>
  )
}

export default PriceHistoryGraph
