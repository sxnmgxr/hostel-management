import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  const [students, rooms, unpaidFees, pendingLaundry, pendingFollowUps, feeTrend, occupancy, recentActivity] =
    await Promise.all([
      pool.query('SELECT COUNT(*) FROM students WHERE active = true'),
      pool.query('SELECT COUNT(*) FROM rooms'),
      pool.query('SELECT COUNT(*), COALESCE(SUM(amount), 0) as total FROM fees WHERE paid = false'),
      pool.query('SELECT COUNT(*) FROM laundry WHERE returned = false'),
      pool.query('SELECT COUNT(*) FROM call_logs WHERE follow_up_needed = true'),
      pool.query(`
        SELECT month,
          COALESCE(SUM(amount) FILTER (WHERE paid = true), 0) as collected,
          COALESCE(SUM(amount) FILTER (WHERE paid = false), 0) as pending
        FROM fees
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6
      `),
      pool.query(`
        SELECT r.number, r.capacity, COUNT(s.id) as occupied
        FROM rooms r
        LEFT JOIN students s ON s.room_id = r.id AND s.active = true
        GROUP BY r.id
        ORDER BY r.number
      `),
      pool.query(`
        (SELECT 'fee' as type, f.created_at as event_date, s.full_name,
          CONCAT('Fee of Rs. ', f.amount, ' for ', f.month, CASE WHEN f.paid THEN ' marked paid' ELSE ' recorded' END) as description
         FROM fees f JOIN students s ON f.student_id = s.id)
        UNION ALL
        (SELECT 'laundry' as type, l.date_sent as event_date, s.full_name,
          CONCAT(l.item_count, ' items sent to laundry') as description
         FROM laundry l JOIN students s ON l.student_id = s.id)
        UNION ALL
        (SELECT 'call' as type, c.call_date as event_date, s.full_name,
          CONCAT('Call logged: ', c.purpose) as description
         FROM call_logs c JOIN students s ON c.student_id = s.id)
        ORDER BY event_date DESC
        LIMIT 8
      `),
    ])

  return NextResponse.json({
    totalStudents: Number(students.rows[0].count),
    totalRooms: Number(rooms.rows[0].count),
    unpaidFeesCount: Number(unpaidFees.rows[0].count),
    unpaidFeesTotal: Number(unpaidFees.rows[0].total),
    pendingLaundryCount: Number(pendingLaundry.rows[0].count),
    pendingFollowUps: Number(pendingFollowUps.rows[0].count),
    feeTrend: feeTrend.rows.reverse().map((r) => ({
      month: r.month,
      collected: Number(r.collected),
      pending: Number(r.pending),
    })),
    occupancy: occupancy.rows.map((r) => ({
      room: r.number,
      capacity: Number(r.capacity),
      occupied: Number(r.occupied),
    })),
    recentActivity: recentActivity.rows.map((r) => ({
      type: r.type,
      date: r.event_date,
      studentName: r.full_name,
      description: r.description,
    })),
  })
}