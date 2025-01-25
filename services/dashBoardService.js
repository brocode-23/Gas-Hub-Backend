const { Op } = require("sequelize");
const Outlet = require("../models/Outlet");
const User = require("../models/User");
const Request = require("../models/Request");
const Payment = require("../models/payment");
const Token = require("../models/token");
const sequelize = require("../config/database");

const dashboardService = {
  async getDashboardStats() {
    try {
      // Total Outlets
      const totalOutlets = await Outlet.count();

      // Total Managers
      const totalManagers = await User.count({ where: { role: "Manager" } });

      // Total Customers
      const totalCustomers = await User.count({ where: { role: "Customer" } });

      // Pending Requests
      const pendingRequests = await Request.count({
        where: { status: "Pending" },
      });

      // Total Sales
      const totalSales = await Payment.sum("amount", {
        where: { status: "Completed" },
      });

      return {
        totalOutlets,
        totalManagers,
        totalCustomers,
        pendingRequests,
        totalSales: totalSales || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  },

  async getMonthlySales(year) {
    console.log(year);
    try {
      const currentMonth = new Date().getMonth();
      const monthlySales = [];

      for (let month = 0; month <= currentMonth; month++) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const totalSales = await Payment.sum("amount", {
          where: {
            status: "Completed",
            paid_at: {
              [Op.between]: [startDate, endDate],
            },
          },
        });

        monthlySales.push({
          name: startDate.toLocaleString("default", { month: "short" }),
          value: totalSales || 0,
        });
      }

      monthlySales.push(
        {
          name: "Mar",
          value: 9800,
        },
        { name: "Apr", value: 3908 },
        { name: "Apr", value: 3908 },
        { name: "May", value: 4800 },
        { name: "Jun", value: 3800 }
      );

      return monthlySales;
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to fetch monthly sales: ${error.message}`);
    }
  },

  async getOutletStatsByUserEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error("User not found");

      const outlets = await Outlet.findAll({ where: { manager_id: user.id } });
      if (!outlets || outlets.length === 0)
        throw new Error("No outlets found for this user");

      const outletIds = outlets.map((outlet) => outlet.id);

      const totalTokens = await Request.count({
        where: { outlet_id: { [Op.in]: outletIds } },
      });

      const pendingTokens = await Request.count({
        where: { outlet_id: { [Op.in]: outletIds }, status: "Pending" },
      });

      const outletStock = await Outlet.sum("stock_level", {
        where: { id: outletIds },
      });

      const totalPaymentsResult = await sequelize.query(
        `
        SELECT SUM(p.amount) AS totalPayments
        FROM payments p
        JOIN tokens t ON p.token_id = t.id
        JOIN requests r ON t.id = r.token_id
        WHERE r.outlet_id IN (:outletIds) AND p.status = 'Completed'
        `,
        {
          replacements: { outletIds },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const totalPayments = totalPaymentsResult[0]?.totalPayments || 0;

      return {
        totalTokens,
        pendingTokens,
        outletStock: outletStock || 0,
        totalPayments,
      };
    } catch (error) {
      throw new Error(`Failed to fetch outlet stats: ${error.message}`);
    }
  },
};

module.exports = dashboardService;
