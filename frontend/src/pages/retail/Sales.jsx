import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, MinusIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import FormField, { FormRow } from '../../components/common/FormField'
import Badge from '../../components/common/Badge'
import StatCard from '../../components/common/StatCard'
import { resources } from '../../services/api'
import { currency, formatDate } from '../../utils/formatters'
import { ShoppingCartIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

const DEMO = {
  data: [
    { id: 1, sale_no: 'SAL-001', customer: 'Walk-in Customer', date: '2026-05-18', items: 3, total: 4850, profit: 1200, status: 'paid' },
    { id: 2, sale_no: 'SAL-002', customer: 'Al-Falah Traders', date: '2026-05-17', items: 7, total: 12400, profit: 3100, status: 'partial' },
    { id: 3, sale_no: 'SAL-003', customer: 'City Hardware', date: '2026-05-16', items: 2, total: 2200, profit: 600, status: 'paid' },
    { id: 4, sale_no: 'SAL-004', customer: 'Metro Supplies', date: '2026-05-15', items: 5, total: 8750, profit: 2100, status: 'unpaid' },
  ],
  meta: { current_page: 1, last_page: 1, total: 4, per_page: 15 },
  summary: { total_sales: 28200, total_profit: 7000, total_transactions: 4 },
}

export default function Sales() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['retail-sales'],
    queryFn: () => resources.retailSales.list().then((r) => r.data),
    placeholderData: DEMO,
  })

  const summary = data?.summary || DEMO.summary

  const columns = [
    { key: 'sale_no', label: 'Sale #', render: (v) => <span className="font-mono font-semibold text-primary-600">{v}</span> },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
    { key: 'items', label: 'Items', render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'total', label: 'Total', render: (v) => <span className="font-semibold">{currency(v)}</span> },
    { key: 'profit', label: 'Profit', render: (v) => <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Sales" subtitle="Track retail sales and profit" breadcrumbs={[{ label: 'Retail' }, { label: 'Sales' }]}
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><PlusIcon className="w-4 h-4" /> New Sale</button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Sales" value={currency(summary.total_sales)} icon={ShoppingCartIcon} color="primary" subtitle="this month" />
        <StatCard title="Total Profit" value={currency(summary.total_profit)} icon={ArrowTrendingUpIcon} color="green" subtitle="this month" />
        <StatCard title="Transactions" value={summary.total_transactions} icon={CurrencyDollarIcon} color="blue" subtitle="this month" />
      </div>

      <DataTable columns={columns} data={data?.data || []} loading={isLoading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Sale Entry" size="xl"
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button className="btn-primary">Save Sale</button></>}
      >
        <div className="space-y-4">
          <FormRow>
            <FormField label="Customer Name">
              <input className="input" placeholder="Walk-in Customer" defaultValue="Walk-in Customer" />
            </FormField>
            <FormField label="Date">
              <input type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} />
            </FormField>
          </FormRow>

          {/* Products */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sale Items</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="table-header">Product</th>
                  <th className="table-header">Qty</th>
                  <th className="table-header">Unit Price</th>
                  <th className="table-header">Total</th>
                  <th className="table-header w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-cell"><select className="input h-8 text-xs"><option>Motor Oil 15W-40</option></select></td>
                  <td className="table-cell"><input type="number" defaultValue="2" className="input h-8 text-xs w-16" /></td>
                  <td className="table-cell"><input type="number" defaultValue="1100" className="input h-8 text-xs w-24" /></td>
                  <td className="table-cell font-semibold">PKR 2,200</td>
                  <td className="table-cell"><button className="text-red-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button></td>
                </tr>
              </tbody>
            </table>
            <button className="w-full p-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 flex items-center justify-center gap-1 border-t border-slate-100 dark:border-slate-700">
              <PlusIcon className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">PKR 2,200</span></div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2"><span className="font-semibold text-slate-800 dark:text-slate-200">Total</span><span className="font-bold text-lg">PKR 2,200</span></div>
            </div>
          </div>

          <FormRow>
            <FormField label="Payment Method">
              <select className="input"><option>Cash</option><option>Bank Transfer</option><option>Cheque</option></select>
            </FormField>
            <FormField label="Status">
              <select className="input"><option>Paid</option><option>Partial</option><option>Unpaid</option></select>
            </FormField>
          </FormRow>
        </div>
      </Modal>
    </div>
  )
}
