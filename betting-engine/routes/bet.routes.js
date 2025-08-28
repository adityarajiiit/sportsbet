import { newBet,getBets,getUserBets,getUserBetsbyMatch,modifyBet,sellBet,betOutcome } from "../controllers/bet.controller.js";
import express from 'express'
const router=express.Router()
import { verifyToken } from "../middlewares/verifyToken.js";

router.post('/newbet',verifyToken,newBet)
router.get('/bets/:id',verifyToken,getBets)
router.get('/userbets',verifyToken,getUserBets)
router.get('/userbetsbymatch/:id',verifyToken,getUserBetsbyMatch)
router.patch('/modifybet/:id',verifyToken,modifyBet)
router.patch('/sellbet/:id',verifyToken,sellBet)
router.patch('/betoutcome/:id',verifyToken,betOutcome)

export default router