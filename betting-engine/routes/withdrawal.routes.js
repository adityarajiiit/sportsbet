import{verifyToken}from '../middlewares/verifyToken.js'
import express from 'express'
const router=express.Router()
import{withdrawFunds}from '../controllers/withdrawal.controller.js'

router.post('/withdraw',verifyToken,withdrawFunds)

export default router
