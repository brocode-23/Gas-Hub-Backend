const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const Token = require("../models/token");
const User = require("../models/User");
const Request = require("../models/Request");

// Email send karanna use karana function eka .
async function sendEmail(to, subject, message) {
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
    html: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
}

// Job eka schedule karanna.
schedule.scheduleJob("0 22 * * *", async () => {
  // Hamadama 10.00 p.m me job eka run venna .
  console.log("Running scheduled job at 10:00 PM");

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Active tokens ganna .
    const activeTokens = await Token.findAll({
      where: { status: "Active" },
    });

    for (const token of activeTokens) {
      const { token_code, expiration_date, user_id } = token;

      const expDate = new Date(expiration_date).setHours(0, 0, 0, 0);
      const tomorrowDate = tomorrow.setHours(0, 0, 0, 0);
      const yesterdayDate = yesterday.setHours(0, 0, 0, 0);

      // User id eka through request details ganna .
      const request = await Request.findOne({ where: { user_id: user_id } });
      if (!request) continue; // Request ekak hoyaganna nattam current iteration eka skip karanna.

      const { toemail } = request;

      // Token eke expire date eka hetada balanna .
      if (expDate === tomorrowDate) {
        await sendEmail(
          toemail,
          "Token Expiration Reminder",
          `<p>Your token ${token_code} will expire tomorrow. Please take necessary actions.</p>`
        );
      }

      // Token eke expire date eka iyeda balanna .
      if (expDate === yesterdayDate) {
        token.status = "Expired"; // Token eka expired karanna.
        await token.save();

        await sendEmail(
          toemail,
          "Token Expired Notification",
          `<p>Your token ${token_code} has expired as of yesterday. Please request a new token if needed.</p>`
        );
      }
    }

    console.log("Scheduled job completed successfully.");
  } catch (error) {
    console.error("Error in scheduled job:", error);
  }
});

schedule.scheduleJob("0 24 * * *", async () => {});
