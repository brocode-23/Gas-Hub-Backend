const Outlet = require("../models/Outlet");
const User = require("../models/User");
const OutletStock = require("../models/OutletStock");
const Request = require("../models/Request");
const RequestTankDetails = require("../models/RequestTankDetails");
const sequelize = require("../config/database");

const outletService = {
  async addOutlet(data) {
    const { name, location, stock_level, email, stocks } = data;

    const transaction = await sequelize.transaction(); // Table dekakata data save vena nisa , kisima hethuvakata data loss wena eka navaththanna .

    try {
      // Requaet eke ena email eke user id eka ganna .
      const user = await User.findOne({ where: { email } });
      if (!user || user.role !== "Manager") {
        throw new Error("Manager with this email not found");
      }

      const outlet = await Outlet.create(
        {
          name,
          location,
          stock_level,
          manager_id: user.id,
        },
        { transaction }
      );

      // Stock type ekai quantity ekai save karanna .
      for (const stock of stocks) {
        const { tank_type, quantity } = stock;
        await OutletStock.create(
          {
            outlet_id: outlet.id,
            tank_type,
            quantity,
          },
          { transaction }
        );
      }

      await transaction.commit(); // Transaction eka commit karanna .
      return outlet;
    } catch (error) {
      await transaction.rollback(); // Transaction eka rollback karanna .
      throw new Error("Error while creating outlet: " + error.message);
    } finally {
      if (transaction) {
        await transaction.afterCommit(() => {
          console.log("Transaction closed.");
        });
      }
    }
  },

  async updateOutlet(data) {
    const { id, name, location, stock_level, email, stocks } = data;

    const transaction = await sequelize.transaction(); // Table dekaka data update vena nisa , kisima hethuvakata data loss wena eka navaththanna .

    try {
      // Requaet eke ena email eke user id eka ganna .
      const user = await User.findOne({ where: { email } });
      if (!user || user.role !== "Manager") {
        throw new Error("Manager with this email not found");
      }

      const outlet = await Outlet.findByPk(id);
      if (!outlet) {
        throw new Error("Outlet not found");
      }

      outlet.name = name;
      outlet.location = location;
      outlet.stock_level = stock_level;
      outlet.manager_id = user.id;
      await outlet.save({ transaction });

      await OutletStock.destroy({ where: { outlet_id: id }, transaction });

      for (const stock of stocks) {
        const { tank_type, quantity } = stock;
        await OutletStock.create(
          {
            outlet_id: outlet.id,
            tank_type,
            quantity,
          },
          { transaction }
        );
      }

      await transaction.commit(); // Transaction eka commit karanna .
      return outlet;
    } catch (error) {
      await transaction.rollback(); // Transaction eka rollback karanna .
      throw new Error("Error while updating outlet: " + error.message);
    } finally {
      if (transaction) {
        await transaction.afterCommit(() => {
          console.log("Transaction closed.");
        });
      }
    }
  },

  async getAllOutlets() {
    try {
      return await Outlet.findAll({
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
          {
            model: OutletStock,
            attributes: ["tank_type", "quantity"],
          },
        ],
      });
    } catch (error) {
      throw new Error("Error while fetching outlets: " + error.message);
    }
  },

  async deleteOutlet(data) {
    const { id } = data;
    console.log(id);

    const transaction = await sequelize.transaction(); // Table dekakaka deta delete vena nisa , table dekema data delete wena eka confirm karanna .

    try {
      const outlet = await Outlet.findByPk(id, { transaction });
      if (!outlet) {
        throw new Error("Outlet not found");
      }

      await OutletStock.destroy({ where: { outlet_id: id }, transaction });

      await outlet.destroy({ transaction }); //Outlet id eka through outlet eka delete karanna .

      await transaction.commit(); // Transaction eka commit karanna .
      return { message: "Outlet deleted successfully" };
    } catch (error) {
      await transaction.rollback(); // Transaction eka rollback karanna .
      throw new Error("Error while deleting outlet: " + error.message);
    } finally {
      if (transaction) {
        await transaction.afterCommit(() => {
          console.log("Transaction closed.");
        });
      }
    }
  },

  async getStockDetails(email) {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    // Get all outlets managed by the user
    const outlets = await Outlet.findAll({ where: { manager_id: user.id } });
    if (!outlets.length) throw new Error("No outlets found for this manager");

    const stockDetails = [];

    for (const outlet of outlets) {
      const outletId = outlet.id;

      // Get approved requests for the outlet
      const approvedRequests = await Request.findAll({
        where: { outlet_id: outletId, status: "Approved" },
        attributes: ["id"],
      });

      if (!approvedRequests.length) {
        stockDetails.push({ outletId, totalStock: {}, needs: {} });
        continue;
      }

      const requestIds = approvedRequests.map((req) => req.id);

      // Sum up the requested tanks from approved requests
      const requestedTanks = await RequestTankDetails.findAll({
        where: { request_id: requestIds },
        attributes: [
          "tank_type",
          [sequelize.fn("SUM", sequelize.col("quantity")), "total"],
        ],
        group: ["tank_type"],
      });

      const requestTankSummary = requestedTanks.reduce((acc, item) => {
        acc[item.tank_type] = parseInt(item.total, 10);
        return acc;
      }, {});

      // Get the current stock for the outlet
      const outletStock = await OutletStock.findAll({
        where: { outlet_id: outletId },
        attributes: ["tank_type", "quantity"],
      });

      const currentStock = outletStock.reduce((acc, stock) => {
        acc[stock.tank_type] = stock.quantity;
        return acc;
      }, {});

      // Calculate stock needs
      const stockNeeds = {};
      for (const tankType in requestTankSummary) {
        const requiredQuantity = requestTankSummary[tankType];
        const availableQuantity = currentStock[tankType] || 0;
        const difference = Math.max(0, requiredQuantity - availableQuantity);
        if (difference > 0) stockNeeds[tankType] = difference;
      }

      stockDetails.push({
        outletId,
        totalStock: currentStock,
        needs: stockNeeds,
      });
    }

    return stockDetails;
  },
};

module.exports = outletService;
