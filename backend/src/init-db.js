// Run this once to create tables: node src/init-db.js
require("dotenv").config();
const { pool } = require("./db");

const SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some services if the table is empty
INSERT INTO services (name, description, price, duration_minutes)
SELECT * FROM (VALUES
  ('General Consultation', 'A standard consultation session', 50, 30),
  ('Deep Tissue Massage', 'Full body deep tissue massage', 120, 60),
  ('Hair Styling', 'Professional hair styling session', 80, 45)
) AS v(name, description, price, duration_minutes)
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);
`;

async function init() {
  try {
    await pool.query(SQL);
    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Database init failed:", err);
  } finally {
    await pool.end();
  }
}

init();
