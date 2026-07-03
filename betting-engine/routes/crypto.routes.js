import { verifyToken } from '../middlewares/verifyToken.js'
import express from 'express'
const router=express.Router()
import{createWallet,mockDeposit} from '../controllers/crypto.controller.js'

router.post('/wallet',verifyToken,createWallet)
router.post('/mockdeposit',verifyToken,mockDeposit)

export default router