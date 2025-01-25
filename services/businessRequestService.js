const User = require("../models/User");
const BusinessRequest = require("../models/buisnessRequest");
const sequelize = require("../config/database");
const nodemailer = require("nodemailer");

const fs = require("fs");

const businessService = {
  async addBusinessRequest(data) {
    try {
      const { business_name, email, business_certificate_image } = data;

      const existingUser = await User.findOne({ where: { email } });
      if (!existingUser) {
        throw new Error("Email not registered. Please sign up first.");
      }

      // The business_certificate_image is already a base64 string from the frontend
      if (
        !business_certificate_image ||
        typeof business_certificate_image !== "string"
      ) {
        throw new Error(
          "Invalid image format. Please provide a valid base64 image string."
        );
      }

      const businessRequest = await BusinessRequest.create({
        business_name,
        email,
        business_certificate_image,
      });

      return businessRequest;
    } catch (error) {
      throw new Error("Error while adding business request: " + error.message);
    }
  },

  async getAllBusinessRequests() {
    try {
      const businessRequests = await BusinessRequest.findAll({
        where: { status: "Pending" },
      });

      const decodedRequests = businessRequests.map((request) => {
        const decodedImage = Buffer.from(
          request.business_certificate_image,
          "base64"
        ).toString("binary");
        return {
          id: request.id,
          business_name: request.business_name,
          email: request.email,
          status: request.status,
          created_at: request.created_at,
          updated_at: request.updated_at,
          business_certificate_image: decodedImage,
        };
      });

      return decodedRequests;
    } catch (error) {
      throw new Error(
        "Error while fetching business requests: " + error.message
      );
    }
  },

  async updatedBusinessRequest(data) {
    console.log(data);
    const transaction = await sequelize.transaction();
    try {
      const { email, status } = data;

      const Request = await BusinessRequest.findOne({
        where: { email: email },
      });
      if (!Request) throw new Error("Request not fount");

      if (status === "approved") {
        Request.status = "Approved";
      } else {
        Request.status = "Rejected";
      }

      await Request.save({ transaction });

      const user = await User.findOne({ where: { email: email } });
      if (!user) throw new Error("User not found");

      if (status === "approved") {
        user.customer_type = "Premium";
      }

      await user.save({ transaction });

      await transaction.commit();
      sendEmail(
        email,
        `Business account request ${status} .`,
        `Dear valued customer your business account request ${status} By Admin . For more information contact us: +94 70 570 8244`
      );
      return Request;
    } catch (error) {
      transaction.rollback();
      console.log(error);
      throw new Error("Error while request update : " + error.message);
    }
  },
};

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

module.exports = businessService;
