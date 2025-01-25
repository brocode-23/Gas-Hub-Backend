const businessService = require("../services/businessRequestService");

const businessController = {
  async addBusinessRequest(req, res) {
    try {
      const businessData = req.body;
      const newRequest = await businessService.addBusinessRequest(businessData);
      res.status(201).json({
        message: "Business request added successfully",
        businessRequest: newRequest,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getAllBusinessRequests(req, res) {
    try {
      const requests = await businessService.getAllBusinessRequests();
      res.status(200).json({
        message: "Business requests fetched successfully",
        businessRequests: requests,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateBusinessRequest(req, res) {
    try {
      const updatedRequest = await businessService.updatedBusinessRequest(
        req.body
      );

      res.status(200).json({
        message: "Business request updated successfully.",
        data: updatedRequest,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = businessController;
