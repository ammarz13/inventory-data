import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import FormField, { FormRow } from '../../components/common/FormField'
import Badge from '../../components/common/Badge'
import StatCard from '../../components/common/StatCard'
import { resources } from '../../services/api'
import { currency, formatDate } from '../../utils/formatters'
import { CurrencyDollarIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline'
import { exportToExcel } from '../../utils/exportHelpers'

const schema = z.object({
  title:       z.string().min(2),
  category_id: z.string().min(1, 'Category required'),
  amount:      z.coerce.number().min(0.01),
  date:        z.string().min(1),
  description: z.string().optional(),
  payment_method: z.enum(['cash', 'bank', 'cheque']),
})

const DEMO = {
  data: [
    { id: 1, title: 'Electricity Bill', category: 'Utilities', amount: 18500, date: '2026-05-18', payment_method: 'bank', description: 'May electricity' },
    { id: 2, title: 'Internet & Phone', category: 'Utilities', amount: 4200, date: '2026-05-15', payment_method: 'bank', description: 'Monthly subscription' },
    { id: 3, title: 'Office Stationery', category: 'Office', amount: 2800, date: '2026-05-12', payment_method: 'cash', description: 'Printer cartridges & paper' },
    { id: 4, title: 'Vehicle Fuel', category: 'Transport', amount: 8500, date: '2026-05-10', payment_method: 'cash', description: 'Delivery vehicles' },
    { id: 5, title: 'Machine Maintenance', category: 'Maintenance', amount: 15000, date: '2026-05-08', payment_method: 'bank', description: 'Quarterly service' },
    { id: 6, title: 'Rent', category: 'Rent', amount: 45000, date: '2026-05-01', payment_method: 'cheque', description: 'May rent' },
  ],
  meta: { current_page: 1, last_page: 1, total: 6, per_page: 15 },
  summary: { total: 94000, this_month: 94000, last_month: 87500 },
  by_category: [
    { category: 'Rent', total: 45000 },
    { category: 'Maintenance', total: 15000 },
    { category: 'Utilities', total: 22700 },
    { category: 'Transport', total: 8500 },
    { category: 'Office', total: 2800 },
  ],
}

export default function Expenses() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search],
    queryFn: () => resources.expenses.list({ search }).then((r) => r.data),
    placeholderData: DEMO,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { payment_method: 'cash', date: new Date().toISOString().split('T')[0] } })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? resources.expenses.update(editItem.id, d) : resources.expenses.create(d),
    onSuccess: () => { toast.success('Expense saved!'); qc.invalidateQueries(['expenses']); closeModal() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => resources.expenses.remove(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['expenses']); setDeleteItem(null) },
  })

  const openCreate = () => { setEditItem(null); reset({ payment_method: 'cash', date: new Date().toISOString().split('T')[0] }); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset({ ...item, category_id: String(item.category_id || '1') }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const handleExport = () => {
    exportToExcel(data?.data?.map((e) => ({ Title: e.title, Category: e.category, Amount: e.amount, Date: e.date, Method: e.payment_method })) || [], 'expenses')
    toast.success('Exported to Excel!')
  }

  const summary = data?.summary || DEMO.summary

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'title', label: 'Expense', render: (v) => <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span> },
    { key: 'category', label: 'Category', render: (v) => <Badge variant="purple">{v}</Badge> },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="font-semibold text-red-600 dark:text-red-400">{currency(v)}</span> },
    { key: 'payment_method', label: 'Method', render: (v) => <Badge variant="blue">{v}</Badge> },
    { key: 'description', label: 'Note', render: (v) => <span className="text-xs text-slate-400 truncate block max-w-[140px]">{v || '—'}</span> },
    { key: 'actions', label: '', width: 90, render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"><PencilIcon className="w-4 h-4" /></button>
        <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><TrashIcon className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Monthly Expenses" subtitle="Track and manage all business expenses" breadcrumbs={[{ label: 'Expenses' }]}
        actions={
          <>
            <button onClick={handleExport} className="btn-secondary"><ArrowDownTrayIcon className="w-4 h-4" /> Export Excel</button>
            <button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Expense</button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Expenses" value={currency(summary.total)} icon={CurrencyDollarIcon} color="red" subtitle="all time" />
        <StatCard title="This Month" value={currency(summary.this_month)} icon={DocumentChartBarIcon} color="amber" trend={((summary.this_month - summary.last_month) / summary.last_month * 100).toFixed(1)} trendLabel="vs last month" />
        <StatCard title="Last Month" value={currency(summary.last_month)} icon={DocumentChartBarIcon} color="blue" />
      </div>

      {/* Category Chart */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Expenses by Category</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data?.by_category || DEMO.by_category} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" width={90} />
            <Tooltip formatter={(v) => currency(v)} />
            <Bar dataKey="total" name="Amount" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DataTable columns={columns} data={data?.data || []} loading={isLoading} searchValue={search} onSearch={setSearch} />

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Expense' : 'Add Expense'} size="md"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending} className="btn-primary">Save</button></>}
      >
        <form className="space-y-4">
          <FormField label="Expense Title" error={errors.title?.message} required>
            <input {...register('title')} className="input" placeholder="e.g. Electricity Bill" />
          </FormField>
          <FormRow>
            <FormField label="Category" error={errors.category_id?.message} required>
              <select {...register('category_id')} className="input">
                <option value="">Select…</option>
                <option value="1">Utilities</option>
                <option value="2">Rent</option>
                <option value="3">Transport</option>
                <option value="4">Office</option>
                <option value="5">Maintenance</option>
                <option value="6">Salary</option>
                <option value="7">Other</option>
              </select>
            </FormField>
            <FormField label="Amount (PKR)" error={errors.amount?.message} required>
              <input {...register('amount')} type="number" min="0" step="0.01" className="input" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Date" error={errors.date?.message} required>
              <input {...register('date')} type="date" className="input" />
            </FormField>
            <FormField label="Payment Method">
              <select {...register('payment_method')} className="input">
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </FormField>
          </FormRow>
          <FormField label="Description">
            <textarea {...register('description')} rows={2} className="input resize-none" />
          </FormField>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} title="Delete Expense" message={`Delete "${deleteItem?.title}"?`} />
    </div>
  )
}
