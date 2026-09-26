import { pool } from '../lib/db'

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      announcement_type VARCHAR(30) NOT NULL DEFAULT 'general',
      audience VARCHAR(30) NOT NULL DEFAULT 'all',
      created_by VARCHAR(255),
      published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS communication_logs (
      id SERIAL PRIMARY KEY,
      announcement_id INTEGER REFERENCES announcements(id) ON DELETE SET NULL,
      student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
      recipient_name VARCHAR(255) NOT NULL,
      recipient_phone VARCHAR(50),
      channel VARCHAR(30) NOT NULL DEFAULT 'notice',
      status VARCHAR(30) NOT NULL DEFAULT 'queued',
      sent_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('Communication tables are ready')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Communication migration failed:', error)
  await pool.end()
  process.exitCode = 1
})