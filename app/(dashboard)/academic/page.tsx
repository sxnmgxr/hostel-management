'use client'

import { FormEvent, useEffect, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { GraduationCap, ClipboardList, Award, BookOpen, AlertCircle } from 'lucide-react'

type Student = { id: number; full_name: string; student_number: string | null; institution?: string | null; course?: string | null; year_of_study?: string | null }
type AcademicRecord = {
  id: number
  student_id: number
  full_name: string
  student_number: string | null
  academic_year: string
  term: string
  exam_name: string
  exam_type: string
  class_name: string | null
  section: string | null
  roll_number: string | null
  result_format: string
  working_days: number | null
  present_days: number | null
  absent_days: number | null
  unit_code: string | null
  unit_name: string
  score: number | string | null
  max_score: number | string
  full_marks: number | string
  pass_marks: number | string
  theory_marks: number | string | null
  practical_marks: number | string
  grace_marks: number | string
  component_marks: Record<string, number | string> | null
  internal_marks: number | string
  grade_point: number | string | null
  th_grade: string | null
  in_grade: string | null
  final_grade: string | null
  grade: string | null
  credit_units: number | string | null
  remarks: string | null
}

const emptyForm = {
  studentId: '', academicYear: '', term: 'Semester 1', examName: '', examType: 'terminal_examination', resultFormat: 'early_years',
  className: '', section: '', rollNumber: '', workingDays: '', presentDays: '', absentDays: '',
  unitCode: '', unitName: '', score: '', maxScore: '100', fullMarks: '100', passMarks: '32',
  theoryMarks: '', practicalMarks: '', graceMarks: '0', internalMarks: '', thGrade: '', inGrade: '', grade: '', creditUnits: '', remarks: '',
  componentMarks: { PSED: '', PSRN: '', CLL: '', NLLD: '', PD: '', CD: '' } as Record<string, string>,
}

const componentLabels = [
  ['PSED', 'Personal, social & emotional development'],
  ['PSRN', 'Problem solving, reasoning & numeracy'],
  ['CLL', 'Communication, language & literacy'],
  ['NLLD', 'Nepali language & literacy development'],
  ['PD', 'Physical development'],
  ['CD', 'Creative development'],
] as const

const gradeOptions = [
  ['A+', '4.0'], ['A', '3.6'], ['B+', '3.2'], ['B', '2.8'],
  ['C+', '2.4'], ['C', '2.0'], ['D', '1.6'], ['NG', '-'],
] as const

type SubjectDraft = {
  unitCode: string
  unitName: string
  score: string
  maxScore: string
  fullMarks: string
  passMarks: string
  theoryMarks: string
  practicalMarks: string
  graceMarks: string
  componentMarks: Record<string, string>
  grade: string
  creditUnits: string
  remarks: string
  internalMarks: string
  thGrade: string
  inGrade: string
  gradePoint?: string
}

const emptySubject: SubjectDraft = {
  unitCode: '', unitName: '', score: '', maxScore: '100', fullMarks: '100', passMarks: '32', internalMarks: '',
  theoryMarks: '', practicalMarks: '', graceMarks: '0', thGrade: '', inGrade: '', grade: '', creditUnits: '', remarks: '',
  componentMarks: { PSED: '', PSRN: '', CLL: '', NLLD: '', PD: '', CD: '' },
}

function Field({ label, value, onChange, type = 'text', required = false, wide = false }: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  wide?: boolean
}) {
  return (
    <label className={wide ? 'sm:col-span-2' : ''}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}{required ? ' *' : ''}</span>
      {wide ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={2} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100" />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100" />
      )}
    </label>
  )
}

function draftTotal(subject: SubjectDraft) {
  return Number(subject.theoryMarks || 0) + Number(subject.practicalMarks || 0) + Number(subject.graceMarks || 0) + Object.values(subject.componentMarks).reduce((sum, mark) => sum + Number(mark || 0), 0)
}

function draftGrade(subject: SubjectDraft) {
  const percentage = Number(subject.fullMarks) > 0 ? (draftTotal(subject) / Number(subject.fullMarks)) * 100 : 0
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C+'
  if (percentage >= 40) return 'C'
  if (percentage >= 35) return 'D'
  return 'NG'
}

function higherTotal(subject: SubjectDraft) {
  return Number(subject.theoryMarks || 0) + Number(subject.internalMarks || 0)
}

function higherGradePoint(subject: SubjectDraft) {
  const percentage = Number(subject.fullMarks) > 0 ? (higherTotal(subject) / Number(subject.fullMarks)) * 100 : 0
  if (percentage >= 90) return 4
  if (percentage >= 80) return 3.6
  if (percentage >= 70) return 3.2
  if (percentage >= 60) return 2.8
  if (percentage >= 50) return 2.4
  if (percentage >= 40) return 2
  if (percentage >= 35) return 1.6
  return 0
}

function higherGrade(subject: SubjectDraft) {
  const point = higherGradePoint(subject)
  if (point === 4) return 'A+'
  if (point === 3.6) return 'A'
  if (point === 3.2) return 'B+'
  if (point === 2.8) return 'B'
  if (point === 2.4) return 'C+'
  if (point === 2) return 'C'
  if (point === 1.6) return 'D'
  return 'NG'
}

function gradePointFor(grade: string) {
  return Number(gradeOptions.find(([option]) => option === grade)?.[1] || 0)
}

function LegacyHigherSubjectTable({ subjects, onUpdate, onRemove }: {
  subjects: SubjectDraft[]
  onUpdate: (index: number, field: keyof SubjectDraft, value: string) => void
  onRemove: (index: number) => void
}) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[850px] text-sm"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-3 py-3 text-left">S.N.</th><th className="px-3 py-3 text-left">Subject</th><th className="px-2 py-3">Credit hour</th><th className="px-2 py-3">TH</th><th className="px-2 py-3">IN</th><th className="px-2 py-3">Total</th><th className="px-2 py-3">Grade point</th><th className="px-2 py-3">Grade</th><th className="px-3 py-3">Remarks</th><th></th></tr></thead><tbody className="divide-y divide-slate-100">{subjects.map((subject, index) => <tr key={`${subject.unitName}-${index}`}><td className="px-3 py-2 text-slate-500">{index + 1}</td><td className="px-3 py-2"><input value={subject.unitName} onChange={(event) => onUpdate(index, 'unitName', event.target.value)} placeholder="Mathematics" className="h-9 w-40 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><input type="number" value={subject.creditUnits} onChange={(event) => onUpdate(index, 'creditUnits', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><input type="number" min="0" value={subject.theoryMarks} onChange={(event) => onUpdate(index, 'theoryMarks', event.target.value)} className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><input type="number" min="0" value={subject.internalMarks} onChange={(event) => onUpdate(index, 'internalMarks', event.target.value)} className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2 font-semibold">{higherTotal(subject)}</td><td className="px-2 py-2">{gradePointFor(subject.grade || higherGrade(subject)).toFixed(1)}</td><td className="px-2 py-2"><select value={subject.grade || ''} onChange={(event) => onUpdate(index, 'grade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade]) => <option key={grade} value={grade}>{grade}</option>)}</select></td><td className="px-3 py-2"><input value={subject.remarks} onChange={(event) => onUpdate(index, 'remarks', event.target.value)} placeholder="Very Good" className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-3 py-2"><button type="button" onClick={() => onRemove(index)} className="text-xs font-semibold text-red-600">Remove</button></td></tr>)}</tbody></table></div>
}

function DraftSubjectTable({ subjects, onUpdate, onComponentUpdate, onRemove }: {
  subjects: SubjectDraft[]
  onUpdate: (index: number, field: keyof SubjectDraft, value: string) => void
  onComponentUpdate: (index: number, code: string, value: string) => void
  onRemove: (index: number) => void
}) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[1100px] text-sm"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-3 py-3 text-left">Subject</th><th className="px-2 py-3">Full</th><th className="px-2 py-3">Pass</th>{componentLabels.map(([code]) => <th key={code} className="px-2 py-3">{code}</th>)}<th className="px-2 py-3">Written</th><th className="px-2 py-3">Practical</th><th className="px-2 py-3">Total</th><th className="px-2 py-3">Grade</th><th className="px-3 py-3"> </th></tr></thead><tbody className="divide-y divide-slate-100">{subjects.map((subject, index) => <tr key={`${subject.unitName}-${index}`}><td className="px-3 py-2"><input value={subject.unitName} onChange={(event) => onUpdate(index, 'unitName', event.target.value)} placeholder="Mathematics" className="h-9 w-36 rounded-lg border border-slate-300 px-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></td><td className="px-2 py-2"><input type="number" value={subject.fullMarks} onChange={(event) => onUpdate(index, 'fullMarks', event.target.value)} className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><input type="number" value={subject.passMarks} onChange={(event) => onUpdate(index, 'passMarks', event.target.value)} className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-sm" /></td>{componentLabels.map(([code]) => <td key={code} className="px-2 py-2"><input type="number" min="0" value={subject.componentMarks[code]} onChange={(event) => onComponentUpdate(index, code, event.target.value)} className="h-9 w-14 rounded-lg border border-slate-300 px-2 text-sm" /></td>)}<td className="px-2 py-2"><input type="number" min="0" value={subject.theoryMarks} onChange={(event) => onUpdate(index, 'theoryMarks', event.target.value)} className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><input type="number" min="0" value={subject.practicalMarks} onChange={(event) => onUpdate(index, 'practicalMarks', event.target.value)} className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2 font-semibold text-slate-900">{draftTotal(subject)}</td><td className="px-2 py-2"><Badge tone={draftGrade(subject) === 'NG' ? 'warning' : 'success'}>{draftGrade(subject)}</Badge></td><td className="px-3 py-2"><button type="button" onClick={() => onRemove(index)} className="text-xs font-semibold text-red-600 hover:text-red-800">Remove</button></td></tr>)}</tbody></table></div>
}

function HigherSubjectTable({ subjects, onUpdate, onRemove }: {
  subjects: SubjectDraft[]
  onUpdate: (index: number, field: keyof SubjectDraft, value: string) => void
  onRemove: (index: number) => void
}) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-3 py-3 text-left">S.N.</th><th className="px-3 py-3 text-left">Subject</th><th className="px-2 py-3">Credit hour</th><th className="px-2 py-3">TH grade</th><th className="px-2 py-3">IN grade</th><th className="px-2 py-3">Grade point</th><th className="px-2 py-3">Final grade</th><th className="px-3 py-3">Remarks</th><th></th></tr></thead><tbody className="divide-y divide-slate-100">{subjects.map((subject, index) => <tr key={`${subject.unitName}-${index}`}><td className="px-3 py-2 text-slate-500">{index + 1}</td><td className="px-3 py-2"><input value={subject.unitName} onChange={(event) => onUpdate(index, 'unitName', event.target.value)} placeholder="Mathematics" className="h-9 w-44 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><input type="number" value={subject.creditUnits} onChange={(event) => onUpdate(index, 'creditUnits', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><select value={subject.thGrade} onChange={(event) => onUpdate(index, 'thGrade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade, point]) => <option key={grade} value={grade}>{grade}{point !== '-' ? ` · ${point}` : ''}</option>)}</select></td><td className="px-2 py-2"><select value={subject.inGrade} onChange={(event) => onUpdate(index, 'inGrade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade, point]) => <option key={grade} value={grade}>{grade}{point !== '-' ? ` · ${point}` : ''}</option>)}</select></td><td className="px-2 py-2 font-semibold text-slate-700">{subject.grade ? gradePointFor(subject.grade).toFixed(1) : '—'}</td><td className="px-2 py-2"><select value={subject.grade} onChange={(event) => onUpdate(index, 'grade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade]) => <option key={grade} value={grade}>{grade}</option>)}</select></td><td className="px-3 py-2"><input value={subject.remarks} onChange={(event) => onUpdate(index, 'remarks', event.target.value)} placeholder="Very Good" className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-3 py-2"><button type="button" onClick={() => onRemove(index)} className="text-xs font-semibold text-red-600">Remove</button></td></tr>)}</tbody></table></div>
}

function HigherReportTable({ records }: { records: AcademicRecord[] }) {
  const totalGradePoints = records.reduce((sum, record) => sum + Number(record.grade_point || gradePointFor(record.final_grade || record.grade || 'NG')), 0)
  const averageGpa = records.length ? totalGradePoints / records.length : 0
  return <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3 text-left">S.N.</th><th className="px-3 py-3 text-left">Subject</th><th className="px-3 py-3">Credit hour</th><th className="px-3 py-3">TH grade</th><th className="px-3 py-3">IN grade</th><th className="px-3 py-3">Grade point</th><th className="px-3 py-3">Final grade</th><th className="px-3 py-3 text-left">Remarks</th></tr></thead><tbody className="divide-y divide-slate-100">{records.map((record, index) => <tr key={record.id}><td className="px-3 py-3 text-slate-500">{index + 1}</td><td className="px-3 py-3 font-medium text-slate-900">{record.unit_name}</td><td className="px-3 py-3 text-center">{record.credit_units == null ? '—' : Number(record.credit_units).toFixed(2)}</td><td className="px-3 py-3 text-center"><Badge tone="success">{record.th_grade || '—'}</Badge></td><td className="px-3 py-3 text-center"><Badge tone="success">{record.in_grade || '—'}</Badge></td><td className="px-3 py-3 text-center font-semibold">{Number(record.grade_point || gradePointFor(record.final_grade || record.grade || 'NG')).toFixed(1)}</td><td className="px-3 py-3 text-center"><Badge tone={record.final_grade === 'NG' ? 'danger' : 'success'}>{record.final_grade || record.grade || 'NG'}</Badge></td><td className="px-3 py-3 text-slate-500">{record.remarks || '—'}</td></tr>)}</tbody><tfoot className="border-t-2 border-slate-300 bg-slate-50 font-semibold"><tr><td colSpan={5} className="px-3 py-4">Grade Point Average (GPA)</td><td className="px-3 py-4 text-center">{averageGpa.toFixed(2)}</td><td colSpan={2} className="px-3 py-4">Average grade: {records[0]?.final_grade || records[0]?.grade || '—'}</td></tr></tfoot></table></div>
}

function HigherSubjectTableWithExtraPoint({ subjects, onUpdate, onRemove }: {
  subjects: SubjectDraft[]
  onUpdate: (index: number, field: keyof SubjectDraft, value: string) => void
  onRemove: (index: number) => void
}) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-3 py-3 text-left">S.N.</th><th className="px-3 py-3 text-left">Subject</th><th className="px-2 py-3">Credit hour</th><th className="px-2 py-3">TH grade</th><th className="px-2 py-3">IN grade</th><th className="px-2 py-3">Grade point</th><th className="px-2 py-3">Final grade</th><th className="px-3 py-3">Remarks</th><th></th></tr></thead><tbody className="divide-y divide-slate-100">{subjects.map((subject, index) => <tr key={`${subject.unitName}-${index}`}><td className="px-3 py-2 text-slate-500">{index + 1}</td><td className="px-3 py-2"><input value={subject.unitName} onChange={(event) => onUpdate(index, 'unitName', event.target.value)} placeholder="Mathematics" className="h-9 w-44 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><input type="number" value={subject.creditUnits} onChange={(event) => onUpdate(index, 'creditUnits', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><select value={subject.thGrade} onChange={(event) => onUpdate(index, 'thGrade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade, point]) => <option key={grade} value={grade}>{grade}{point !== '-' ? ` · ${point}` : ''}</option>)}</select></td><td className="px-2 py-2"><select value={subject.inGrade} onChange={(event) => onUpdate(index, 'inGrade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade, point]) => <option key={grade} value={grade}>{grade}{point !== '-' ? ` · ${point}` : ''}</option>)}</select></td><td className="px-2 py-2"><select value={subject.gradePoint ? String(gradePointFor(subject.grade)) : ''} onChange={(event) => onUpdate(index, 'grade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade, point]) => <option key={grade} value={grade}>{point}</option>)}</select></td><td className="px-2 py-2"><select value={subject.grade} onChange={(event) => onUpdate(index, 'grade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade]) => <option key={grade} value={grade}>{grade}</option>)}</select></td><td className="px-3 py-2"><input value={subject.remarks} onChange={(event) => onUpdate(index, 'remarks', event.target.value)} placeholder="Very Good" className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-3 py-2"><button type="button" onClick={() => onRemove(index)} className="text-xs font-semibold text-red-600">Remove</button></td></tr>)}</tbody></table></div>
}

function HigherSubjectMarksTable({ subjects, onUpdate, onRemove }: {
  subjects: SubjectDraft[]
  onUpdate: (index: number, field: keyof SubjectDraft, value: string) => void
  onRemove: (index: number) => void
}) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[1020px] text-sm"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-3 py-3 text-left">S.N.</th><th className="px-3 py-3 text-left">Subject</th><th className="px-2 py-3">Credit hour</th><th className="px-2 py-3">TH marks</th><th className="px-2 py-3">TH grade</th><th className="px-2 py-3">IN marks</th><th className="px-2 py-3">IN grade</th><th className="px-2 py-3">Total</th><th className="px-2 py-3">Final grade</th><th className="px-3 py-3">Remarks</th><th></th></tr></thead><tbody className="divide-y divide-slate-100">{subjects.map((subject, index) => <tr key={`${subject.unitName}-${index}`}><td className="px-3 py-2 text-slate-500">{index + 1}</td><td className="px-3 py-2"><input value={subject.unitName} onChange={(event) => onUpdate(index, 'unitName', event.target.value)} placeholder="Mathematics" className="h-9 w-40 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><input type="number" value={subject.creditUnits} onChange={(event) => onUpdate(index, 'creditUnits', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><input type="number" min="0" value={subject.theoryMarks} onChange={(event) => onUpdate(index, 'theoryMarks', event.target.value)} className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><select value={subject.thGrade} onChange={(event) => onUpdate(index, 'thGrade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade, point]) => <option key={grade} value={grade}>{grade} {point !== '-' ? `· ${point}` : ''}</option>)}</select></td><td className="px-2 py-2"><input type="number" min="0" value={subject.internalMarks} onChange={(event) => onUpdate(index, 'internalMarks', event.target.value)} className="h-9 w-16 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-2 py-2"><select value={subject.inGrade} onChange={(event) => onUpdate(index, 'inGrade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade, point]) => <option key={grade} value={grade}>{grade} {point !== '-' ? `· ${point}` : ''}</option>)}</select></td><td className="px-2 py-2 font-semibold">{higherTotal(subject)}</td><td className="px-2 py-2"><select value={subject.grade} onChange={(event) => onUpdate(index, 'grade', event.target.value)} className="h-9 w-20 rounded-lg border border-slate-300 bg-white px-2 text-sm"><option value="">Select</option>{gradeOptions.map(([grade]) => <option key={grade} value={grade}>{grade}</option>)}</select></td><td className="px-3 py-2"><input value={subject.remarks} onChange={(event) => onUpdate(index, 'remarks', event.target.value)} placeholder="Very Good" className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-sm" /></td><td className="px-3 py-2"><button type="button" onClick={() => onRemove(index)} className="text-xs font-semibold text-red-600">Remove</button></td></tr>)}</tbody></table></div>
}

export default function AcademicPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [records, setRecords] = useState<AcademicRecord[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftSubjects, setDraftSubjects] = useState<SubjectDraft[]>([])
  const [reportStudentId, setReportStudentId] = useState('')
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    const [studentData, recordData] = await Promise.all([apiGet('/api/students'), apiGet('/api/academic-records')])
    setStudents(studentData)
    setRecords(recordData)
    setLoading(false)
  }

  useEffect(() => {
    Promise.all([apiGet('/api/students'), apiGet('/api/academic-records')]).then(([studentData, recordData]) => {
      setStudents(studentData)
      setRecords(recordData)
      setLoading(false)
    }).catch(() => {
      setError('Unable to load academic records. Run the academic migration first.')
      setLoading(false)
    })
  }, [])

  function updateField(name: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function updateComponent(code: string, value: string) {
    setForm((current) => ({ ...current, componentMarks: { ...current.componentMarks, [code]: value } }))
  }

  function totalFor(subject: { theoryMarks: string; practicalMarks: string; graceMarks: string; componentMarks: Record<string, string> }) {
    return Number(subject.theoryMarks || 0) + Number(subject.practicalMarks || 0) + Number(subject.graceMarks || 0) + Object.values(subject.componentMarks).reduce((sum, mark) => sum + Number(mark || 0), 0)
  }

  function gradeFromMarks(total: number, fullMarks: number) {
    const percentage = fullMarks > 0 ? (total / fullMarks) * 100 : 0
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B+'
    if (percentage >= 60) return 'B'
    if (percentage >= 50) return 'C+'
    if (percentage >= 40) return 'C'
    if (percentage >= 35) return 'D'
    return 'NG'
  }

  function editRecord(record: AcademicRecord) {
    setEditingId(record.id)
    setDraftSubjects([])
    setForm({
      studentId: String(record.student_id), academicYear: record.academic_year, term: record.term,
      examName: record.exam_name, examType: record.exam_type, resultFormat: record.result_format || 'early_years',
      className: record.class_name || '', section: record.section || '', rollNumber: record.roll_number || '',
      workingDays: record.working_days == null ? '' : String(record.working_days), presentDays: record.present_days == null ? '' : String(record.present_days), absentDays: record.absent_days == null ? '' : String(record.absent_days), unitCode: record.unit_code || '',
      unitName: record.unit_name, score: record.score === null ? '' : String(record.score),
      maxScore: String(record.max_score), fullMarks: String(record.full_marks ?? record.max_score),
      passMarks: String(record.pass_marks ?? 0), theoryMarks: record.theory_marks === null ? '' : String(record.theory_marks),
      practicalMarks: String(record.practical_marks ?? 0), graceMarks: String(record.grace_marks ?? 0), grade: record.grade || '',
      internalMarks: String(record.internal_marks ?? 0),
      thGrade: record.th_grade || '', inGrade: record.in_grade || '',
      componentMarks: Object.fromEntries(componentLabels.map(([code]) => [code, record.component_marks?.[code] == null ? '' : String(record.component_marks[code])])),
      creditUnits: record.credit_units === null ? '' : String(record.credit_units), remarks: record.remarks || '',
    })
    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setDraftSubjects([])
  }

  function addSubject() {
    if (!form.unitName.trim()) {
      setError('Enter a subject name before adding it.')
      return
    }
    if (!form.theoryMarks.trim()) {
      setError('Enter the marks before adding this subject.')
      return
    }
    const total = totalFor(form)
    setDraftSubjects((current) => [...current, {
      unitCode: form.unitCode, unitName: form.unitName, score: String(total),
      maxScore: form.maxScore, fullMarks: form.fullMarks, passMarks: form.passMarks,
      theoryMarks: form.theoryMarks, practicalMarks: form.practicalMarks, graceMarks: form.graceMarks,
      componentMarks: form.componentMarks,
      internalMarks: form.internalMarks,
      thGrade: form.thGrade,
      inGrade: form.inGrade,
      grade: form.resultFormat === 'higher_class' ? (form.grade || higherGrade({ ...emptySubject, theoryMarks: form.theoryMarks, internalMarks: form.internalMarks, fullMarks: form.fullMarks, componentMarks: form.componentMarks })) : gradeFromMarks(total, Number(form.fullMarks)), creditUnits: form.creditUnits, remarks: form.remarks,
    }])
    setForm((current) => ({ ...current, ...emptySubject }))
    setError('')
  }

  function removeSubject(index: number) {
    setDraftSubjects((current) => current.filter((_, subjectIndex) => subjectIndex !== index))
  }

  function editDraftSubject(index: number) {
    const subject = draftSubjects[index]
    if (!subject) return
    setForm((current) => ({ ...current, ...subject }))
    setDraftSubjects((current) => current.filter((_, subjectIndex) => subjectIndex !== index))
    setError('')
  }

  function addBlankSubject() {
    setDraftSubjects((current) => [...current, { ...emptySubject, componentMarks: { ...emptySubject.componentMarks } }])
    setError('')
  }

  function updateDraftSubject(index: number, field: keyof SubjectDraft, value: string) {
    setDraftSubjects((current) => current.map((subject, subjectIndex) => subjectIndex === index ? { ...subject, [field]: value } : subject))
  }

  function updateDraftComponent(index: number, code: string, value: string) {
    setDraftSubjects((current) => current.map((subject, subjectIndex) => subjectIndex === index ? { ...subject, componentMarks: { ...subject.componentMarks, [code]: value } } : subject))
  }

  function gradeFor(record: AcademicRecord) {
    if (record.final_grade) return record.final_grade
    if (record.grade) return record.grade
    if (record.score === null) return 'Pending'
    const percentage = (Number(record.score) / Number(record.max_score)) * 100
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    if (percentage >= 40) return 'E'
    return 'F'
  }

  function recordGradePoint(record: AcademicRecord) {
    if (record.grade_point !== null && record.grade_point !== undefined) return Number(record.grade_point)
    return gradePointFor(gradeFor(record))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        studentId: Number(form.studentId),
        academicYear: form.academicYear,
        term: form.term,
        examName: form.examName,
        examType: form.examType,
        className: form.className || undefined,
        section: form.section || undefined,
        rollNumber: form.rollNumber || undefined,
        resultFormat: form.resultFormat,
        workingDays: form.workingDays === '' ? undefined : Number(form.workingDays),
        presentDays: form.presentDays === '' ? undefined : Number(form.presentDays),
        absentDays: form.absentDays === '' ? undefined : Number(form.absentDays),
        unitCode: form.unitCode || undefined,
        unitName: form.unitName,
        score: totalFor(form),
        maxScore: Number(form.maxScore),
        fullMarks: Number(form.fullMarks),
        passMarks: Number(form.passMarks),
        theoryMarks: form.theoryMarks === '' ? undefined : Number(form.theoryMarks),
        practicalMarks: form.practicalMarks === '' ? undefined : Number(form.practicalMarks),
        graceMarks: Number(form.graceMarks),
        internalMarks: form.internalMarks === '' ? undefined : Number(form.internalMarks),
        gradePoint: form.resultFormat === 'higher_class' ? gradePointFor(form.grade || higherGrade({ ...emptySubject, theoryMarks: form.theoryMarks, internalMarks: form.internalMarks, fullMarks: form.fullMarks, componentMarks: form.componentMarks })) : undefined,
        finalGrade: form.resultFormat === 'higher_class' ? (form.grade || higherGrade({ ...emptySubject, theoryMarks: form.theoryMarks, internalMarks: form.internalMarks, fullMarks: form.fullMarks, componentMarks: form.componentMarks })) : undefined,
        componentMarks: Object.fromEntries(Object.entries(form.componentMarks).filter(([, mark]) => mark !== '').map(([code, mark]) => [code, Number(mark)])),
        grade: form.resultFormat === 'higher_class' ? (form.grade || higherGrade({ ...emptySubject, theoryMarks: form.theoryMarks, internalMarks: form.internalMarks, fullMarks: form.fullMarks, componentMarks: form.componentMarks })) : gradeFromMarks(totalFor(form), Number(form.fullMarks)),
        creditUnits: form.creditUnits === '' ? undefined : Number(form.creditUnits),
        remarks: form.remarks || undefined,
      }
      if (editingId === null) {
        if (!form.unitName.trim() && draftSubjects.length === 0) {
          setError('Add at least one subject before saving.')
          setSaving(false)
          return
        }
        const subjects = draftSubjects.length > 0 ? draftSubjects : form.unitName.trim() ? [{
          unitCode: form.unitCode, unitName: form.unitName, score: String(totalFor(form)),
          maxScore: form.maxScore, fullMarks: form.fullMarks, passMarks: form.passMarks,
          theoryMarks: form.theoryMarks, practicalMarks: form.practicalMarks, graceMarks: form.graceMarks,
          componentMarks: form.componentMarks,
          internalMarks: form.internalMarks,
          thGrade: form.thGrade,
          inGrade: form.inGrade,
          grade: form.resultFormat === 'higher_class' ? (form.grade || higherGrade({ ...emptySubject, theoryMarks: form.theoryMarks, internalMarks: form.internalMarks, fullMarks: form.fullMarks, componentMarks: form.componentMarks })) : gradeFromMarks(totalFor(form), Number(form.fullMarks)), creditUnits: form.creditUnits, remarks: form.remarks,
        }] : []
        if (subjects.length === 0) {
          setError('Add at least one subject before saving.')
          setSaving(false)
          return
        }
        if (subjects.some((subject) => !subject.unitName.trim() || (form.resultFormat === 'higher_class' ? !subject.thGrade.trim() || !subject.inGrade.trim() || !subject.grade.trim() : draftTotal(subject) <= 0))) {
          setError(form.resultFormat === 'higher_class' ? 'Every subject must have a TH grade, IN grade, and final grade.' : 'Every examination subject must have marks.')
          setSaving(false)
          return
        }
        await Promise.all(subjects.map((subject) => apiPost('/api/academic-records', {
          ...payload, ...subject, unitCode: subject.unitCode || undefined,
          score: draftTotal(subject),
          maxScore: Number(subject.maxScore), fullMarks: Number(subject.fullMarks), passMarks: Number(subject.passMarks),
          theoryMarks: subject.theoryMarks === '' ? undefined : Number(subject.theoryMarks),
          practicalMarks: subject.practicalMarks === '' ? undefined : Number(subject.practicalMarks),
          graceMarks: Number(subject.graceMarks), grade: form.resultFormat === 'higher_class' ? (subject.grade || higherGrade(subject)) : gradeFromMarks(draftTotal(subject), Number(subject.fullMarks)),
          internalMarks: subject.internalMarks === '' ? undefined : Number(subject.internalMarks),
          gradePoint: form.resultFormat === 'higher_class' ? gradePointFor(subject.grade || higherGrade(subject)) : undefined,
          finalGrade: form.resultFormat === 'higher_class' ? (subject.grade || higherGrade(subject)) : undefined,
          componentMarks: Object.fromEntries(Object.entries(subject.componentMarks).filter(([, mark]) => mark !== '').map(([code, mark]) => [code, Number(mark)])),
          thGrade: subject.thGrade || undefined,
          inGrade: subject.inGrade || undefined,
          creditUnits: subject.creditUnits === '' ? undefined : Number(subject.creditUnits), remarks: subject.remarks || undefined,
        })))
        setDraftSubjects([])
        setForm((current) => ({ ...current, ...emptySubject }))
      } else {
        await apiPut(`/api/academic-records/${editingId}`, payload)
        closeForm()
      }
      await loadData()
    } catch {
      setError('Unable to save the record. Check the score and required fields.')
    } finally {
      setSaving(false)
    }
  }

  async function removeRecord(id: number) {
    if (!window.confirm('Delete this academic record?')) return
    try {
      await apiDelete(`/api/academic-records/${id}`)
      setRecords((current) => current.filter((record) => record.id !== id))
    } catch {
      setError('Unable to delete this academic record.')
    }
  }

  const scoredRecords = records.filter((record) => record.score !== null)
  const average = scoredRecords.length
    ? scoredRecords.reduce((total, record) => total + (Number(record.score) / Number(record.max_score)) * 100, 0) / scoredRecords.length
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><GraduationCap className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-700">Student progress</p>
            <h1 className="text-2xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-3xl">Academic Records</h1>
          </div>
        </div>
        <Button type="button" onClick={() => { if (showForm) closeForm(); else { setForm(emptyForm); setDraftSubjects([{ ...emptySubject, componentMarks: { ...emptySubject.componentMarks } }]); setShowForm(true) } }}>{showForm ? 'Close form' : 'Add academic record'}</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Total records</p><p className="mt-1 text-2xl font-semibold text-slate-900">{records.length}</p><p className="mt-1 text-xs text-blue-800/70">Exams and unit results</p></div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Students covered</p><p className="mt-1 text-2xl font-semibold text-slate-900">{new Set(records.map((record) => record.student_id)).size}</p><p className="mt-1 text-xs text-emerald-800/70">With an academic entry</p></div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Average score</p><p className="mt-1 text-2xl font-semibold text-slate-900">{average ? `${average.toFixed(1)}%` : '—'}</p><p className="mt-1 text-xs text-amber-800/70">Across scored records</p></div>
      </div>

      {error ? <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}

      <Card>
        <CardHeader title="Student report card" action={<span className="text-xs text-slate-500">Subject results and performance summary</span>} />
        <div className="p-5 sm:p-6">
          <label className="block max-w-xl"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Select student</span><select value={reportStudentId} onChange={(event) => setReportStudentId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"><option value="">Choose a student to view results</option>{students.map((student) => <option key={student.id} value={student.id}>{student.full_name}{student.student_number ? ` · ${student.student_number}` : ''}</option>)}</select></label>
          {reportStudentId ? (() => {
            const reportRecords = records.filter((record) => record.student_id === Number(reportStudentId))
            const scored = reportRecords.filter((record) => record.score !== null)
            const higherClassRecords = reportRecords.filter((record) => record.result_format === 'higher_class')
            const total = scored.reduce((sum, record) => sum + Number(record.score), 0)
            const totalGradePoints = higherClassRecords.reduce((sum, record) => sum + recordGradePoint(record), 0)
            const averagePercentage = higherClassRecords.length ? higherClassRecords.reduce((sum, record) => sum + recordGradePoint(record), 0) / higherClassRecords.length : scored.length ? scored.reduce((sum, record) => sum + (Number(record.score) / Number(record.max_score)) * 100, 0) / scored.length : 0
            const reportStatus = higherClassRecords.length ? higherClassRecords.every((record) => gradeFor(record) !== 'NG') ? 'Pass' : 'Review' : scored.length && scored.every((record) => gradeFor(record) !== 'F') ? 'Pass' : scored.length ? 'Review' : 'Pending'
            return <div className="mt-6 space-y-5">
              <div className="grid gap-3 sm:grid-cols-4"><div className="rounded-xl bg-blue-50 p-4"><p className="text-xs uppercase tracking-wide text-blue-700">Subjects</p><p className="mt-1 text-2xl font-semibold text-slate-900">{reportRecords.length}</p></div><div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs uppercase tracking-wide text-emerald-700">{higherClassRecords.length ? 'Grade points' : 'Total marks'}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{higherClassRecords.length ? totalGradePoints.toFixed(2) : total || '—'}</p></div><div className="rounded-xl bg-amber-50 p-4"><p className="text-xs uppercase tracking-wide text-amber-700">{higherClassRecords.length ? 'Average GPA' : 'Average'}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{higherClassRecords.length ? (averagePercentage ? averagePercentage.toFixed(2) : '—') : averagePercentage ? `${averagePercentage.toFixed(1)}%` : '—'}</p></div><div className="rounded-xl bg-slate-100 p-4"><p className="text-xs uppercase tracking-wide text-slate-600">Status</p><p className="mt-1 text-2xl font-semibold text-slate-900">{reportStatus}</p></div></div>
              {reportRecords.length === 0 ? <p className="text-sm text-slate-500">No subject results recorded for this student.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3 text-left font-medium">Subject</th><th className="px-3 py-3 text-left font-medium">Examination</th><th className="px-3 py-3 text-left font-medium">Score</th><th className="px-3 py-3 text-left font-medium">Grade</th><th className="px-3 py-3 text-left font-medium">Remarks</th></tr></thead><tbody className="divide-y divide-slate-100">{reportRecords.map((record) => <tr key={record.id}><td className="px-3 py-3 font-medium text-slate-900">{record.unit_name}</td><td className="px-3 py-3 text-slate-600">{record.exam_name}<span className="ml-2 text-xs text-slate-400">{record.term}</span></td><td className="px-3 py-3 text-slate-700">{record.score === null ? 'Pending' : `${Number(record.score)} / ${Number(record.max_score)}`}</td><td className="px-3 py-3"><Badge tone={gradeFor(record) === 'F' ? 'danger' : gradeFor(record) === 'Pending' ? 'warning' : 'success'}>{gradeFor(record)}</Badge></td><td className="max-w-[220px] truncate px-3 py-3 text-slate-500">{record.remarks || '—'}</td></tr>)}</tbody></table></div>}
            </div>
          })() : <p className="mt-4 text-sm text-slate-500">Select a student to view their subject-by-subject result summary.</p>}
        </div>
      </Card>

      {reportStudentId ? <Card>
        <CardHeader title="Examination mark sheet" action={<span className="text-xs text-slate-500">Full marks, pass marks, obtained marks, and result</span>} />
        {(() => {
          const selectedStudent = students.find((student) => student.id === Number(reportStudentId))
          const markRecords = records.filter((record) => record.student_id === Number(reportStudentId))
          const grandTotal = markRecords.reduce((sum, record) => sum + Number(record.score || 0), 0)
          const grandFullMarks = markRecords.reduce((sum, record) => sum + Number(record.full_marks ?? record.max_score), 0)
          const percentage = grandFullMarks ? (grandTotal / grandFullMarks) * 100 : 0
          const passed = markRecords.length > 0 && markRecords.every((record) => Number(record.score || 0) + Number(record.grace_marks || 0) >= Number(record.pass_marks || 0))
          const division = !passed ? 'FAIL' : percentage >= 80 ? 'FIRST DIVISION WITH DISTINCTION' : percentage >= 60 ? 'FIRST DIVISION' : percentage >= 45 ? 'SECOND DIVISION' : percentage >= 32 ? 'THIRD DIVISION' : 'FAIL'
          if (markRecords.some((record) => record.result_format === 'higher_class')) return <div className="p-5 sm:p-6"><div className="mb-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-3"><p><span className="font-semibold text-slate-900">Student:</span> {selectedStudent?.full_name}</p><p><span className="font-semibold text-slate-900">Class:</span> {markRecords[0]?.class_name || '—'} {markRecords[0]?.section ? `· Section ${markRecords[0].section}` : ''}</p><p><span className="font-semibold text-slate-900">Roll number:</span> {markRecords[0]?.roll_number || '—'}</p></div><HigherReportTable records={markRecords} /></div>
          return <div className="p-5 sm:p-6"><div className="mb-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-3"><p><span className="font-semibold text-slate-900">Student:</span> {selectedStudent?.full_name}</p><p><span className="font-semibold text-slate-900">Student number:</span> {selectedStudent?.student_number || '—'}</p><p><span className="font-semibold text-slate-900">Institution:</span> {selectedStudent?.institution || '—'}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3 text-left font-medium">No.</th><th className="px-3 py-3 text-left font-medium">Subject</th><th className="px-3 py-3 text-left font-medium">Full marks</th><th className="px-3 py-3 text-left font-medium">Pass marks</th><th className="px-3 py-3 text-left font-medium">Theory</th><th className="px-3 py-3 text-left font-medium">Practical</th><th className="px-3 py-3 text-left font-medium">Grace</th><th className="px-3 py-3 text-left font-medium">Total</th><th className="px-3 py-3 text-left font-medium">Grade</th><th className="px-3 py-3 text-left font-medium">Remarks</th></tr></thead><tbody className="divide-y divide-slate-100">{markRecords.map((record, index) => <tr key={record.id}><td className="px-3 py-3 text-slate-500">{String(index + 1).padStart(2, '0')}</td><td className="px-3 py-3 font-medium text-slate-900">{record.unit_code ? `${record.unit_code} ` : ''}{record.unit_name}</td><td className="px-3 py-3">{Number(record.full_marks ?? record.max_score)}</td><td className="px-3 py-3">{Number(record.pass_marks || 0)}</td><td className="px-3 py-3">{Number(record.theory_marks ?? record.score ?? 0)}</td><td className="px-3 py-3">{Number(record.practical_marks || 0)}</td><td className="px-3 py-3">{Number(record.grace_marks || 0)}</td><td className="px-3 py-3 font-semibold">{Number(record.score || 0)}</td><td className="px-3 py-3"><Badge tone={gradeFor(record) === 'F' ? 'danger' : 'success'}>{gradeFor(record)}</Badge></td><td className="max-w-[180px] truncate px-3 py-3 text-slate-500">{record.remarks || '—'}</td></tr>)}</tbody><tfoot className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900"><tr><td colSpan={2} className="px-3 py-4">Grand total / result</td><td className="px-3 py-4">{grandFullMarks}</td><td></td><td colSpan={3}></td><td className="px-3 py-4">{grandTotal}</td><td colSpan={2} className="px-3 py-4">{percentage.toFixed(2)}% · {division}</td></tr></tfoot></table></div></div>
        })()}
      </Card> : null}

      {showForm ? <Card>
        <CardHeader title={editingId === null ? 'Record examination results' : 'Edit subject result'} action={<span className="text-xs text-slate-500">{editingId === null ? 'Add all subjects for one examination together' : 'Update the subject, grade, or result'}</span>} />
        {editingId === null && records.length > 0 ? <div className="border-b border-slate-100 px-5 pt-5 sm:px-6"><label className="block max-w-xl"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Edit a saved subject</span><select defaultValue="" onChange={(event) => { const record = records.find((item) => item.id === Number(event.target.value)); if (record) editRecord(record) }} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"><option value="">Choose a student and subject</option>{records.map((record) => <option key={record.id} value={record.id}>{record.full_name} · {record.unit_name} · {record.score ?? 'No mark'} marks</option>)}</select></label></div> : null}
        {editingId === null && draftSubjects.length > 0 ? <div className="border-b border-slate-100 px-5 pt-5 sm:px-6"><label className="block max-w-xl"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Edit a subject already added</span><select defaultValue="" onChange={(event) => { const index = Number(event.target.value); if (!Number.isNaN(index)) editDraftSubject(index) }} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"><option value="">Choose a subject to edit</option>{draftSubjects.map((subject, index) => <option key={`${subject.unitName}-${index}`} value={index}>{subject.unitName} · {subject.score} marks</option>)}</select></label></div> : null}
        <form onSubmit={handleSubmit} className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Student *</span><select value={form.studentId} onChange={(event) => updateField('studentId', event.target.value)} required className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"><option value="">Select student</option>{students.map((student) => <option key={student.id} value={student.id}>{student.full_name}{student.student_number ? ` · ${student.student_number}` : ''}</option>)}</select></label>
          <Field label="Academic year" value={form.academicYear} onChange={(value) => updateField('academicYear', value)} required />
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Term / semester *</span><select value={form.term} onChange={(event) => updateField('term', event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"><option>Semester 1</option><option>Semester 2</option><option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Year end</option></select></label>
          <Field label="Examination name" value={form.examName} onChange={(value) => updateField('examName', value)} required />
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Result type *</span><select value={form.examType} onChange={(event) => updateField('examType', event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"><option value="terminal_examination">Terminal examination</option><option value="mid_term_examination">Mid-term examination</option><option value="annual_examination">Annual examination</option><option value="unit_test">Unit test</option><option value="continuous_assessment">Continuous assessment</option><option value="practical_examination">Practical examination</option><option value="examination">Legacy examination</option><option value="other">Other</option></select></label>
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Result format *</span><select value={form.resultFormat} onChange={(event) => updateField('resultFormat', event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"><option value="early_years">UKG / early years marks</option><option value="higher_class">Class 2+ GPA result</option></select></label>
          <Field label="Class" value={form.className} onChange={(value) => updateField('className', value)} required />
          <Field label="Section" value={form.section} onChange={(value) => updateField('section', value)} />
          <Field label="Roll number" value={form.rollNumber} onChange={(value) => updateField('rollNumber', value)} />
          {form.resultFormat === 'higher_class' ? <><Field label="Working days" value={form.workingDays} onChange={(value) => updateField('workingDays', value)} type="number" /><Field label="Present days" value={form.presentDays} onChange={(value) => updateField('presentDays', value)} type="number" /><Field label="Absent days" value={form.absentDays} onChange={(value) => updateField('absentDays', value)} type="number" /></> : null}
          {editingId === null && draftSubjects.length > 0 ? <div className="space-y-3 sm:col-span-2 lg:col-span-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">Subjects in this examination</p><p className="text-xs text-slate-500">Edit subject names and enter marks directly in each row.</p></div><Button type="button" variant="secondary" onClick={addBlankSubject}>Add subject row</Button></div>{form.resultFormat === 'higher_class' ? <><div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-800">Grading scale</p><div className="grid grid-cols-2 gap-2 text-xs text-slate-700 sm:grid-cols-4 lg:grid-cols-8"><span><strong>90-100</strong><br />A+ · 4.0</span><span><strong>80-89</strong><br />A · 3.6</span><span><strong>70-79</strong><br />B+ · 3.2</span><span><strong>60-69</strong><br />B · 2.8</span><span><strong>50-59</strong><br />C+ · 2.4</span><span><strong>40-49</strong><br />C · 2.0</span><span><strong>35-39</strong><br />D · 1.6</span><span><strong>Below 35</strong><br />NG</span></div></div><HigherSubjectTable subjects={draftSubjects} onUpdate={updateDraftSubject} onRemove={removeSubject} /></> : <DraftSubjectTable subjects={draftSubjects} onUpdate={updateDraftSubject} onComponentUpdate={updateDraftComponent} onRemove={removeSubject} />}</div> : null}
          {editingId !== null ? <>
          <Field label="Subject name" value={form.unitName} onChange={(value) => updateField('unitName', value)} required />
          <Field label="Full marks" value={form.fullMarks} onChange={(value) => { updateField('fullMarks', value); updateField('maxScore', value) }} type="number" required />
          <Field label="Pass marks" value={form.passMarks} onChange={(value) => updateField('passMarks', value)} type="number" required />
          <Field label="Theory (TH)" value={form.theoryMarks} onChange={(value) => updateField('theoryMarks', value)} type="number" required={editingId !== null || draftSubjects.length === 0} />
          {editingId !== null && form.resultFormat === 'higher_class' ? <Field label="Internal (IN)" value={form.internalMarks} onChange={(value) => updateField('internalMarks', value)} type="number" /> : null}
          <Field label="Practical (PR)" value={form.practicalMarks} onChange={(value) => updateField('practicalMarks', value)} type="number" />
          <Field label="Grace marks" value={form.graceMarks} onChange={(value) => updateField('graceMarks', value)} type="number" />
          <div className="grid gap-3 sm:col-span-2 lg:col-span-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Assessment / unit marks</p><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{componentLabels.map(([code, description]) => <label key={code} title={description}><span className="mb-1 block text-[11px] font-semibold text-slate-500">{code}</span><input type="number" min="0" value={form.componentMarks[code]} onChange={(event) => updateComponent(code, event.target.value)} placeholder="0" className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100" /></label>)}</div></div></div>
          {editingId !== null && form.resultFormat === 'higher_class' ? <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Grade</span><select value={form.grade} onChange={(event) => updateField('grade', event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="">Select grade</option>{gradeOptions.map(([grade, point]) => <option key={grade} value={grade}>{grade} {point !== '-' ? `· ${point}` : ''}</option>)}</select></label> : <div className="flex h-11 items-center rounded-xl border border-blue-100 bg-blue-50 px-3 text-sm text-blue-800">Automatic grade: <strong className="ml-1">{gradeFromMarks(totalFor(form), Number(form.fullMarks))}</strong></div>}
          <Field label="Credit units" value={form.creditUnits} onChange={(value) => updateField('creditUnits', value)} type="number" />
          <Field label="Remarks" value={form.remarks} onChange={(value) => updateField('remarks', value)} wide />
          </> : null}
          {false ? <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4"><Button type="button" variant="secondary" onClick={addSubject}>Add subject to examination</Button><span className="text-xs text-slate-500">Enter the subject and marks; the grade is calculated automatically.</span></div> : null}
          {editingId === null && draftSubjects.length > 0 ? <div className="space-y-2 sm:col-span-2 lg:col-span-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subjects in this examination ({draftSubjects.length})</p>{draftSubjects.map((subject, index) => <div key={`${subject.unitName}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><div className="min-w-0"><p className="font-medium text-slate-900">{subject.unitName}</p><p className="text-xs text-slate-500">{subject.score ? `${subject.score} / ${subject.maxScore}` : 'No mark'}{subject.grade ? ` · Grade ${subject.grade}` : ' · No grade'}</p></div><button type="button" onClick={() => removeSubject(index)} className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-800">Remove</button></div>)}</div> : null}
          <div className="flex gap-3 sm:col-span-2 lg:col-span-4"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId === null ? `Save examination (${draftSubjects.length || 1} subject${draftSubjects.length === 1 ? '' : 's'})` : 'Update subject'}</Button>{editingId !== null ? <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button> : null}</div>
        </form>
      </Card> : null}

      <Card>
        <CardHeader title="All academic records" action={<span className="text-xs text-slate-500">{records.length} entries</span>} />
        {loading ? <p className="p-6 text-sm text-slate-500">Loading...</p> : records.length === 0 ? <div className="flex flex-col items-center gap-2 px-6 py-14 text-center"><BookOpen className="h-8 w-8 text-slate-300" /><p className="text-sm text-slate-500">No academic records yet.</p><p className="text-xs text-slate-400">Add an examination or unit result to start a student history.</p></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3 text-left font-medium">Student</th><th className="px-5 py-3 text-left font-medium">Period</th><th className="px-5 py-3 text-left font-medium">Examination</th><th className="px-5 py-3 text-left font-medium">Unit</th><th className="px-5 py-3 text-left font-medium">Result</th><th className="px-5 py-3 text-left font-medium">Credits</th><th className="px-5 py-3 text-right font-medium">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{records.map((record) => { const percentage = record.score === null ? null : (Number(record.score) / Number(record.max_score)) * 100; return <tr key={record.id}><td className="px-5 py-3"><p className="font-medium text-slate-900">{record.full_name}</p><p className="text-xs text-slate-500">{record.student_number || 'No student number'}</p></td><td className="px-5 py-3"><p className="text-slate-700">{record.academic_year}</p><p className="text-xs text-slate-500">{record.term}</p></td><td className="px-5 py-3"><p className="text-slate-900">{record.exam_name}</p><Badge tone="neutral">{record.exam_type.replaceAll('_', ' ')}</Badge></td><td className="px-5 py-3"><p className="font-medium text-slate-800">{record.unit_name}</p><p className="text-xs text-slate-500">{record.unit_code || 'No code'}</p></td><td className="px-5 py-3">{percentage === null ? <span className="text-slate-400">Not graded</span> : <div className="flex items-center gap-2"><span className="font-medium text-slate-800">{Number(record.score)} / {Number(record.max_score)}</span><Badge tone={percentage >= 50 ? 'success' : 'danger'}>{record.grade || `${percentage.toFixed(1)}%`}</Badge></div>}</td><td className="px-5 py-3 text-slate-600">{record.credit_units === null ? '—' : Number(record.credit_units)}</td><td className="px-5 py-3 text-right"><button type="button" onClick={() => removeRecord(record.id)} className="text-xs font-semibold text-red-600 hover:text-red-800">Delete</button></td></tr>})}</tbody></table></div>
        )}
      </Card>

      <div className="flex items-center gap-2 text-xs text-slate-500"><ClipboardList className="h-4 w-4 text-blue-600" /><span>Keep examination names, unit codes, grades, and remarks consistent for reliable student histories.</span><Award className="ml-auto h-4 w-4 text-amber-500" /></div>
    </div>
  )
}