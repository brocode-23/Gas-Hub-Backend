const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const jobSchedule = require("./services/jobScheduleService");

const sequelize = require("./config/database");
const User = require("./models/User");
const Token = require("./models/token");
const Outlet = require("./models/Outlet");
const Request = require("./models/Request");
const OutletStock = require("./models/OutletStock");
const RequestTankDetails = require("./models/requesttankdetails");
const Notification = require("./models/Notification");
const AuditLog = require("./models/auditlogs");
const Payment = require("./models/payment");
const Analytics = require("./models/Analytics");
const MonthlyUsage = require("./models/MonthlyUsage");
const BusinessRequest = require("./models/buisnessRequest");

const userRoutes = require("./routes/userRoutes");
const outletRoutes = require("./routes/outletRoutes");
const requestRoutes = require("./routes/requestRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const businessRequestRoutes = require("./routes/businessRequestRoutes");
const dashBoardRoutes = require("./routes/dashBoardRoutes");

const dbName = process.env.DB_NAME;

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json({ limit: "10mb" })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

//Routes
app.use("/api/user", userRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/business-request", businessRequestRoutes);
app.use("/api/dashboard", dashBoardRoutes);

sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("Database synced successfully with auto-update.");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
