import {newTeam,newPlayer,newMatch,deleteMatch
    ,deletePlayer,deleteTeam,newMatchBet,newStock
} from "../controllers/admin.controller.js"
import { verifyToken } from "../middlewares/verifyToken.js"
import express from "express"
const router=express.Router()

router.post("/newteam",verifyToken,newTeam)
router.post("/newplayer",verifyToken,newPlayer)
router.post("/newmatch",verifyToken,newMatch)
router.delete("/deletematch/:id",verifyToken,deleteMatch)
router.delete("/deleteplayer/:id",verifyToken,deletePlayer)
router.delete("/deleteteam/:id",verifyToken,deleteTeam)
router.post("/newmatchbet",verifyToken,newMatchBet)
router.post("/newstock",verifyToken,newStock)

export default router