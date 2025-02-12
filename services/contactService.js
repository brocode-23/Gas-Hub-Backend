const nodemailer = require("nodemailer");
const contactEmailTemplate = require("../emailtemplate");

const contactService = {
  async sendMail(to, subject, name, email, message) {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject,
      html: contactEmailTemplate(name, email, message),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  },
};

module.exports = contactService;