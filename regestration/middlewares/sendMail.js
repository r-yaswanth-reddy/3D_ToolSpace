const nodemailer = require('nodemailer')
const { getMaxListeners } = require('nodemailer/lib/xoauth2')

require("dotenv").config();


const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODE_CODE_SENDING_MAIL_ADDRESS ,
        pass: process.env.NODE_CODE_SENDING_PASS 
    }
});


console.log("EMAIL:", process.env.NODE_CODE_SENDING_MAIL_ADDRESS);
console.log("PASS:", process.env.NODE_CODE_SENDING_PASS);

module.exports = { transport };