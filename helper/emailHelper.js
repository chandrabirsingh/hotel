const nodemailer = require('nodemailer');
require('dotenv').config(); 
// Email sending helper function
const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'demotesmail@gmail.com',      // Sender email (demotesmail@gmail.com)
                pass: 'iwgx ovfy lzkm ukbm', // Email password or App Password
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

module.exports = sendEmail;
