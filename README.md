# Hostel Management

## Database setup

This app uses PostgreSQL. Make sure PostgreSQL is running and create a database
named `hostel_db` (or update the database name in `DATABASE_URL`).

Create a `.env.local` file in the project root and set your PostgreSQL
connection string:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hostel_db"
```

Replace `postgres` and `YOUR_PASSWORD` with your PostgreSQL user and password.
The [`.env.example`](./.env.example) file shows the required variable; do not
commit `.env.local`.

Initialize the tables, then start the app:

```bash
npm run db:init
npm run dev
```

`npm run db:init` creates any missing tables from [`db/schema.sql`](./db/schema.sql)
and does not delete existing tables or records.

## Development

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
