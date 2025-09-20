import { newStockTransaction,sellTransaction,getuserPortfolio,searchStock,getStockholders,getStockholder} from "../controllers/stock.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import express from 'express'
const router=express.Router()

router.post('/newtrans',verifyToken,newStockTransaction)
router.post('/selltrans',verifyToken,sellTransaction)
router.get('/portfolio',verifyToken,getuserPortfolio)
router.get('/search',searchStock)
router.get('/stockholders',verifyToken,getStockholders)
router.get('/stockholder',verifyToken,getStockholder)
export default router