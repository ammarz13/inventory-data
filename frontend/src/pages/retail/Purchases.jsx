import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import FormField, { FormRow } from '../../components/common/FormField'
import { currency, formatDate } from '../../utils/formatters'
import { resources } from '../../services/api'

const DEMO = {
  data: [
    { id: 1, po_no: 'PO-2026-001', supplier: 'Metro Industrial Supply', date: '2026-05-15', items: 8, total: 28400, status: 'received' },
    { id: 2, po_no: 'PO-2026-002', supplier: 'Al-Falah Bearings', date: '2026-05-12', items: 5, total: 15200, status: 'pending' },
    { id: 3, po_no: 'PO-2026-003', supplier: 'TechParts Pakistan', date: '2026-05-10', items: 12, total: 52000, status: 'partial' },
  ],
  meta: { current_page: 1, last_page: 1, total: 3, per_page: 15 },
}

export default function Purchases() {
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => resources.purchases.list().then((r) => r.data),
    placeholderData: DEMO,
  })

  const columns = [
    { key: 'po_no', label: 'PO #', render: (v) => <span className="font-mono font-semibold text-primary-600">{v}</span> },
    { key: 'supplier', label: 'Supplier' },
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
    { key: 'items', label: 'Items', render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'total', label: 'Total', render: (v) => <span className="font-semibold">{currency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Purchases" subtitle="Manage purchase orders from suppliers" breadcrumbs={[{ label: 'Retail' }, { label: 'Purchases' }]}
        actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><PlusIcon className="w-4 h-4" /> New Purchase</button>}
      />
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Purchase Order" size="lg"
        footer={<><button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button className="btn-primary">Create PO</button></>}
      >
        <div className="space-y-4">
          <FormRow>
            <FormField label="Supplier" required>
              <select className="input">
                <option value="">Select supplier…</option>
                <option>Metro Industrial Supply</option>
                <option>Al-Falah Bearings</option>
                <option>TechParts Pakistan</option>
              </select>
            </FormField>
            <FormField label="Date" required>
              <input type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} />
            </FormField>
          </FormRow>
          <FormField label="Notes">
            <textarea rows={3} className="input resize-none" placeholder="Purchase order notes…" />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
