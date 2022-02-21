const nodemailer = require('nodemailer');

function sendMail(email, code){
    const transporter = nodemailer.createTransport({
        port: 465,               // true for 465, false for other ports
        host: "smtp.gmail.com",
        auth: {
            user: 'mahmoudhamad838@gmail.com',
            pass: 'asAS12!@',
        },
        secure: true,
    });
    const mailData = {
        from: 'mahmoudhamad838@gmail.com',  // sender address
        to: email,   // list of receivers
        subject: 'Account Verify',
        text: 'The Verification Code is: ' + code,
    };
    transporter.sendMail(mailData, (err, info) => {
        if(err)
          console.log(err)
        else
          console.log(info);
    });
}

module.exports.sendMail = sendMail;