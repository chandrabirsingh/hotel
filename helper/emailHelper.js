const nodemailer = require('nodemailer');
require('dotenv').config(); 
// Email sending helper function
const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "smtp",
            host: "smtp.hostinger.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
              user: "himanshu@gleamcipher.com",
              pass: "lU|^ro?/dS9",
            },
        });

        const mailOptions = {
            from: process.env.EMAIL, // Sender email
            to,                      // Receiver email(s)
            subject,                 // Email subject
            text,                    // Email body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (err) {
        console.error('Error sending email:', err);
        return false;
    }
};
// 54.185.68.164 dns a record chagneed by server ip
module.exports = sendEmail;
