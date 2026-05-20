import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PrinterIcon, ArrowDownTrayIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import { currency, formatDate } from '../../utils/formatters'
import { resources } from '../../services/api'

const DEMO = {
  data: [
    { id: 1, invoice_no: 'INV-2026-001', party: 'Al-Falah Traders', date: '2026-05-18', due_date: '2026-06-18', amount: 45000, paid: 45000, status: 'paid' },
    { id: 2, invoice_no: 'INV-2026-002', party: 'TechParts Ltd', date: '2026-05-16', due_date: '2026-06-16', amount: 72000, paid: 30000, status: 'partial' },
    { id: 3, invoice_no: 'INV-2026-003', party: 'Pak Industrial', date: '2026-05-14', due_date: '2026-06-14', amount: 31000, paid: 0, status: 'unpaid' },
    { id: 4, invoice_no: 'INV-2026-004', party: 'Sunrise Exports', date: '2026-05-10', due_date: '2026-06-10', amount: 88500, paid: 88500, status: 'paid' },
  ],
  meta: { current_page: 1, last_page: 1, total: 4, per_page: 15 },
}

function InvoicePrint({ invoice }) {
  return (
    <div className="p-8 text-sm text-slate-800 dark:text-slate-200" id="invoice-print">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">InvenPro</h1>
          <p className="text-slate-500 mt-1">Inventory Management System</p>
          <p className="text-slate-500">Lahore, Pakistan</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">INVOICE</h2>
          <p className="text-primary-600 font-semibold mt-1">{invoice?.invoice_no}</p>
          <p className="text-slate-500 text-xs mt-1">Date: {formatDate(invoice?.date)}</p>
          <p className="text-slate-500 text-xs">Due: {formatDate(invoice?.due_date)}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 mb-8">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Bill To</p>
        <p className="font-semibold text-slate-900 dark:text-slate-100">{invoice?.party}</p>
      </div>

      {/* Items table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-primary-600 text-white">
            <th className="text-left px-4 py-2 rounded-l-lg">Description</th>
            <th className="text-right px-4 py-2">Amount</th>
            <th className="text-right px-4 py-2 rounded-r-lg">Paid</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-3">Services / Goods</td>
            <td className="px-4 py-3 text-right font-semibold">{currency(invoice?.amount)}</td>
            <td className="px-4 py-3 text-right font-semibold text-emerald-600">{currency(invoice?.paid)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">Balance Due:</td>
            <td className="px-4 py-3 text-right font-bold text-xl text-red-600">{currency((invoice?.amount || 0) - (invoice?.paid || 0))}</td>
          </tr>
        </tfoot>
      </table>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 text-center text-xs text-slate-400">
        Thank you for your business! — InvenPro
      </div>
    </div>
  )
}

export default function Invoices() {
  const [viewInvoice, setViewInvoice] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => resources.invoices.list().then((r) => r.data),
    placeholderData: DEMO,
  })

  const handlePrint = () => {
    const content = document.getElementById('invoice-print')
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Invoice</title><style>body{font-family:Inter,sans-serif;}</style></head><body>${content.innerHTML}</body></html>`)
    win.print()
    win.close()
  }

  const columns = [
    { key: 'invoice_no', label: 'Invoice #', render: (v) => <span className="font-mono font-semibold text-primary-600">{v}</span> },
    { key: 'party', label: 'Party' },
    { key: 'date', label: 'Invoice Date', render: (v) => formatDate(v) },
    { key: 'due_date', label: 'Due Date', render: (v) => formatDate(v) },
    { key: 'amount', label: 'Total', render: (v) => <span className="font-semibold">{currency(v)}</span> },
    { key: 'paid', label: 'Paid', render: (v) => <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currency(v)}</span> },
    { key: 'amount', label: 'Balance', render: (v, row) => {
      const bal = (v || 0) - (row.paid || 0)
      return <span className={`font-semibold ${bal > 0 ? 'text-red-500' : 'text-slate-500'}`}>{currency(bal)}</span>
    }},
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
    { key: 'actions', label: '', width: 80, render: (_, row) => (
      <button onClick={() => setViewInvoice(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
        <EyeIcon className="w-4 h-4" />
      </button>
    )},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle="View and print invoices for parties"
        breadcrumbs={[{ label: 'Cash Flow' }, { label: 'Invoices' }]}
        actions={<button className="btn-primary"><PlusIcon className="w-4 h-4" /> Create Invoice</button>}
      />
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} />

      {/* Invoice Preview Modal */}
      <Modal open={!!viewInvoice} onClose={() => setViewInvoice(null)} title="Invoice Preview" size="lg"
        footer={
          <>
            <button onClick={() => setViewInvoice(null)} className="btn-secondary">Close</button>
            <button onClick={handlePrint} className="btn-secondary"><PrinterIcon className="w-4 h-4" /> Print</button>
            <button className="btn-primary"><ArrowDownTrayIcon className="w-4 h-4" /> Download PDF</button>
          </>
        }
      >
        <InvoicePrint invoice={viewInvoice} />
      </Modal>
    </div>
  )
}
