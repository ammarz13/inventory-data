import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon, PrinterIcon, CheckIcon, BanknotesIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import FormField, { FormRow } from '../../components/common/FormField'
import Badge from '../../components/common/Badge'
import StatCard from '../../components/common/StatCard'
import { resources } from '../../services/api'
import { currency, initials } from '../../utils/formatters'

const DEMO = {
  data: [
    { id: 1, employee: 'Muhammad Bilal', month: 'May 2026', basic: 55000, advance: 0, bonus: 5000, deductions: 0, net: 60000, status: 'paid', paid_date: '2026-05-30' },
    { id: 2, employee: 'Fatima Zahra', month: 'May 2026', basic: 45000, advance: 10000, bonus: 0, deductions: 10000, net: 35000, status: 'paid', paid_date: '2026-05-30' },
    { id: 3, employee: 'Ahmed Raza', month: 'May 2026', basic: 60000, advance: 5000, bonus: 8000, deductions: 5000, net: 63000, status: 'pending', paid_date: null },
    { id: 4, employee: 'Sara Khan', month: 'May 2026', basic: 42000, advance: 0, bonus: 0, deductions: 8000, net: 34000, status: 'pending', paid_date: null },
    { id: 5, employee: 'Usman Tariq', month: 'May 2026', basic: 35000, advance: 0, bonus: 2000, deductions: 0, net: 37000, status: 'paid', paid_date: '2026-05-28' },
  ],
  meta: { current_page: 1, last_page: 1, total: 5, per_page: 15 },
  summary: { total_payroll: 229000, paid_count: 3, pending_count: 2 },
}

export default function Salaries() {
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['salaries'],
    queryFn: () => resources.salaries.list().then((r) => r.data),
    placeholderData: DEMO,
  })

  const summary = data?.summary || DEMO.summary

  const handlePrintSlip = (row) => {
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>Salary Slip</title><style>
        body { font-family: Inter, sans-serif; padding: 32px; max-width: 600px; margin: auto; }
        h1 { color: #4f46e5; } table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td, th { padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; }
        th { background: #f8fafc; font-weight: 600; }
        .total { font-weight: bold; font-size: 18px; color: #059669; }
      </style></head><body>
        <h1>InvenPro — Salary Slip</h1>
        <p><strong>Employee:</strong> ${row.employee}</p>
        <p><strong>Month:</strong> ${row.month}</p>
        <p><strong>Paid Date:</strong> ${row.paid_date || 'Pending'}</p>
        <table>
          <tr><th>Component</th><th>Amount</th></tr>
          <tr><td>Basic Salary</td><td>PKR ${Number(row.basic).toLocaleString()}</td></tr>
          <tr><td>Bonus</td><td>PKR ${Number(row.bonus).toLocaleString()}</td></tr>
          <tr><td>Deductions</td><td style="color:#ef4444">- PKR ${Number(row.deductions).toLocaleString()}</td></tr>
          <tr><td>Advance Deduction</td><td style="color:#ef4444">- PKR ${Number(row.advance).toLocaleString()}</td></tr>
          <tr><td class="total">Net Salary</td><td class="total">PKR ${Number(row.net).toLocaleString()}</td></tr>
        </table>
      </body></html>
    `)
    w.print()
    w.close()
  }

  const columns = [
    { key: 'employee', label: 'Employee', render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 text-xs font-bold">{initials(v)}</div>
        <span className="font-medium">{v}</span>
      </div>
    )},
    { key: 'month', label: 'Month' },
    { key: 'basic', label: 'Basic', render: (v) => currency(v) },
    { key: 'bonus', label: 'Bonus', render: (v) => <span className="text-emerald-600">{v > 0 ? `+${currency(v)}` : '—'}</span> },
    { key: 'deductions', label: 'Deductions', render: (v) => <span className="text-red-500">{v > 0 ? `-${currency(v)}` : '—'}</span> },
    { key: 'net', label: 'Net Salary', render: (v) => <span className="font-bold text-slate-900 dark:text-slate-100">{currency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
    { key: 'actions', label: '', width: 80, render: (_, row) => (
      <button onClick={() => handlePrintSlip(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20" title="Print Slip">
        <PrinterIcon className="w-4 h-4" />
      </button>
    )},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Salary Management" subtitle="Monthly payroll and salary records" breadcrumbs={[{ label: 'Employees' }, { label: 'Salaries' }]}
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Salary Record</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Payroll" value={currency(summary.total_payroll)} icon={BanknotesIcon} color="primary" subtitle="this month" />
        <StatCard title="Paid" value={summary.paid_count} icon={CheckIcon} color="green" subtitle="employees paid" />
        <StatCard title="Pending" value={summary.pending_count} icon={UserGroupIcon} color="amber" subtitle="awaiting payment" />
      </div>

      <DataTable columns={columns} data={data?.data || []} loading={isLoading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Salary Record" size="md"
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button className="btn-primary">Save Record</button></>}
      >
        <form className="space-y-4">
          <FormRow>
            <FormField label="Employee" required>
              <select className="input">
                <option value="">Select employee…</option>
                <option value="1">Muhammad Bilal</option>
                <option value="2">Fatima Zahra</option>
              </select>
            </FormField>
            <FormField label="Month" required>
              <input type="month" className="input" defaultValue="2026-05" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Basic Salary (PKR)" required>
              <input type="number" min="0" className="input" />
            </FormField>
            <FormField label="Bonus">
              <input type="number" min="0" className="input" defaultValue="0" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Advance Deduction">
              <input type="number" min="0" className="input" defaultValue="0" />
            </FormField>
            <FormField label="Other Deductions">
              <input type="number" min="0" className="input" defaultValue="0" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Status">
              <select className="input">
                <option>Pending</option>
                <option>Paid</option>
              </select>
            </FormField>
            <FormField label="Paid Date">
              <input type="date" className="input" />
            </FormField>
          </FormRow>
        </form>
      </Modal>
    </div>
  )
}
