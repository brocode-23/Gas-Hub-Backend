const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sequelize = require("../config/database");
const Request = require("../models/Request");
const RequestTankDetails = require("../models/requesttankdetails");
const User = require("../models/User");
const Outlet = require("../models/Outlet");
const Token = require("../models/token");
const generateEmailTemplate = require("../emailtemplate");

const tokenService = require("./tokenService");

const requestService = {
  async addRequest(data) {
    const transaction = await sequelize.transaction();

    try {
      const { user_mail, to_mail, outlet_id, tank_details } = data;

      const user = await User.findOne({ where: { email: user_mail } }); // Username eka throught user_id eka hoya ganna.
      if (!user) throw new Error("User not found");

      const user_id = user.id;

      const requestingUser = await User.findOne({ where: { id: user_id } });
      if (!requestingUser) throw new Error("User not found");

      const { customer_type, email } = requestingUser; // Userge customer type eka ganna.
      const maxTanks = customer_type === "Basic" ? 2 : 10; // USerge customer type = 'Basic' => 2 tanks, 'Premium' => 10 tanks

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const existingRequests = await Request.findAll({
        // Request eka evapu userge all request details ganna .
        where: { user_id },
        include: [{ model: RequestTankDetails }],
      });

      // User me masaya thula tanks kiyak request karala thiyanavada balanna .
      const totalOrderedThisMonth = existingRequests.reduce((sum, req) => {
        const reqDate = new Date(req.requested_at);
        if (
          reqDate.getMonth() + 1 === currentMonth &&
          reqDate.getFullYear() === currentYear
        ) {
          return (
            sum +
            req.RequestTankDetails.reduce(
              (total, detail) => total + detail.quantity,
              0
            )
          );
        }
        return sum;
      }, 0);

      // Current request eken tanks kiyak order karala thiyanavada balanna .
      const requestedQuantity = tank_details.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const remainingQuota = maxTanks - totalOrderedThisMonth; // Userta me masyata thava tanks kiyak request karanna puluwanda balanna .

      // User request karapu tanks gana remainingQuota ekata vada vadinam error ekak throw karanna .
      if (requestedQuantity > remainingQuota) {
        throw new Error(
          `You can only order ${remainingQuota} more gas tanks this month`
        );
      }

      const requestType = customer_type === "Basic" ? "Individual" : "Business"; // Customer type eka 'Basic' => 'Individual', 'Premium' => 'Business'

      const tokenCode = await tokenService.generateTokenCode(); // Token code eka genarate karanna .
      const pickupDate = new Date();
      pickupDate.setDate(pickupDate.getDate() + 7);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 14);

      const token = await Token.create(
        {
          user_id,
          token_code: tokenCode,
          status: "Pending",
          created_at: new Date(),
          expected_pickup_date: pickupDate,
          expiration_date: expirationDate,
        },
        { transaction }
      );

      const newRequest = await Request.create(
        {
          user_id,
          toemail: to_mail,
          outlet_id,
          type: requestType,
          status: "Pending",
          token_id: token.id,
        },
        { transaction }
      );

      for (const tank of tank_details) {
        await RequestTankDetails.create(
          {
            request_id: newRequest.id,
            tank_type: tank.tank_type,
            quantity: tank.quantity,
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Email eka genarate karanna .
      try {
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: to_mail,
          subject: "Your Gas Tank Request Token",
          html: generateEmailTemplate(
            tokenCode,
            expirationDate.toLocaleDateString()
          ),
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }

      return newRequest;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async deleteRequest(requestId, user) {
    const transaction = await sequelize.transaction();
    try {
      const request = await Request.findByPk(requestId, {
        include: [RequestTankDetails],
      });

      if (!request) throw new Error("Request not found");

      if (user.role === "Customer" && request.status !== "Pending") {
        throw new Error("You cannot cancel an approved order");
      }

      await RequestTankDetails.destroy({
        where: { request_id: requestId },
        transaction,
      });
      await request.destroy({ transaction });

      await transaction.commit();
      return { message: "Request deleted successfully" };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async updateRequestStatus(requestId, status, user) {
    const transaction = await sequelize.transaction();
    console.log('-------------------------------------------------------------');
    console.log(status);
    try {
      const request = await Request.findByPk(requestId);

      if (!request) throw new Error("Request not found");

      request.status = status;
      await request.save({ transaction });

      await transaction.commit();
      return request;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async getAllRequests(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const userId = user.id;

    const outlets = await Outlet.findAll({ where: { manager_id: userId } });
    if (outlets.length === 0) {
      throw new Error("No outlets found for this user");
    }

    const outletIds = outlets.map((outlet) => outlet.id);

    return await Request.findAll({
      where: { outlet_id: outletIds },
      include: [
        { model: RequestTankDetails },
        { model: User, attributes: ["name", "email", "customer_type"] },
      ],
    });
  },

  async updateRequest(req) {
    const { id, status, token_id, toemail } = req.body;
    const transaction = await sequelize.transaction();
    try {
      const request = await Request.findByPk(id, { transaction });
      if (!request) throw new Error("Request not found");

      request.status = status;
      await request.save({ transaction });

      const token = await Token.findByPk(token_id, { transaction });
      if (!token) throw new Error("Token not found");

      if (status === "Approved") {
        token.status = "Active";
        token.expiration_date = new Date(
          new Date().setDate(new Date().getDate() + 14)
        );
        token.expected_pickup_date = new Date(
          new Date().setDate(new Date().getDate() + 7)
        );
      } else if (status === "Rejected") {
        token.status = "Cancelled";
      }

      await token.save({ transaction });

      await transaction.commit();

      const emailContent = `
        <p>Dear Customer,</p>
        <p>Your request has been <strong>${status}</strong> by the manager.</p>
        ${
          status === "Approved"
            ? `<p>Token Code: ${token.token_code}</p>
               <p>Expiration Date: ${token.expiration_date.toDateString()}</p>
               <p>Expected Pickup Date: ${token.expected_pickup_date.toDateString()}</p>`
            : ""
        }
      `;

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: toemail,
        subject: `Request ${status}`,
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);

      return { message: "Request and token updated successfully" };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

module.exports = requestService;
