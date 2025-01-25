const express = require("express");
const RequestController = require("../controllers/requestController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const Restircted = (req, res, next) => {
  console.log(req.user.role);
  if (req.user.role !== "Admin" && req.user.role !== "Manager") {
    return res.status(403).json({ message: "Access denied. Unauthorized." });
  }
  next();
};

router.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    console.log(req.user.email);
    req.body.user_mail = req.user.email;
    next();
  },
  RequestController.createRequest
);
router.get(
  "/all",
  authMiddleware,
  Restircted,
  (req, res, next) => {
    req.email = req.user.email;
    next();
  },
  RequestController.getAllRequests
);
router.put(
  "/update",
  authMiddleware,
  Restircted,
  RequestController.updateRequest
);

module.exports = router;
