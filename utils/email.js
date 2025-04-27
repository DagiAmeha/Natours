const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '6c9c410ee36247',
    pass: '98b02714096d14',
  },
});

module.exports = transporter;
