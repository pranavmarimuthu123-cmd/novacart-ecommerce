const express = require("express");
const db = require("../db");

const {
    authenticateToken
} = require("../middleware/auth");

const router = express.Router();

// CREATE ORDER
router.post("/", authenticateToken, async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { items, shipping_address } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });
        }

        if (
            typeof shipping_address !== "string" ||
            shipping_address.trim().length < 10 ||
            shipping_address.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid shipping address."
            });
        }

        // Validate item IDs and quantities.
        const quantities = new Map();

        for (const item of items) {
            const id = Number(item.id);
            const quantity = Number(item.quantity);

            if (
                !Number.isSafeInteger(id) ||
                id <= 0 ||
                !Number.isSafeInteger(quantity) ||
                quantity <= 0 ||
                quantity > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product or quantity."
                });
            }

            quantities.set(
                id,
                (quantities.get(id) || 0) + quantity
            );
        }

        await connection.beginTransaction();

        let total = 0;
        const verifiedItems = [];

        // Read prices and stock from the database.
        for (const [productId, quantity] of quantities) {
            const [products] = await connection.execute(
                `SELECT id, name, price, stock
                 FROM products
                 WHERE id = ?
                 FOR UPDATE`,
                [productId]
            );

            if (products.length === 0) {
                throw new Error(`Product ${productId} was not found.`);
            }

            const product = products[0];

            if (quantity > Number(product.stock)) {
                throw new Error(
                    `Insufficient stock for ${product.name}.`
                );
            }

            const price = Number(product.price);

            total += price * quantity;

            verifiedItems.push({
                id: product.id,
                name: product.name,
                price,
                quantity
            });
        }

        total = Number(total.toFixed(2));

        const [orderResult] = await connection.execute(
            `INSERT INTO orders
                (user_id, total_amount, shipping_address,
                 status, payment_method)
             VALUES (?, ?, ?, 'Pending', 'Cash on Delivery')`,
            [
                req.user.id,
                total,
                shipping_address.trim()
            ]
        );

        const orderId = orderResult.insertId;

        for (const item of verifiedItems) {
            await connection.execute(
                `INSERT INTO order_items
                    (order_id, product_id, quantity, price)
                 VALUES (?, ?, ?, ?)`,
                [
                    orderId,
                    item.id,
                    item.quantity,
                    item.price
                ]
            );

            await connection.execute(
                `UPDATE products
                 SET stock = stock - ?
                 WHERE id = ?`,
                [item.quantity, item.id]
            );
        }

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: {
                id: orderId,
                total_amount: total,
                status: "Pending",
                payment_method: "Cash on Delivery",
                items: verifiedItems
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("Create order error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to place order."
        });

    } finally {
        connection.release();
    }
});

// GET ORDERS FOR THE LOGGED-IN USER
router.get("/my", authenticateToken, async (req, res) => {
    try {
        const [orders] = await db.execute(
            `SELECT id, total_amount, shipping_address,
                    status, payment_method, created_at
             FROM orders
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        return res.json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Fetch orders error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch your orders."
        });
    }
});

module.exports = router;