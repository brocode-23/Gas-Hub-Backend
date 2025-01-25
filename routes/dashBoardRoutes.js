const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const dashboardController = require("../controllers/dashBoardController");

const router = express.Router();

const Restircted = (req, res, next) => {
  console.log(req.user.role);
  if (req.user.role !== "Admin" && req.user.role !== "Manager") {
    return res.status(403).json({ message: "Access denied. Unauthorized." });
  }
  next();
};

router.get("/stats", authMiddleware, Restircted, dashboardController.getStats);
router.get(
  "/sales/monthly",
  authMiddleware,
  Restircted,
  dashboardController.getMonthlySales
);
router.get(
  "/outlet-stats",
  authMiddleware,
  Restircted,
  (req, res, next) => {
    req.email = req.user.email;
    next();
  },
  dashboardController.getOutletStats
);

module.exports = router;
