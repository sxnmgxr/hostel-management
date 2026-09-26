import { pool } from '../lib/db'

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL,
      notes TEXT,
      check_in TIMESTAMP,
      check_out TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)
  console.log('Attendance table is ready')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Attendance migration failed:', error)
  await pool.end()
  process.exitCode = 1
})
