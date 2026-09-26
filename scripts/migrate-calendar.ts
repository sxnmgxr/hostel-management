import { pool } from '../lib/db'

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      event_type VARCHAR(30) NOT NULL DEFAULT 'general' CHECK (event_type IN ('general', 'maintenance', 'meeting', 'holiday', 'deadline')),
      created_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('Calendar table is ready')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Calendar migration failed:', error)
  await pool.end()
  process.exitCode = 1
})
