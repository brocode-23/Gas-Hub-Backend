const express = require("express");
const outletController = require("../controllers/outletController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

// Request eka evanne head office use kenekda kiyala check karanna .
const headOfficeOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

router.post(
  "/add",
  authMiddleware,
  headOfficeOnly,
  (req, res, next) => {
    console.log(req.body);
    next();
  },
  outletController.addOutlet
);
router.put(
  "/update",
  authMiddleware,
  headOfficeOnly,
  outletController.updateOutlet
);
router.get("/all", authMiddleware, outletController.getAllOutlets);
router.delete(
  "/delete",
  authMiddleware,
  headOfficeOnly,
  outletController.deleteOutlet
);
router.get(
  "/stock-details",
  authMiddleware,
  (req, res, next) => {
    req.email = req.user.email;
    next();
  },
  outletController.getStockDetails
);

module.exports = router;
