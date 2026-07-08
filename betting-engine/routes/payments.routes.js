import express from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import { createWallet,newOrder,getPaymentStatus,successPayment,cancelPayment,callbackPayment,successReturn,cancelReturn } from '../controllers/payment.controller.js'
const router=express.Router()

router.post('/wallet',verifyToken,createWallet)
router.post('/order',verifyToken,newOrder)
router.get('/payment-status/:sessionId',verifyToken,getPaymentStatus)
router.post('/success',successPayment)
router.post('/cancel',cancelPayment)
router.post('/callback',callbackPayment)
router.post('/webhook',callbackPayment)
router.get('/return/success',successReturn)
router.get('/return/cancel',cancelReturn)

export default router