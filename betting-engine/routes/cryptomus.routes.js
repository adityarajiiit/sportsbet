import{createWallet,newOrder,successPayment} from '../controllers/cryptomus.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import express from 'express'
const router=express.Router()

router.post('/newwallet',verifyToken,createWallet)
router.post('/neworder',verifyToken,newOrder)
router.post('/success',successPayment)
export default router