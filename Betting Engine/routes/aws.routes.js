import {createBucket,deleteBucket,putFile,deleteFile} from '../controllers/aws.controller.js'
import{tempbucket,tempbucketdelete,tempputfile,deletefiletemp} from '../controllers/aws.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import upload from '../services/multer.js'
const router=express.Router()

router.post('/newbucket',verifyToken,createBucket)
router.delete('/deletebucket',verifyToken,deleteBucket)
router.post('/uploadfile',verifyToken,putFile)
router.delete('/deletefile/:id',verifyToken,deleteFile)

router.post('/temp1',tempbucket)
router.delete('/temp2',tempbucketdelete)
router.post('/temp3',upload.single('file'),tempputfile)
router.delete('/temp4',deletefiletemp)



export default router