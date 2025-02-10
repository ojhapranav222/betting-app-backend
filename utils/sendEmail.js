import nodeMailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config()

export default async function sendEmail(options){

    const transporter = nodeMailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    try{
        await transporter.sendMail(mailOptions);
    } catch(err){
        console.log(err);
    }
}