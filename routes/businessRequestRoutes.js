const express = require("express");
const businessController = require("../controllers/businessRequestController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const headOfficeOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

router.post("/add", authMiddleware, businessController.addBusinessRequest);

router.get(
  "/all",
  authMiddleware,
  headOfficeOnly,
  businessController.getAllBusinessRequests
);

router.put(
  "/update",
  authMiddleware,
  headOfficeOnly,
  businessController.updateBusinessRequest
);

module.exports = router;
