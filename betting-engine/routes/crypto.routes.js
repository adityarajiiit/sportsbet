import { verifyToken } from '../middlewares/verifyToken.js'
import express from 'express'
const router=express.Router()
import{createWallet,newOrder,successPayment} from '../controllers/crypto.controller.js'
router.post('/wallet',verifyToken,createWallet)
router.post('/order',newOrder)
router.post('/success',successPayment)
export default router