const Payment = require("../models/payment");
const Token = require("../models/token");
const Request = require("../models/Request");
const Outlet = require("../models/Outlet");
const RequestTankDetails = require("../models/requesttankdetails");
const OutletStock = require("../models/OutletStock");
const sequelize = require("../config/database");

const paymentService = {
  /*async save(data) {
    const { token_code, amount, payment_method, status } = data;

    const token = await Token.findOne({ where: { token_code: token_code } });
    if (!token) throw new Error("Token not found");

    if (token.status === "Paid") throw new Error("Token already paid");

    const request = await Request.findOne({ where: { token_id: token.id } });
    if (request.status !== "Approved") throw new Error("Request not approved");

    const token_id = token.id;
    const user_id = token.user_id;

    const transaction = await sequelize.transaction();

    try {
      const payment = await Payment.create(
        {
          user_id,
          token_id,
          amount,
          payment_method,
          status,
        },
        { transaction }
      );

      token.status = "Paid";
      await token.save({ transaction });

      await transaction.commit();
      return payment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      if (transaction) {
        await transaction.afterCommit(() => {
          console.log("Transaction closed.");
        });
      }
    }
  },*/

  async save(data) {
    const { token_code, amount, payment_method, status } = data;

    const token = await Token.findOne({ where: { token_code: token_code } });
    if (!token) throw new Error("Token not found");

    if (token.status === "Paid") throw new Error("Token already paid");

    const request = await Request.findOne({ where: { token_id: token.id } });
    if (request.status !== "Approved") throw new Error("Request not approved");

    const token_id = token.id;
    const user_id = token.user_id;

    const transaction = await sequelize.transaction();

    try {
      const payment = await Payment.create(
        {
          user_id,
          token_id,
          amount,
          payment_method,
          status,
        },
        { transaction }
      );

      token.status = "Paid";
      await token.save({ transaction });

      const requestTankDetails = await RequestTankDetails.findAll({
        where: { request_id: request.id },
        transaction,
      });

      const outlet = await Outlet.findByPk(request.outlet_id, { transaction });
      if (!outlet) throw new Error("Outlet not found");

      for (const tank of requestTankDetails) {
        const { tank_type, quantity } = tank;

        outlet.stock_level -= quantity;

        if (outlet.stock_level < 0) {
          throw new Error(`Insufficient stock for ${tank_type}`);
        }

        await outlet.save({ transaction });

        const outletStock = await OutletStock.findOne({
          where: { outlet_id: outlet.id, tank_type },
          transaction,
        });

        if (!outletStock)
          throw new Error(`Outlet stock not found for ${tank_type}`);

        outletStock.quantity -= quantity;

        if (outletStock.quantity < 0) {
          throw new Error(`Insufficient outlet stock for ${tank_type}`);
        }

        await outletStock.save({ transaction });
      }

      await transaction.commit();
      return payment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      if (transaction) {
        await transaction.afterCommit(() => {
          console.log("Transaction closed.");
        });
      }
    }
  },

  async update(token_code, data) {
    const token = await Token.findOne({ where: { token_code } });
    if (!token) throw new Error("Token not found");

    const payment = await Payment.findOne({ where: { token_id: token.id } });
    if (!payment) throw new Error("Payment not found");

    const { price, paid_at, payment_method } = data;

    if (price) {
      payment.amount = price;
    }

    if (payment_method) {
      payment.payment_method = payment_method;
    }

    if (paid_at) {
      payment.paid_at = paid_at;
    }

    await payment.save();
    return payment;
  },

  async getAll(filters) {
    const { id, month, year } = filters;

    const where = {};
    if (id) where.id = id;
    if (month || year) {
      const startDate = new Date(
        year || new Date().getFullYear(),
        month ? month - 1 : 0,
        1
      );
      const endDate = new Date(
        year || new Date().getFullYear(),
        month || 12,
        0
      );
      where.paid_at = {
        [require("sequelize").Op.between]: [startDate, endDate],
      };
    }

    const payments = await Payment.findAll({ where });
    return payments;
  },

  async delete(id) {
    const payment = await Payment.findByPk(id);
    if (!payment) throw new Error("Payment not found");
    await payment.destroy();
  },

  async delete(id) {
    const transaction = await sequelize.transaction();

    try {
      const payment = await Payment.findByPk(id, { transaction });
      if (!payment) throw new Error("Payment not found");

      const { token_id } = payment;

      const token = await Token.findByPk(token_id, { transaction });
      if (!token) throw new Error("Associated token not found");

      await payment.destroy({ transaction });

      token.status = "Active";
      await token.save({ transaction });

      await transaction.commit();
      return payment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async getAllPaymentsByOutlet(userID) {
    // Find all outlets managed by the user
    const outlets = await Outlet.findAll({ where: { manager_id: userID } });
    if (!outlets || outlets.length === 0) {
      throw new Error("This user is not managing any outlets.");
    }

    // Extract outlet IDs
    const outletIds = outlets.map((outlet) => outlet.id);

    try {
      const results = await sequelize.query(
        `
      SELECT 
        p.*, 
        u.name AS user_name, 
        u.email AS user_email,
        t.token_code AS token_code, 
        r.type AS request_type, 
        r.status AS request_status,
        o.name AS outlet_name, 
        o.location AS outlet_location
      FROM payments p
      JOIN tokens t ON p.token_id = t.id
      JOIN requests r ON t.id = r.token_id
      JOIN users u ON p.user_id = u.id
      JOIN outlets o ON r.outlet_id = o.id 
      WHERE r.outlet_id IN (:outletIds);
      `,
        {
          replacements: { outletIds },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return results;
    } catch (error) {
      throw new Error(
        `Failed to fetch payments for outlet IDs [${outletIds.join(", ")}]: ${
          error.message
        }`
      );
    }
  },

  async getTotalPaymentsByOutlet() {
    try {
      const results = await sequelize.query(
        `
      SELECT 
        o.id AS outlet_id,
        o.name AS outlet_name,
        SUM(p.amount) AS total_payment
      FROM payments p
      JOIN requests r ON p.token_id = r.token_id
      JOIN outlets o ON r.outlet_id = o.id
      GROUP BY o.id, o.name
      ORDER BY total_payment DESC;
      `,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!results || results.length === 0) {
        throw new Error("No payments data found.");
      }

      const formattedResults = results.map(
        ({ outlet_name, total_payment }) => ({
          outletName: outlet_name,
          totalPayment: total_payment,
        })
      );

      return formattedResults;
    } catch (error) {
      throw new Error(
        `Failed to fetch total payments by outlet: ${error.message}`
      );
    }
  },
};

module.exports = paymentService;
