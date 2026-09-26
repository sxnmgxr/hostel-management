CREATE TABLE IF NOT EXISTS call_logs (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  called_by VARCHAR(255) NOT NULL,
  call_date TIMESTAMP DEFAULT NOW(),
  purpose VARCHAR(50) NOT NULL,
  outcome VARCHAR(50) NOT NULL,
  notes TEXT,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_date DATE
);





CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  guardian_name VARCHAR(255) NOT NULL,
  guardian_phone VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(50),
  nationality VARCHAR(100),
  religion VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  institution VARCHAR(255),
  course VARCHAR(255),
  year_of_study VARCHAR(50),
  student_number VARCHAR(100),
  emergency_contact_name VARCHAR(255),
  emergency_contact_relation VARCHAR(100),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_address TEXT,
  blood_group VARCHAR(20),
  medical_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  health_notes TEXT,
  admission_date TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  room_id INTEGER REFERENCES rooms(id),
  created_at TIMESTAMP DEFAULT NOW()
);

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
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type VARCHAR(100) NOT NULL DEFAULT 'Standard';

CREATE TABLE IF NOT EXISTS fee_structures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  room_type VARCHAR(100),
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  monthly_amount NUMERIC(10, 2) NOT NULL,
  due_day INTEGER NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 28),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fees (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month VARCHAR(20) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_date TIMESTAMP,
  due_date DATE,
  payment_date TIMESTAMP,
  payment_method VARCHAR(30) DEFAULT 'cash',
  receipt_number VARCHAR(80),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE fees ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE fees ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP;
ALTER TABLE fees ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'cash';
ALTER TABLE fees ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(80);

CREATE TABLE IF NOT EXISTS laundry (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  item_count INTEGER NOT NULL,
  date_sent TIMESTAMP DEFAULT NOW(),
  returned BOOLEAN DEFAULT FALSE,
  return_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff', 'parent')),
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE users SET permissions = ARRAY['dashboard', 'attendance', 'laundry', 'calls', 'calendar']
WHERE role = 'staff' AND cardinality(permissions) = 0;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'parent'));

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

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
);

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
  CHECK (full_marks > 0),
  CHECK (pass_marks >= 0 AND pass_marks <= full_marks),
  CHECK (theory_marks IS NULL OR theory_marks >= 0),
  CHECK (practical_marks >= 0),
  CHECK (grace_marks >= 0),
  CHECK (credit_units IS NULL OR credit_units >= 0)
);