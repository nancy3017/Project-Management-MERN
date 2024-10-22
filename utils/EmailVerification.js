const nodemailer = require('nodemailer');
module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io', 
            port: 2525, 
            auth: {
                user: process.env.Email_Admin, 
                pass: process.env.Password_Admin 
            }
        });

        await transporter.sendMail({
            from: process.env.Email_Admin,
            to: email, 
            subject: subject, 
            html: text
        });
        console.log("Email sent successfully");
        return true
    } catch (error) {
        console.log("Email not sent", error);
    }
};


