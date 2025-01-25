const outletService = require("../services/outletService");

const outletController = {
  // Add a new outlet
  async addOutlet(req, res) {
    try {
      const outlet = await outletService.addOutlet(req.body);
      res.status(201).json({ message: "Outlet added successfully", outlet });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update an outlet
  async updateOutlet(req, res) {
    try {
      const outlet = await outletService.updateOutlet(req.body);
      res.status(200).json({ message: "Outlet updated successfully", outlet });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all outlets
  async getAllOutlets(req, res) {
    try {
      const outlets = await outletService.getAllOutlets();
      res.status(200).json(outlets);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete an outlet
  async deleteOutlet(req, res) {
    try {
      const result = await outletService.deleteOutlet(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getStockDetails(req, res) {
    try {
      const email = req.email;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const stockDetails = await outletService.getStockDetails(email);
      return res.status(200).json({ success: true, data: stockDetails });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = outletController;
