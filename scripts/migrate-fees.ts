import { pool } from '../lib/db'

async function main() {
  await pool.query(`
    ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type VARCHAR(100) NOT NULL DEFAULT 'Standard';
    CREATE TABLE IF NOT EXISTS fee_structures (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      room_type VARCHAR(100),
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      monthly_amount NUMERIC(10, 2) NOT NULL,
      due_day INTEGER NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 28),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    ALTER TABLE fees ADD COLUMN IF NOT EXISTS due_date DATE;
    ALTER TABLE fees ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP;
    ALTER TABLE fees ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'cash';
    ALTER TABLE fees ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(80);
    UPDATE fees SET payment_date = paid_date WHERE paid = TRUE AND payment_date IS NULL;
  `)
  console.log('Fee structures and payment fields are ready')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Fee migration failed:', error)
  await pool.end()
  process.exitCode = 1
})
