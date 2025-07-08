require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const path = require("path");

const connectDB = require("./middleware/db");

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL || "*" })); // Restrict CORS to client

// Serve Static Files (for images/uploads)
app.use("/uploads", express.static("uploads"));

// Routes
const routes = {
    auth: require("./routes/authRoutes"),
    users: require("./routes/userRoutes"),
    sessions: require("./routes/sessionRoutes"),
    appointments: require("./routes/appointmentRoutes"),
    therapists: require("./routes/therapistRoutes"),
};

// const prescriptionRoutes = require('./routes/prescriptionRoutes');

// Register Routes
Object.entries(routes).forEach(([key, route]) => {
    app.use(`/api/${key}`, route);
});

// app.use('/api/prescriptions', prescriptionRoutes);

// Default Route
app.get("/", (req, res) => res.send("MindConnect API Server is running..."));

// Handle Undefined Routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// SSL Configuration
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/backend/private-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/backend/certificate.pem'))
};

// Start HTTP Server
const HTTP_PORT = process.env.PORT || 4000;
app.listen(HTTP_PORT, () => {
    console.log(`🚀 MindConnect API Server (HTTP) running on port ${HTTP_PORT}`);
    console.log(`📡 Access via: http://localhost:${HTTP_PORT}`);
});

// Start HTTPS Server
const HTTPS_PORT = process.env.HTTPS_PORT || 4001;
https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`🔒 MindConnect API Server (HTTPS) running on port ${HTTPS_PORT}`);
    console.log(`📡 Access via: https://localhost:${HTTPS_PORT}`);
    console.log(`⚠️  Note: You may see a security warning for self-signed certificates`);
});
