import { pool } from '../lib/db'

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS academic_records (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      academic_year VARCHAR(30) NOT NULL,
      term VARCHAR(50) NOT NULL,
      exam_name VARCHAR(150) NOT NULL,
      exam_type VARCHAR(50) NOT NULL DEFAULT 'examination',
      class_name VARCHAR(50),
      section VARCHAR(30),
      roll_number VARCHAR(30),
      result_format VARCHAR(30) NOT NULL DEFAULT 'early_years',
      working_days INTEGER,
      present_days INTEGER,
      absent_days INTEGER,
      unit_code VARCHAR(50),
      unit_name VARCHAR(150) NOT NULL,
      score NUMERIC(6, 2),
      max_score NUMERIC(6, 2) NOT NULL DEFAULT 100,
      full_marks NUMERIC(6, 2) NOT NULL DEFAULT 100,
      pass_marks NUMERIC(6, 2) NOT NULL DEFAULT 0,
      theory_marks NUMERIC(6, 2),
      practical_marks NUMERIC(6, 2) NOT NULL DEFAULT 0,
      grace_marks NUMERIC(6, 2) NOT NULL DEFAULT 0,
      component_marks JSONB NOT NULL DEFAULT '{}'::jsonb,
      internal_marks NUMERIC(6, 2) NOT NULL DEFAULT 0,
      grade_point NUMERIC(4, 2),
      th_grade VARCHAR(20),
      in_grade VARCHAR(20),
      final_grade VARCHAR(20),
      grade VARCHAR(20),
      credit_units NUMERIC(5, 2),
      remarks TEXT,
      recorded_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW(),
      CHECK (score IS NULL OR score >= 0),
      CHECK (max_score > 0),
      CHECK (score IS NULL OR score <= max_score),
      CHECK (credit_units IS NULL OR credit_units >= 0)
    )
  `)
  await pool.query(`
    ALTER TABLE academic_records
      ADD COLUMN IF NOT EXISTS full_marks NUMERIC(6, 2),
      ADD COLUMN IF NOT EXISTS pass_marks NUMERIC(6, 2),
      ADD COLUMN IF NOT EXISTS theory_marks NUMERIC(6, 2),
      ADD COLUMN IF NOT EXISTS practical_marks NUMERIC(6, 2),
      ADD COLUMN IF NOT EXISTS grace_marks NUMERIC(6, 2)
      , ADD COLUMN IF NOT EXISTS component_marks JSONB NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS class_name VARCHAR(50),
      ADD COLUMN IF NOT EXISTS section VARCHAR(30),
      ADD COLUMN IF NOT EXISTS roll_number VARCHAR(30),
      ADD COLUMN IF NOT EXISTS result_format VARCHAR(30) NOT NULL DEFAULT 'early_years',
      ADD COLUMN IF NOT EXISTS working_days INTEGER,
      ADD COLUMN IF NOT EXISTS present_days INTEGER,
      ADD COLUMN IF NOT EXISTS absent_days INTEGER,
      ADD COLUMN IF NOT EXISTS internal_marks NUMERIC(6, 2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS grade_point NUMERIC(4, 2),
      ADD COLUMN IF NOT EXISTS th_grade VARCHAR(20),
      ADD COLUMN IF NOT EXISTS in_grade VARCHAR(20),
      ADD COLUMN IF NOT EXISTS final_grade VARCHAR(20)
  `)
  await pool.query(`
    UPDATE academic_records
    SET full_marks = COALESCE(full_marks, max_score, 100),
        pass_marks = COALESCE(pass_marks, 0),
        theory_marks = COALESCE(theory_marks, score, 0),
        practical_marks = COALESCE(practical_marks, 0),
        grace_marks = COALESCE(grace_marks, 0)
    WHERE full_marks IS NULL OR pass_marks IS NULL OR theory_marks IS NULL
      OR practical_marks IS NULL OR grace_marks IS NULL
  `)
  console.log('Academic records table is ready')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Academic records migration failed:', error)
  await pool.end()
  process.exitCode = 1
})