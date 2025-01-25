const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

const Restircted = (req, res, next) => {
  console.log(req.user.role);
  if (req.user.role !== "Admin" && req.user.role !== "Manager") {
    return res.status(403).json({ message: "Access denied. Unauthorized." });
  }
  next();
};

router.post("/add", authMiddleware, Restircted, paymentController.save);
router.put("/update", authMiddleware, Restircted, paymentController.update);
router.get("/all", authMiddleware, Restircted, paymentController.getAll);
router.get(
  "/outlet/all",
  authMiddleware,
  Restircted,
  (req, res, next) => {
    req.id = req.user.id;
    next();
  },
  paymentController.fetchPaymentsByOutlet
);
router.get("/total/all", paymentController.fetchTotalPaymentsOfOutlets);
router.delete("/delete", authMiddleware, Restircted, paymentController.delete);

module.exports = router;
