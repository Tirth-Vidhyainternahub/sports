require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const os = require("os");
const connectDB = require("./config/dbconfig");
const responseHandler = require("./utils/response");
const errorHandler = require("./utils/error");

// Import Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes")
const teamCategoryRoutes = require("./routes/teamcategory.routes")
const sportCategoryRoutes = require("./routes/sportcategory.routes")
const cityRoutes = require("./routes/city.routes")
const venueRoutes = require("./routes/venue.routes")
const countryRoutes = require("./routes/country.routes")
const ottRoutes = require("./routes/ott.routes")
const telecastRoutes = require("./routes/telecast.routes")
const sportRoutes = require("./routes/sport.routes")
const playerRoutes = require("./routes/player.routes")
const teamRouters = require("./routes/team.routes")
const tournamentCategoryRouters = require("./routes/tournamentCategory.routes")
const bulkuploadRoutes = require("./routes/bulkupload.route")
const tournamentRoutes = require("./routes/tournament.routes")

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/teamcategory", teamCategoryRoutes);
app.use("/api/v1/sportcategory", sportCategoryRoutes);
app.use("/api/v1/city", cityRoutes);
app.use("/api/v1/venue", venueRoutes);
app.use("/api/v1/country", countryRoutes);
app.use("/api/v1/ott", ottRoutes);
app.use("/api/v1/telecast", telecastRoutes);
app.use("/api/v1/sport", sportRoutes);
app.use("/api/v1/player", playerRoutes);
app.use("/api/v1/team",teamRouters)
app.use("/api/v1/tournamentCategory",tournamentCategoryRouters)
app.use("/api/v1/bulkupload", bulkuploadRoutes)
app.use("/api/v1/tournament", tournamentRoutes)

// Health Check Route
app.get("/api/v1/health", (req, res) => {
  try {
    const healthData = {
      status: "Healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: os.loadavg(),
      platform: os.platform(),
      release: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      numberOfCpus: os.cpus().length,
      networkInterfaces: os.networkInterfaces(),
    };

    responseHandler(res, 200, "Server is healthy and running!", healthData);
  } catch (error) {
    errorHandler(res, 500, "Health check failed", error);
  }
});

// Global Error Handling
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  errorHandler(res, err.status || 500, err.message || "Internal Server Error");
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 [Server] Running on port ${PORT}`);
});