// Contributors: Samuel Ren

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const config = require("./config");

// import routes
const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");
const meetingRoutes = require("./routes/meetings");
const dashboardRoutes = require("./routes/dashboard");
const bookingRoutes = require("./routes/bookings");
const notificationRoutes = require("./routes/notifications");

// connect to MongoDB
mongoose.connect(config.mongoUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// enable CORS
app.use(
  cors({
    origin: config.allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed methods
    credentials: true,
  })
);

// Serve static files from the React (Vite) app
app.use(express.static(path.join(__dirname, "../client/dist")));

// serve auth routes
app.use("/api/auth", authRoutes);

// serve requests routes
app.use("/api/requests", requestRoutes);

// serve meetings routes
app.use("/api/meetings", meetingRoutes);

// serve dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// serve bookings routes
app.use("/api/bookings", bookingRoutes);

// serve notifications routes
app.use("/api/notifications", notificationRoutes);

// For all other routes, send back the index.html from the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
