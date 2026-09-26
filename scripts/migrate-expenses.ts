import { pool } from '../lib/db'

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      category VARCHAR(50) NOT NULL CHECK (category IN ('electricity', 'food', 'staff_salary', 'maintenance', 'water', 'internet', 'supplies', 'other')),
      title VARCHAR(255) NOT NULL,
      amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
      expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
      payment_method VARCHAR(30) NOT NULL DEFAULT 'cash',
      vendor VARCHAR(255),
      reference VARCHAR(120),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  console.log('Expense ledger is ready')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Expense migration failed:', error)
  await pool.end()
  process.exitCode = 1
})