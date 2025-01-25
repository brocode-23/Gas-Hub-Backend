const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const headOfficeOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// User Sign Up route
router.post("/signup", userController.signUp);

// User Login route
router.post("/login", userController.login);

router.get(
  "/managers",
  authMiddleware,
  headOfficeOnly,
  userController.getAllManagers
);

router.put(
  "/update",
  authMiddleware,
  headOfficeOnly,
  userController.updateUserDetails
);

router.put(
  "/forgot-password",
  authMiddleware,
  headOfficeOnly,
  userController.forgotPassword
);

module.exports = router;
