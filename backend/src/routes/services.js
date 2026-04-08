const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// GET /api/services
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM services ORDER BY price ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Services error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/services/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM services WHERE id = $1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Service not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
