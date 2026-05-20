import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Badge from '../../components/common/Badge'
import StatCard from '../../components/common/StatCard'
import { formatDate, initials, statusColor } from '../../utils/formatters'
import { CalendarDaysIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { resources } from '../../services/api'

const DEMO_ATTENDANCE = [
  { id: 1, employee: 'Muhammad Bilal', date: '2026-05-20', check_in: '08:05', check_out: '17:10', status: 'present', hours: 9.1 },
  { id: 2, employee: 'Fatima Zahra', date: '2026-05-20', check_in: '09:00', check_out: '18:00', status: 'present', hours: 9.0 },
  { id: 3, employee: 'Ahmed Raza', date: '2026-05-20', check_in: null, check_out: null, status: 'absent', hours: 0 },
  { id: 4, employee: 'Sara Khan', date: '2026-05-20', check_in: '10:30', check_out: '15:00', status: 'half_day', hours: 4.5 },
  { id: 5, employee: 'Usman Tariq', date: '2026-05-20', check_in: '08:00', check_out: '17:00', status: 'present', hours: 9.0 },
]

export default function Attendance() {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', filterDate],
    queryFn: () => resources.attendance.list({ date: filterDate }).then((r) => r.data),
    placeholderData: { data: DEMO_ATTENDANCE },
  })

  const rows = data?.data?.length ? data.data : DEMO_ATTENDANCE
  const presentCount = rows.filter((a) => a.status === 'present').length
  const absentCount  = rows.filter((a) => a.status === 'absent').length
  const halfCount    = rows.filter((a) => a.status === 'half_day').length

  const columns = [
    { key: 'employee', label: 'Employee', render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 text-xs font-bold">{initials(v)}</div>
        <span className="font-medium">{v}</span>
      </div>
    )},
    { key: 'check_in', label: 'Check In', render: (v) => <span className="font-mono text-emerald-600 dark:text-emerald-400">{v || '—'}</span> },
    { key: 'check_out', label: 'Check Out', render: (v) => <span className="font-mono text-slate-500">{v || '—'}</span> },
    { key: 'hours', label: 'Hours', render: (v) => <span className="font-semibold">{v > 0 ? `${v}h` : '—'}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v.replace('_', ' ')}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" subtitle="Daily employee attendance tracking" breadcrumbs={[{ label: 'Employees' }, { label: 'Attendance' }]}
        actions={
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="input h-9 text-sm w-40" />
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={rows.length} icon={UserGroupIcon} color="primary" />
        <StatCard title="Present" value={presentCount} icon={CheckCircleIcon} color="green" />
        <StatCard title="Absent" value={absentCount} icon={XCircleIcon} color="red" />
        <StatCard title="Half Day" value={halfCount} icon={CalendarDaysIcon} color="amber" />
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} />
    </div>
  )
}
