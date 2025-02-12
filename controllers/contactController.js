const express = require("express");
const contactService = require("../services/contactService");

const emailController = {
  async sendEmail(req, res) {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const to = "kavindumihirangabandara@gmail.com";
      const subject = "New Contact Inquiry";
      await contactService.sendMail(to, subject, name, email, message);

      res.status(200).json({ message: `Email successfully sent to ${to}` });
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ error: "Failed to send email. Please try again later." });
    }
  },
};

module.exports = emailController;