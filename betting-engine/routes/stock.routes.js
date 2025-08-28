import { newStockTransaction,sellTransaction,getuserPortfolio,searchStock,getStockholders } from "../controllers/stock.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import express from 'express'
const router=express.Router()

router.post('/newtrans',verifyToken,newStockTransaction)
router.post('/selltrans',verifyToken,sellTransaction)
router.get('/portfolio',verifyToken,getuserPortfolio)
router.get('/search',verifyToken,searchStock)
router.get('/stockholders',verifyToken,getStockholders)
export default router