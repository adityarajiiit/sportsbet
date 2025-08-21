"use server"
import nodemailer from 'nodemailer';
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.GAUTH_EMAIL,
        pass:process.env.GAUTH_PASSWORD
    },
})
export default async function sendEmail(to,link){
    try{
        const mail={
            from:process.env.GAUTH_EMAIL,
            to,
            subject:'Verify Your Email',
            html:`<p>Click the link below to verify your email:</p><a href="${link}">Verify Email</a>`
        }
        await transporter.sendMail(mail);
        return true;
    }
    catch(error){
        console.error('Error sending email:',error);
        return false;
    }
}