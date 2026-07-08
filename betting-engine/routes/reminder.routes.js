import {newReminder,snoozeReminder,dismissedReminder,getuserReminders} from '../controllers/reminder.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import express from 'express'
const router=express.Router()
router.post('/newreminder',verifyToken,newReminder)
router.patch('/snoozeReminder',verifyToken,snoozeReminder)
router.patch('/dismissreminder/:id',verifyToken,dismissedReminder)
router.get('/reminders',verifyToken,getuserReminders)
export default router