import express from 'express'
import {
    getMatchInsight,getBetAdvice,
    getStockPrediction,
    getAlerts,triggerAlert,chatStream
} from "../controllers/ai.controller.js"

const router=express.Router()
import { verifyToken } from '../middlewares/verifyToken.js'

router.post('/insight/:matchId',verifyToken,getMatchInsight)
router.get('/betadvisor/:matchId',verifyToken,getBetAdvice)
router.post('/stockpredict/:stockId',verifyToken,getStockPrediction)
router.get('/alerts',verifyToken,getAlerts)
router.post('/alerts/trigger',verifyToken,triggerAlert)
router.post('/chat',verifyToken,chatStream)


export default router