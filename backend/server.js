const express = require("express");
const cors = require("cors");
const path = require("path");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const app = express();
const PORT = process.env.PORT || 5000;

const db = require("./db");
const authRoutes = require("./routes/auth");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Authentication APIs
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Database health check
app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS database_name"
        );

        res.json({
            success: true,
            message: "E-Commerce API is running!",
            database: rows[0].database_name
        });
    } catch (error) {
        console.error("Health check error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});

// Home page
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );
});

// Unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found."
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err.message);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

app.listen(PORT, () => {
    console.log("==================================");
    console.log("    NOVACART E-COMMERCE SERVER");
    console.log(`    http://localhost:${PORT}`);
    console.log("==================================");
});