const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const {
    authenticateToken
} = require("../middleware/auth");

const router = express.Router();

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
}

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        const cleanName = String(name).trim();
        const cleanEmail = String(email).trim().toLowerCase();

        if (cleanName.length < 2 || cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name must contain between 2 and 100 characters."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        // Check whether the email already exists
        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        // Public registration always creates a normal user.
        // Admin privileges must be assigned separately.
        const [result] = await db.execute(
            `INSERT INTO users (name, email, password, role)
             VALUES (?, ?, ?, 'user')`,
            [cleanName, cleanEmail, hashedPassword]
        );

        const user = {
            id: result.insertId,
            name: cleanName,
            email: cleanEmail,
            role: "user"
        };

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Registration successful!",
            token,
            user
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const cleanEmail = String(email).trim().toLowerCase();

        const [users] = await db.execute(
            `SELECT id, name, email, password, role
             FROM users
             WHERE email = ?`,
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
});

// GET CURRENT LOGGED-IN USER
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT id, name, email, role, created_at
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        return res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Current user error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve account details."
        });
    }
});

module.exports = router;