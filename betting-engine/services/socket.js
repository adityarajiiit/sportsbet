import { PrismaClient } from "@prisma/client"
import { delayJob, removeJob } from "../utils/bullmq.js"
const prisma=new PrismaClient()
export const socketfunction=async (io)=>{
io.on('connection',(socket)=>{
    console.log('a user connected',socket.id)
    socket.on('join-room',(room)=>{
        socket.join(room)
    })
    socket.on('leave-room',(room)=>{
        socket.leave(room)
    })
    socket.on('reminder-snooze',async({reminderId,userId,snoozetime})=>{
        await removeJob(reminderId)
        const newTime=new Date(Date.now()+snoozetime)
        const reminder=await prisma.reminder.update({
            where:{id:reminderId},
            data:{time:newTime}
        })
        await delayJob(reminder.id,userId,snoozetime)
        socket.emit('reminder-snoozed',{
            reminderId,
            snoozetime
        })
    })
    socket.on('reminder-dismiss',async({reminderId,userId})=>{
        await removeJob(reminderId)
        await prisma.reminder.update({
            where:{id:reminderId},
            data:{status:"dismissed"}
        })
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
        if(!user) return;
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
        const room=data.matchId||data.playerId||data.teamId
        if(room){
            io.to(room).emit('comment-added',data1)
        }else{
            io.emit('comment-added',data1)
        }
        }
    })
})
}
