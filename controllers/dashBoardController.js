const dashboardService = require("../services/dashBoardService");

const dashboardController = {
  async getStats(req, res) {
    try {
      const stats = await dashboardService.getDashboardStats();
      console.log(stats);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getMonthlySales(req, res) {
    try {
      const currentYear = new Date().getFullYear();
      const salesYear = currentYear;

      const monthlySales = await dashboardService.getMonthlySales(salesYear);
      res.status(200).json({ success: true, data: monthlySales });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getOutletStats(req, res) {
    try {
      const email = req.email;
      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required." });
      }

      const stats = await dashboardService.getOutletStatsByUserEmail(email);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = dashboardController;
