const tokenService = require("../services/tokenService");

class TokenController {
  async updateToken(req, res) {
    try {
      const updates = req.body;

      const updatedToken = await tokenService.updateToken(
        updates.tokenId,
        updates
      );
      res.status(200).json({
        success: true,
        message: "Token updated successfully",
        data: updatedToken,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllTokens(req, res) {
    try {
      const tokens = await tokenService.getAllTokens();
      return res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTokensByFilter(req, res) {
    const { outletId, status, date } = req.body;

    try {
      if (!outletId) {
        return res.status(400).json({ message: "Outlet ID is required." });
      }

      const tokens = await tokenService.getTokensByFilter(
        outletId,
        status,
        date
      );
      return res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async fetchUserTokens(req, res) {
    console.log(`---------------------${req.id}`);
    const userId = req.id;
    try {
      const tokens = await tokenService.getTokensByUserId(userId);
      return res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      console.error(error.message);
    }
  }

  async getTokensByEmail(req, res) {
    const email = req.email;

    if (!email) {
      return res.status(400).json({ error: "Email parameter is required." });
    }

    try {
      const tokens = await tokenService.getTokensByEmail(email);
      res.status(200).json(tokens);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async calculateTotalPrice(req, res) {
    try {
      const { token_code } = req.body;

      if (!token_code) {
        return res.status(400).json({ error: "Token code is required." });
      }

      const result = await tokenService.calculateTotalPriceByTokenCode(
        token_code
      );

      console.log(result);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in TokenController:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  async updateTokenByCode(req, res) {
    try {
      const { token_code, expiration_date, status } = req.body;

      if (!token_code) {
        return res.status(400).json({ error: "Token code is required" });
      }

      const updates = { expiration_date, status };

      const updatedToken = await tokenService.updateTokenByCode(
        token_code,
        updates
      );

      return res.status(200).json({
        message: "Token updated successfully",
        token: updatedToken,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TokenController();
