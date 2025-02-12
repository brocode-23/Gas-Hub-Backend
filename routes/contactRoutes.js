const express = require("express");
const ContactController = require("../controllers/contactController");

const router = express.Router();

router.post("/send", ContactController.sendEmail);

module.exports = router;