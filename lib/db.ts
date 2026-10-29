import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local and restart the Next.js server.')
}

const globalForDb = globalThis as unknown as { pool: Pool }

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool