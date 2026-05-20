import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import FormField, { FormRow } from '../../components/common/FormField'
import Badge from '../../components/common/Badge'
import StatCard from '../../components/common/StatCard'
import { resources } from '../../services/api'
import { currency, formatDate } from '../../utils/formatters'
import { BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

const schema = z.object({
  party_id:    z.string().min(1, 'Party is required'),
  type:        z.enum(['credit', 'debit']),
  amount:      z.coerce.number().min(0.01, 'Amount must be positive'),
  date:        z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  payment_method: z.enum(['cash', 'bank', 'cheque', 'online']),
  status:      z.enum(['paid', 'pending', 'partial', 'unpaid']),
})

const DEMO = {
  data: [
    { id: 1, party: 'Al-Falah Traders', type: 'credit', amount: 45000, date: '2026-05-18', description: 'Payment received for May order', payment_method: 'bank', status: 'paid' },
    { id: 2, party: 'Metro Supplies', type: 'debit', amount: 18500, date: '2026-05-17', description: 'Parts purchase invoice #1042', payment_method: 'cash', status: 'paid' },
    { id: 3, party: 'TechParts Ltd', type: 'credit', amount: 72000, date: '2026-05-16', description: 'Machine supply payment', payment_method: 'cheque', status: 'pending' },
    { id: 4, party: 'City Hardware', type: 'debit', amount: 9200, date: '2026-05-15', description: 'Hardware tools purchase', payment_method: 'cash', status: 'paid' },
    { id: 5, party: 'Pak Industrial', type: 'credit', amount: 31000, date: '2026-05-14', description: 'Advance payment for Q3', payment_method: 'online', status: 'partial' },
  ],
  meta: { current_page: 1, last_page: 1, total: 5, per_page: 15 },
  summary: { total_credit: 148000, total_debit: 27700, net_balance: 120300 },
}

export default function Transactions() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['cashflows', search, filterType],
    queryFn: () => resources.cashflows.list({ search, type: filterType }).then((r) => r.data),
    placeholderData: DEMO,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'credit', payment_method: 'cash', status: 'paid', date: new Date().toISOString().split('T')[0] },
  })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? resources.cashflows.update(editItem.id, d) : resources.cashflows.create(d),
    onSuccess: () => { toast.success('Transaction saved!'); qc.invalidateQueries(['cashflows']); closeModal() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => resources.cashflows.remove(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['cashflows']); setDeleteItem(null) },
  })

  const openCreate = (type = 'credit') => { setEditItem(null); reset({ type, payment_method: 'cash', status: 'paid', date: new Date().toISOString().split('T')[0] }); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset({ ...item, party_id: String(item.party_id || '1') }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const summary = data?.summary || DEMO.summary

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'party', label: 'Party', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'type', label: 'Type', render: (v) => (
      <span className={`flex items-center gap-1 text-xs font-semibold ${v === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
        {v === 'credit' ? <ArrowUpIcon className="w-3.5 h-3.5" /> : <ArrowDownIcon className="w-3.5 h-3.5" />}
        {v === 'credit' ? 'Cash In' : 'Cash Out'}
      </span>
    )},
    { key: 'amount', label: 'Amount', sortable: true, render: (v, row) => (
      <span className={`font-semibold ${row.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
        {row.type === 'credit' ? '+' : '-'}{currency(v)}
      </span>
    )},
    { key: 'payment_method', label: 'Method', render: (v) => <Badge variant="blue">{v}</Badge> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
    { key: 'description', label: 'Note', render: (v) => <span className="text-slate-400 text-xs truncate max-w-[150px] block">{v || '—'}</span> },
    { key: 'actions', label: '', width: 90, render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"><PencilIcon className="w-4 h-4" /></button>
        <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><TrashIcon className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Cash Flow Transactions" subtitle="Track all incoming and outgoing payments"
        breadcrumbs={[{ label: 'Cash Flow' }, { label: 'Transactions' }]}
        actions={
          <>
            <button onClick={() => openCreate('debit')} className="btn-secondary"><ArrowDownIcon className="w-4 h-4 text-red-500" /> Cash Out</button>
            <button onClick={() => openCreate('credit')} className="btn-primary"><ArrowUpIcon className="w-4 h-4" /> Cash In</button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Cash In" value={currency(summary.total_credit)} icon={ArrowUpIcon} color="green" subtitle="this period" />
        <StatCard title="Total Cash Out" value={currency(summary.total_debit)} icon={ArrowDownIcon} color="red" subtitle="this period" />
        <StatCard title="Net Balance" value={currency(summary.net_balance)} icon={BanknotesIcon} color={summary.net_balance >= 0 ? 'green' : 'red'} subtitle="this period" />
      </div>

      <DataTable
        columns={columns} data={data?.data || []} loading={isLoading}
        searchValue={search} onSearch={setSearch}
        filters={
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input h-9 text-sm w-36">
            <option value="">All Types</option>
            <option value="credit">Cash In</option>
            <option value="debit">Cash Out</option>
          </select>
        }
      />

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Transaction' : 'Add Transaction'} size="md"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending} className="btn-primary">Save</button></>}
      >
        <form className="space-y-4">
          <FormRow>
            <FormField label="Party" error={errors.party_id?.message} required>
              <select {...register('party_id')} className="input">
                <option value="">Select party…</option>
                <option value="1">Al-Falah Traders</option>
                <option value="2">Metro Supplies</option>
                <option value="3">TechParts Ltd</option>
              </select>
            </FormField>
            <FormField label="Type" required>
              <select {...register('type')} className="input">
                <option value="credit">Cash In (Credit)</option>
                <option value="debit">Cash Out (Debit)</option>
              </select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Amount (PKR)" error={errors.amount?.message} required>
              <input {...register('amount')} type="number" min="0" step="0.01" className="input" placeholder="0.00" />
            </FormField>
            <FormField label="Date" error={errors.date?.message} required>
              <input {...register('date')} type="date" className="input" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Payment Method">
              <select {...register('payment_method')} className="input">
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select {...register('status')} className="input">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </FormField>
          </FormRow>
          <FormField label="Description / Note">
            <textarea {...register('description')} rows={2} className="input resize-none" />
          </FormField>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} title="Delete Transaction" message="Delete this transaction? This cannot be undone." />
    </div>
  )
}
