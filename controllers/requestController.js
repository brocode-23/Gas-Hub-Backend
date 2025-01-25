const RequestService = require("../services/requestService");

class RequestController {
  async createRequest(req, res) {
    console.log(req.body);
    try {
      const requestData = req.body;
      const newRequest = await RequestService.addRequest(requestData);
      res.status(201).json(newRequest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRequest(req, res) {
    try {
      const requestId = req.params.id;
      const request = await RequestService.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.status(200).json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateRequest(req, res) {
    try {
      const requestId = req.params.id;
      const updateData = req.body;
      const updatedRequest = await RequestService.updateRequest(
        requestId,
        updateData
      );
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.status(200).json(updatedRequest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteRequest(req, res) {
    try {
      const requestId = req.params.id;
      const deletedRequest = await RequestService.deleteRequest(requestId);
      if (!deletedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.status(200).json({ message: "Request deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllRequests(req, res) {
    try {
      const email = req.email;

      console.log(email);

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const requests = await RequestService.getAllRequests(email);

      return res.status(200).json({ success: true, data: requests });
    } catch (error) {
      console.error("Error fetching requests by email:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateRequest(req, res) {
    try {
      const result = await RequestService.updateRequest(req);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RequestController();
