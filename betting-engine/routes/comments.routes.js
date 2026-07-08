import {newComment,getComments,deleteComment}from '../controllers/comments.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import express from 'express'
const router=express.Router()

router.post('/newcomment',verifyToken,newComment)
router.get('/getcomments',getComments)
router.delete('/comment/:id',verifyToken,deleteComment)

export default router