import {create} from "zustand"

export const useAiContext=create((set)=>({
  pageType:"home",
  matchId:null,
  matchData:null,
  oddsData:null,
  liveScore:null,
  stockId:null,
  stockData:null,
  priceHistory:null,
  setMatchContext:(matchId,matchData,oddsData,liveScore)=>set({
    pageType:"match",
    matchId,
    matchData,
    oddsData,
    liveScore,
  }),
  setStockContext:(stockId,stockData,priceHistory)=>set({
    pageType:"stock",
    stockId,
    stockData,
    priceHistory,
  }),
  clearContext:()=>set({
    pageType:"home",
    matchId:null,
    matchData:null,
    oddsData:null,
    liveScore:null,
    stockId:null,
    stockData:null,
    priceHistory:null,
  }),
}))
