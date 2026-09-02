'use client'
import { Sparkles } from "lucide-react"
import { useStockPrediction } from "@/app/lib/aiclient"
export default function StockPredict({stockId}){
   const {data,loading,generate}=useStockPrediction()
   return(
    <div className="mt-4 border border-base-content/20 rounded-xl bg-base-200 p-4">
        <div className="flex items-center justify-between mb-3">
            <p className="font-poppins font-semibold text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-warning"/>
                AI Price Prediction
            </p>
            <button className="btn btn-sm btn-warning rounded-full font-poppins"
            onClick={()=>generate(stockId)}
            disabled={loading||!stockId}
            >
            {loading?<span className="loading loading-spinner loading-xs"/>:"Predict"}
            </button>
        </div>
        {data&&!loading&&(
            <div className="space-y-2 text-sm font-inter">
                {data.prediction&&(
                    <div className="p-3 bg-base-300 rounded-lg">
                        <p className="text-xs text-base-content/50 font-poppins mb-1">
                        Prediction
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold uppercase">{data.prediction.direction}</p>
                            {data.prediction.confidence!==undefined&&(
                                <p className="ml-auto text-xs text-base-content/40 font-poppins">
                                    {(data.prediction.confidence*100).toFixed(0)}% confidence
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1 text-xs text-base-content/60">
                            {data.prediction.currentPrice&&(
                                <p>Current: <span className="font-semibold text-base-content">₹{data.prediction.currentPrice?.toFixed(2)}</span></p>
                            )}
                            {data.prediction.targetPrice&&(
                                <p>Target: <span className="font-semibold text-base-content">₹{data.prediction.targetPrice?.toFixed(2)}</span></p>
                            )}
                            {data.prediction.percentChange!==undefined&&(
                                <p>Change: <span className="font-semibold">{data.prediction.percentChange>=0?'+':''}{data.prediction.percentChange?.toFixed(2)}%</span></p>
                            )}
                            {data.prediction.timeframe&&(
                                <p>Timeframe: <span className="font-semibold capitalize">{data.prediction.timeframe.replace('_',' ')}</span></p>
                            )}
                        </div>
                    </div>
                )}
                {data.technicalAnalysis&&(
                    <div className="p-3 bg-base-300 rounded-lg">
                        <p className="text-xs text-base-content/50 font-poppins mb-1">
                        Technical Analysis
                        </p>
                        <p className="font-semibold capitalize">{data.technicalAnalysis.signal}</p>
                        {data.technicalAnalysis.summary&&(
                            <p className="text-xs text-base-content/60 mt-0.5">{data.technicalAnalysis.summary}</p>
                        )}
                    </div>
                )}
                {data.recommendation&&(
                    <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-xs text-warning font-poppins mb-1">
                        Recommendation
                        </p>
                        <p className="font-bold uppercase">{data.recommendation.action}</p>
                        {data.recommendation.reasoning&&(
                            <p className="text-xs text-base-content/60 mt-0.5">{data.recommendation.reasoning}</p>
                        )}
                    </div>
                )}
                {data.catalysts?.length>0&&(
                    <div className="p-3 bg-base-300 rounded-lg">
                        <p className="text-xs text-base-content/50 font-poppins mb-1">
                        Catalysts
                        </p>
                        <ul className="list-disc list-inside space-y-0.5">
                            {data.catalysts.map((c,i)=>(
                                <li key={i} className="text-xs">{c}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}
        {!data&&!loading&&(
            <p className="text-xs text-base-content/40 font-inter">
                Click Predict to get AI price analysis for this stock
            </p>
        )}
    </div>
   )
}
