const Token = require("../models/token");
const User = require("../models/User");
const Request = require("../models/Request");
const sequelize = require("../config/database");
const Outlet = require("../models/Outlet");
const RequestTankDetails = require("../models/requesttankdetails");

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

const tokenService = {
  async generateTokenCode() {
    const lastToken = await Token.findOne({
      order: [["created_at", "DESC"]],
    });

    let tokenCode = "0001";

    if (lastToken) {
      const lastTokenNumber = parseInt(lastToken.token_code, 10);

      const newTokenNumber = lastTokenNumber + 1;

      tokenCode = newTokenNumber.toString().padStart(4, "0");
    }

    return tokenCode;
  },

  async updateToken(tokenId, updates) {
    const token = await Token.findByPk(tokenId);
    if (!token) {
      throw new Error("Token not found");
    }

    const { status, expected_pickup_date, expiration_date } = updates;

    if (expiration_date && expiration_date > token.expiration_date) {
      const request = await Request.findOne({ where: { token_id: token.id } });
      if (!request) {
        throw new Error("Request not found for the given token");
      }

      const toEmail = request.toemail;

      if (status) token.status = status;
      if (expected_pickup_date)
        token.expected_pickup_date = expected_pickup_date;
      if (expiration_date) token.expiration_date = expiration_date;

      await token.save();

      const subject = "Token Expiration Date Updated";
      const message = `<p>The expiration date for your token with ID ${token.token_code} has been updated to ${expiration_date}.</p>`;

      await sendEmail(toEmail, subject, message);

      return token;
    } else {
      if (status) token.status = status;
      if (expected_pickup_date)
        token.expected_pickup_date = expected_pickup_date;
      if (expiration_date) token.expiration_date = expiration_date;

      await token.save();

      return token;
    }
  },

  async updateTokenByCode(tokenCode, updates) {
    const token = await Token.findOne({ where: { token_code: tokenCode } });

    if (!token) {
      throw new Error("Token not found");
    }

    const { status, expiration_date } = updates;

    if (expiration_date && expiration_date > token.expiration_date) {
      const request = await Request.findOne({ where: { token_id: token.id } });
      if (!request) {
        throw new Error("Request not found for the given token");
      }

      const toEmail = request.toemail;

      console.log('equalll...');
      if (status) {
        if(status=='rejected'){
          console.log('equalll...');
          status = 'Cancelled'
        }else{
        token.status = status;
        }
      }
      if (expiration_date) {
        token.expiration_date = expiration_date;
        token.expected_pickup_date = new Date(
          new Date(expiration_date).getTime() - 7 * 24 * 60 * 60 * 1000
        );
      }

      await token.save();

      const subject = "Token Expiration Date Updated";
      const message = `<p>The expiration date for your token with ID ${token.token_code} has been updated to ${expiration_date}.</p>`;

      await sendEmail(toEmail, subject, message);

      return token;
    } else {
      if (status) {
        if(status=='rejected'){
          console.log('equalll...');
          token.status = 'Cancelled'
        }else{
          token.status = status;
        }
      }
      if (expiration_date) {
        token.expiration_date = expiration_date;
        token.expected_pickup_date = new Date(
          new Date(expiration_date).getTime() - 7 * 24 * 60 * 60 * 1000
        );
      }

      await token.save();

      return token;
    }
  },

  async getAllTokens() {
    try {
      const tokens = await sequelize.query(
        `SELECT 
        tokens.id, tokens.token_code, tokens.status, tokens.created_at, tokens.expected_pickup_date, tokens.expiration_date,
        users.id AS user_id, users.name, users.email, users.role, users.customer_type,
        requests.id AS request_id, requests.toemail, requests.status AS request_status, requests.outlet_id, requests.requested_at
      FROM tokens
      LEFT JOIN users ON tokens.user_id = users.id
      LEFT JOIN requests ON tokens.id = requests.token_id`,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return tokens;
    } catch (error) {
      throw new Error(`Failed to retrieve tokens: ${error.message}`);
    }
  },

  async getTokensByFilter(outletId, status = null, date = null) {
    try {
      let query = `
      SELECT 
        tokens.id, 
        tokens.token_code, 
        tokens.status, 
        tokens.created_at, 
        tokens.expected_pickup_date, 
        tokens.expiration_date,
        users.id AS user_id, 
        users.name, 
        users.email, 
        users.role, 
        users.customer_type,
        requests.id AS request_id, 
        requests.toemail, 
        requests.status AS request_status, 
        requests.outlet_id, 
        requests.requested_at
      FROM tokens
      LEFT JOIN users ON tokens.user_id = users.id
      LEFT JOIN requests ON tokens.id = requests.token_id
      WHERE 1=1
    `;

      if (status) {
        query += ` AND tokens.status = :status`;
      }

      if (date) {
        query += ` AND tokens.expiration_date = :date`;
      }

      if (outletId) {
        query += ` AND requests.outlet_id = :outletId`;
      }

      const tokens = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { outletId, status, date },
      });

      return tokens;
    } catch (error) {
      throw new Error(`Failed to retrieve tokens: ${error.message}`);
    }
  },

  async getTokensByUserId(userId) {
    console.log(userId);
    try {
      const query = `
      SELECT 
        tokens.id, 
        tokens.token_code, 
        tokens.status, 
        tokens.created_at, 
        tokens.expected_pickup_date, 
        tokens.expiration_date,
        users.id AS user_id, 
        users.name, 
        users.email, 
        users.role, 
        users.customer_type,
        requests.id AS request_id, 
        requests.toemail, 
        requests.status AS request_status, 
        requests.outlet_id, 
        requests.requested_at
      FROM tokens
      LEFT JOIN users ON tokens.user_id = users.id
      LEFT JOIN requests ON tokens.id = requests.token_id
      WHERE tokens.user_id = :userId
    `;

      const tokens = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { userId },
      });

      return tokens;
    } catch (error) {
      throw new Error(
        `Failed to retrieve tokens for user ID ${userId}: ${error.message}`
      );
    }
  },

  async getTokensByEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error(`User with email ${email} not found.`);
      }

      const outlets = await Outlet.findAll({
        where: { manager_id: user.id },
        attributes: ["id"],
      });

      if (outlets.length === 0) {
        throw new Error(`No outlets managed by user with email ${email}.`);
      }

      const outletIds = outlets.map((outlet) => outlet.id);

      const tokens = await sequelize.query(
        `
        SELECT 
          tokens.id, 
          tokens.token_code, 
          tokens.status, 
          tokens.created_at, 
          tokens.expected_pickup_date, 
          tokens.expiration_date,
          users.id AS user_id, 
          users.name, 
          users.email, 
          users.role, 
          users.customer_type,
          requests.id AS request_id, 
          requests.toemail, 
          requests.status AS request_status, 
          requests.outlet_id, 
          requests.requested_at
        FROM tokens
        LEFT JOIN users ON tokens.user_id = users.id
        LEFT JOIN requests ON tokens.id = requests.token_id
        WHERE requests.outlet_id IN (:outletIds)
      `,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { outletIds },
        }
      );

      return tokens;
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to retrieve tokens: ${error.message}`);
    }
  },

  async calculateTotalPriceByTokenCode(tokenCode) {
    try {
      const token = await Token.findOne({ where: { token_code: tokenCode } });
      if (!token) throw new Error("Token not found.");

      const user = await User.findByPk(token.user_id);
      if (!user) throw new Error("User not found");

      const requests = await Request.findAll({ where: { token_id: token.id } });
      if (!requests.length) throw new Error("No requests found for the token.");

      const tankPrices = {
        "12.5kg": 2500,
        "5kg": 1000,
        "2.3kg": 500,
      };

      let totalPrice = 0;

      for (const request of requests) {
        const tankDetails = await RequestTankDetails.findAll({
          where: { request_id: request.id },
        });

        for (const tankDetail of tankDetails) {
          const { tank_type, quantity } = tankDetail;

          if (tankPrices[tank_type]) {
            totalPrice += tankPrices[tank_type] * quantity;
          } else {
            console.warn(
              `Tank type ${tank_type} has no price defined. Skipping.`
            );
          }
        }
      }

      const result = {
        status: token.status,
        expirationDate: token.expiration_date,
        expectedPickupDate: token.expected_pickup_date,
        name: user.name,
        phone: user.phone,
        email: user.email,
        totalPrice,
      };

      return result;
    } catch (error) {
      console.error("Error calculating total price:", error.message);
      throw error;
    }
  },
};

module.exports = tokenService;
