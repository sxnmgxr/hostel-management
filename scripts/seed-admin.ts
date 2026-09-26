   import { pool } from '../lib/db'
   import { hashPassword } from '../lib/auth'

   async function main() {
     const hashed = await hashPassword('yourAdminPassword')
     await pool.query(
       `INSERT INTO users (email, password, role) VALUES ($1, $2, $3)
        ON CONFLICT (email) DO NOTHING`,
       ['admin@believershostel.com', hashed, 'admin']
     )

     if (process.env.STAFF_EMAIL && process.env.STAFF_PASSWORD) {
       const staffPassword = await hashPassword(process.env.STAFF_PASSWORD)
       await pool.query(
        `INSERT INTO users (email, password, role, permissions) VALUES ($1, $2, 'staff', ARRAY['dashboard', 'attendance', 'laundry', 'calls', 'calendar'])
          ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'staff', permissions = EXCLUDED.permissions`,
         [process.env.STAFF_EMAIL, staffPassword]
       )
       console.log(`Staff user created: ${process.env.STAFF_EMAIL}`)
     }

     if (process.env.PARENT_EMAIL && process.env.PARENT_PASSWORD && process.env.PARENT_STUDENT_ID) {
       const parentPassword = await hashPassword(process.env.PARENT_PASSWORD)
       await pool.query(
         `INSERT INTO users (email, password, role, student_id) VALUES ($1, $2, 'parent', $3)
          ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = 'parent', student_id = EXCLUDED.student_id`,
         [process.env.PARENT_EMAIL, parentPassword, Number(process.env.PARENT_STUDENT_ID)]
       )
       console.log(`Parent user created: ${process.env.PARENT_EMAIL}`)
     }

     console.log('Admin user created')
     process.exit(0)
   }

   main()