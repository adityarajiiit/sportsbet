import { newAlert,deleteAlert } from "../controllers/alert.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import express from 'express'
const router=express.Router()

router.post('/newalert',verifyToken,newAlert)
router.delete('/alert/:id',verifyToken,deleteAlert)
export default router