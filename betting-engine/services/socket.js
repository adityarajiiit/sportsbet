import { io } from "../index.js"
import { newReminder,snoozeReminder,dismissedReminder } from "../controllers/reminder.controller.js"
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
})