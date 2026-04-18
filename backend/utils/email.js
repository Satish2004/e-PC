import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: `"e-PC Panchayat" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Email Error: ${error}`);
    }
};
