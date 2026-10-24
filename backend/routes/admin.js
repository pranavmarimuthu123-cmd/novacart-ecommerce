const express = require("express");
const router = express.Router();
const db = require("../db");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/auth");

// Admin authentication
router.use(authenticateToken, authorizeRoles("admin"));

// GET DASHBOARD STATISTICS
router.get("/stats", async (req, res) => {
    try {
        const [[products]] = await db.query(
            "SELECT COUNT(*) AS totalProducts FROM products"
        );

        const [[orders]] = await db.query(`
            SELECT
                COUNT(*) AS totalOrders,
                COALESCE(
                    SUM(
                        CASE
                            WHEN status <> 'Cancelled'
                            THEN total_amount
                            ELSE 0
                        END
                    ), 0
                ) AS totalRevenue
            FROM orders
        `);

        const [[users]] = await db.query(
            "SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'user'"
        );

        res.json({
            success: true,
            stats: {
                totalProducts: Number(products.totalProducts),
                totalOrders: Number(orders.totalOrders),
                totalRevenue: Number(orders.totalRevenue),
                totalUsers: Number(users.totalUsers)
            }
        });
    } catch (error) {
        console.error("Dashboard error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to load dashboard."
        });
    }
});

// GET ALL PRODUCTS
router.get("/products", async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT * FROM products ORDER BY id DESC"
        );

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error("Products error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products."
        });
    }
});

// ADD PRODUCT
router.post("/products", async (req, res) => {
    try {
        const {
            name,
            description = "",
            price,
            image_url = "",
            category = "General",
            stock = 0
        } = req.body;

        const productPrice = Number(price);
        const productStock = Number(stock);

        if (
            typeof name !== "string" ||
            !name.trim() ||
            price === "" ||
            price === null ||
            price === undefined ||
            !Number.isFinite(productPrice) ||
            productPrice <= 0 ||
            !Number.isInteger(productStock) ||
            productStock < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter valid product details."
            });
        }

        const [result] = await db.query(
            `INSERT INTO products
            (name, description, price, image_url, category, stock)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name.trim(),
                description,
                productPrice,
                image_url,
                category,
                productStock
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product added successfully!",
            productId: result.insertId
        });
    } catch (error) {
        console.error("Add product error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to add product."
        });
    }
});

// UPDATE PRODUCT
router.put("/products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            name,
            description = "",
            price,
            image_url = "",
            category = "General",
            stock
        } = req.body;

        const productPrice = Number(price);
        const productStock = Number(stock);

        if (
            !Number.isInteger(id) ||
            id <= 0 ||
            typeof name !== "string" ||
            !name.trim() ||
            price === "" ||
            price === null ||
            price === undefined ||
            !Number.isFinite(productPrice) ||
            productPrice <= 0 ||
            stock === "" ||
            stock === null ||
            stock === undefined ||
            !Number.isInteger(productStock) ||
            productStock < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product details."
            });
        }

        const [result] = await db.query(
            `UPDATE products
             SET name = ?,
                 description = ?,
                 price = ?,
                 image_url = ?,
                 category = ?,
                 stock = ?
             WHERE id = ?`,
            [
                name.trim(),
                description,
                productPrice,
                image_url,
                category,
                productStock,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully!"
        });
    } catch (error) {
        console.error("Update product error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update product."
        });
    }
});

// DELETE PRODUCT
router.delete("/products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const [result] = await db.query(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully!"
        });
    } catch (error) {
        console.error("Delete product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Cannot delete this product. It may be linked to an order."
        });
    }
});

// GET ALL ORDERS
router.get("/orders", async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT
                o.id,
                o.user_id,
                u.name AS customer_name,
                u.email AS customer_email,
                o.total_amount,
                o.shipping_address,
                o.status,
                o.payment_method,
                o.created_at
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
        `);

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Orders error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders."
        });
    }
});

// UPDATE ORDER STATUS
router.patch("/orders/:id/status", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status."
            });
        }

        const [result] = await db.query(
            "UPDATE orders SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        res.json({
            success: true,
            message: "Order status updated successfully!"
        });
    } catch (error) {
        console.error("Update status error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update order status."
        });
    }
});

module.exports = router;