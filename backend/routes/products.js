const express = require("express");
const db = require("../db");

const router = express.Router();

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try {
        const [products] = await db.execute(
            `SELECT id, name, description, price,
                    image_url, category, stock, created_at
             FROM products
             ORDER BY id ASC`
        );

        return res.status(200).json({
            success: true,
            count: products.length,
            products: products
        });
    } catch (error) {
        console.error("Fetch products error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch products."
        });
    }
});

// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const [products] = await db.execute(
            `SELECT id, name, description, price,
                    image_url, category, stock, created_at
             FROM products
             WHERE id = ?`,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            product: products[0]
        });
    } catch (error) {
        console.error("Fetch single product error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch product."
        });
    }
});

module.exports = router;