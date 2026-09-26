import { pool } from '../lib/db'

async function main() {
  await pool.query(`
    ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS religion VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS institution VARCHAR(255);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS course VARCHAR(255);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(50);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS student_number VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_address TEXT;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group VARCHAR(20);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS allergies TEXT;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS medications TEXT;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS health_notes TEXT;
  `)
  console.log('Student profile columns are ready')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Student migration failed:', error)
  await pool.end()
  process.exitCode = 1
})
