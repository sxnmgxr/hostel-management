import { readFile } from 'node:fs/promises'
import nextEnv from '@next/env'
import { Pool } from 'pg'

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL is not set. Add it to .env.local before initializing the database.')
  process.exit(1)
}

const databaseUrl = new URL(connectionString)
const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1))

if (!databaseName) {
  console.error('DATABASE_URL must include a PostgreSQL database name.')
  process.exit(1)
}

try {
  databaseUrl.pathname = '/postgres'
  const adminPool = new Pool({ connectionString: databaseUrl.toString() })
  try {
    const result = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    )
    if (result.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE "${databaseName.replaceAll('"', '""')}"`)
      console.log(`Created PostgreSQL database "${databaseName}".`)
    } else {
      console.log(`PostgreSQL database "${databaseName}" already exists.`)
    }
  } finally {
    await adminPool.end()
  }

  const pool = new Pool({ connectionString })
  const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8')
  try {
    await pool.query(schema)
    console.log('Database schema initialized successfully.')
  } finally {
    await pool.end()
  }
} catch (error) {
  console.error('Failed to create the database or initialize its schema:', error)
  process.exitCode = 1
}
