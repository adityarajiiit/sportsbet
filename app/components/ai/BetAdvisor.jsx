'use client'
import { Sparkles } from "lucide-react"
import { useBetAdvisor } from "@/app/lib/aiclient"
export default function BetAdvisor({matchId}){
   const {data,loading,generate}=useBetAdvisor()
   return(
    <div className="mt-4 border border-base-content/20 rounded-xl bg-base-200 p-4">
        <div className="flex items-center justify-between mb-3">
            <p className="font-poppins font-semibold text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-warning"/>
                AI Bet Advisor
            </p>
            <button className="btn btn-sm btn-warning rounded-full font-poppins"
            onClick={()=>generate(matchId)}
            disabled={loading||!matchId}
            >
            {loading?<span className="loading loading-spinner loading-xs"/>:"Get Advice"}
            {data&&!loading&&(
                <div className="space-y-2 text-sm font-inter">
                    {data.recommendation&&(
                        <div className="p-3 bg-base-300 rounded-lg flex items-center gap-2">
                            <p className="text-xs text-base-content/50 font-poppins">
                            Verdict
                            </p>
                            <p className="font-bold uppercase">
                                {data.recommendation}
                            </p>
                            {data.confidence!==undefined&&(
                                <p className="ml-auto text-xs text-base-content/40 font-poppins">
                                    {(data.confidence*100).toFixed(0)}% confidence
                                </p>
                            )}
                        </div>
                    )}
                    {data.summary&&(
                        <div className="p-3 bg-base-300 rounded-lg">
                            <p className="text-xs text-base-content/50 font-poppins mb-1">
                            Summary
                            </p>
                            <p>{data.summary}</p>
                        </div>
                    )}
                    {data.evAnalysis&&(
                        <div className="p-3 bg-base-300 rounded-lg">
                            <p className="text-xs text-base-content/50 font-poppins mb-1">
                            EV Analysis
                            </p>
                            <p className="font-semibold">{data.evAnalysis.bestBet}</p>
                            <p className="text-xs text-base-content/60 mt-0.5">{data.evAnalysis.explanation}</p>
                        </div>
                    )}
                    {data.kellySuggestion&&(
                        <div className="p-3 bg-base-300 rounded-lg">
                            <p className="text-xs text-base-content/50 font-poppins mb-1">
                            Recommended Stake
                            </p>
                            <p className="font-semibold">
                                ₹{data.kellySuggestion.recommendedStake?.toFixed(2)}
                                <span className="text-xs font-normal text-base-content/50 ml-1">
                                    ({(data.kellySuggestion.fractionOfBankroll*100)?.toFixed(1)}% of bankroll)
                                </span>
                            </p>
                        </div>
                    )}
                    {data.riskAssessment&&(
                        <div className="p-3 bg-base-300 rounded-lg">
                            <p className="text-xs text-base-content/50 font-poppins mb-1">
                            Risk Level
                            </p>
                            <p className="font-semibold capitalize">{data.riskAssessment.level}</p>
                        </div>
                    )}
                    {data.oddsMovement&&(
                        <p className="text-xs text-base-content/50 font-inter">
                            Odds: <span className="capitalize font-medium">{data.oddsMovement.trend}</span> — {data.oddsMovement.insight}
                        </p>
                    )}
                </div>
            )}
            {!data&&!loading&&(
                <p className="text-xs text-base-content/40 font-inter">
                    Click Get Advice for AI-powered betting analysis
                </p>
            )}
            </button>
        </div>
    </div>
   )
}