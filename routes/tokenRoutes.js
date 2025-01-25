const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const TokenController = require("../controllers/tokenController");

const router = express.Router();

// Request eka evanne Admin user kenekda Manager kenekda kiyala check karanna .
const Restircted = (req, res, next) => {
  console.log(req.user.role);
  if (req.user.role !== "Admin" && req.user.role !== "Manager") {
    return res.status(403).json({ message: "Access denied. Unauthorized." });
  }
  next();
};

router.put("/update", authMiddleware, Restircted, TokenController.updateToken);
router.get("/all", authMiddleware, Restircted, TokenController.getAllTokens);
router.get(
  "/filter",
  authMiddleware,
  Restircted,
  TokenController.getTokensByFilter
);
router.get(
  "/user/all",
  authMiddleware,
  (req, res, next) => {
    req.id = req.user.id;
    next();
  },
  TokenController.fetchUserTokens
);
router.get(
  "/outlet/all",
  authMiddleware,
  Restircted,
  (req, res, next) => {
    req.email = req.user.email;
    console.log(req.user);
    next();
  },
  TokenController.getTokensByEmail
);
router.post(
  "/total-price",
  authMiddleware,
  Restircted,
  TokenController.calculateTotalPrice
);
router.put(
  "/code/update",
  authMiddleware,
  Restircted,
  TokenController.updateTokenByCode
);

module.exports = router;
