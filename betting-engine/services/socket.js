
import { newReminder,snoozeReminder,dismissedReminder } from "../controllers/reminder.controller.js"
import { newComment,getComments } from "../controllers/comments.controller.js"
import { PrismaClient } from "@prisma/client"
const prisma=new PrismaClient()
export const socketfunction=async (io)=>{
io.on('connection',(socket)=>{
    console.log('a user connected',socket.id)
    socket.on('reminder-snooze',async({reminderId,userId,snoozetime})=>{
        await snoozeReminder(reminderId,userId,snoozetime)
        socket.emit('reminder-snoozed',{
            reminderId,
            snoozetime
        })
    })
    socket.on('reminder-dismiss',async({reminderId,userId})=>{
        await dismissedReminder(reminderId,userId)
        socket.emit('reminder-dismissed',{
            reminderId
        })
    })
    socket.on('new-comment',async({data})=>{
        console.log(data)

        const user=await prisma.user.findUnique({
            where:{
                email:data.email
            }
        })
        const username=user.name
        const userId=user.id
        if(userId){
        const newcomment=await prisma.comment.create({
            data:{
        pagetype:data.pagetype,
        userId:userId,
        matchId:data.matchId||null,
        playerId:data.playerId||null,
        teamId:data.teamId||null,
        parentcommentId:data.parentcommentId||null,
        message:data.message,
        replyto:data.replyto||null
            }
        })
        console.log('message recevide',newcomment)
        const data1={
            ...newcomment,
            name:username
        }
        socket.emit('comment-added',data1)
        }
    })
})
}
