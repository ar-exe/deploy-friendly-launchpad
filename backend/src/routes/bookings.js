const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// All booking routes require auth
router.use(authenticate);

// GET /api/bookings
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.notes, b.status,
              json_build_object('name', s.name, 'duration_minutes', s.duration_minutes, 'price', s.price) AS services
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const { service_id, booking_date, booking_time, notes } = req.body;
    if (!service_id || !booking_date || !booking_time) {
      return res.status(400).json({ error: "service_id, booking_date, and booking_time are required" });
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO bookings (id, user_id, service_id, booking_date, booking_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')`,
      [id, req.user.id, service_id, booking_date, booking_time, notes || null]
    );

    res.status(201).json({ id, status: "confirmed" });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/bookings/:id/cancel
router.patch("/:id/cancel", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Booking not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
