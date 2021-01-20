const dotenv = require('dotenv');
dotenv.config(); //LOAD CONFIG
const sgMail = require('@sendgrid/mail');

module.exports = (message) => {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: message.to,
        from: '노드쇼핑몰관리자<pjoon86@naver.com>',
        subject: message.subject,
        html: message.mail_body,
    };

    return sgMail.send(msg);

}