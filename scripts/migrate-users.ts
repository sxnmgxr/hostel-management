import { pool } from '../lib/db'

async function main() {
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id) ON DELETE CASCADE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT[] NOT NULL DEFAULT '{}';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
    UPDATE users SET permissions = ARRAY['dashboard', 'attendance', 'laundry', 'calls']
    WHERE role = 'staff' AND cardinality(permissions) = 0;
    UPDATE users SET permissions = array_append(permissions, 'calendar')
    WHERE role = 'staff' AND NOT ('calendar' = ANY(permissions));
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'parent'));
  `)
  console.log('User role columns and permissions are ready')
  await pool.end()
}

main().catch(async (error) => {
  console.error('User migration failed:', error)
  await pool.end()
  process.exitCode = 1
})
