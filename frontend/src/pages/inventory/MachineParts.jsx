import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Badge from '../../components/common/Badge'
import FormField, { FormRow } from '../../components/common/FormField'
import { resources } from '../../services/api'
import { currency, formatDate } from '../../utils/formatters'
import { useDebounce } from '../../hooks/useDebounce'

const schema = z.object({
  name:        z.string().min(2),
  sku:         z.string().min(1),
  machine_id:  z.string().min(1, 'Machine is required'),
  category_id: z.string().min(1),
  supplier_id: z.string().optional(),
  quantity:    z.coerce.number().min(0),
  min_quantity:z.coerce.number().min(0),
  unit_price:  z.coerce.number().min(0),
  unit:        z.string().optional(),
})

const stockStatus = (qty, min) => {
  if (qty <= 0) return { label: 'Out of Stock', status: 'out_of_stock' }
  if (qty <= min) return { label: 'Low Stock', status: 'low_stock' }
  return { label: 'In Stock', status: 'in_stock' }
}

const DEMO = {
  data: [
    { id: 1, name: 'Motor Bearing 6205', sku: 'MB-6205', machine: 'CNC Lathe', category: 'Bearings', quantity: 3, min_quantity: 10, unit_price: 850, unit: 'pcs', created_at: '2025-01-10' },
    { id: 2, name: 'Hydraulic Seal Kit', sku: 'HSK-001', machine: 'Hydraulic Press', category: 'Seals', quantity: 1, min_quantity: 5, unit_price: 2400, unit: 'set', created_at: '2025-02-05' },
    { id: 3, name: 'V-Belt A50', sku: 'VB-A50', machine: 'Air Compressor', category: 'Belts', quantity: 8, min_quantity: 20, unit_price: 320, unit: 'pcs', created_at: '2025-03-12' },
    { id: 4, name: 'Welding Wire 1.2mm', sku: 'WW-12', machine: 'MIG Welder', category: 'Consumables', quantity: 45, min_quantity: 20, unit_price: 180, unit: 'kg', created_at: '2025-04-01' },
    { id: 5, name: 'Drill Bit Set 1-13mm', sku: 'DBS-113', machine: 'Drill Press', category: 'Tools', quantity: 12, min_quantity: 5, unit_price: 1500, unit: 'set', created_at: '2025-04-18' },
  ],
  meta: { current_page: 1, last_page: 1, total: 5, per_page: 15 },
}

export default function MachineParts() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [filterStock, setFilterStock] = useState('')
  const dSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ['machine-parts', page, dSearch, filterStock],
    queryFn: () => resources.machineParts.list({ page, search: dSearch, stock_status: filterStock }).then((r) => r.data),
    placeholderData: DEMO,
  })

  const { data: machinesData } = useQuery({
    queryKey: ['machines', 'all'],
    queryFn: () => resources.machines.list({ per_page: 100 }).then((r) => r.data),
  })
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'part'],
    queryFn: () => resources.categories.list({ type: 'part' }).then((r) => r.data),
  })
  const machineOptions  = machinesData?.data || []
  const categoryOptions = categoriesData?.data || []

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? resources.machineParts.update(editItem.id, d) : resources.machineParts.create(d),
    onSuccess: () => { toast.success('Part saved!'); qc.invalidateQueries(['machine-parts']); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => resources.machineParts.remove(id),
    onSuccess: () => { toast.success('Part deleted'); qc.invalidateQueries(['machine-parts']); setDeleteItem(null) },
  })

  const openCreate = () => { setEditItem(null); reset(); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset({ ...item, machine_id: String(item.machine_id || '1'), category_id: String(item.category_id || '1') }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const columns = [
    { key: 'name', label: 'Part Name', sortable: true, render: (v) => <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span> },
    { key: 'sku', label: 'SKU' },
    { key: 'machine', label: 'Machine', render: (v) => v?.name || v || '—' },
    { key: 'category', label: 'Category', render: (v) => v?.name || v || '—' },
    { key: 'quantity', label: 'Qty', sortable: true, render: (v, row) => {
      const s = stockStatus(v, row.min_quantity)
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{v}</span>
          {v <= row.min_quantity && <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />}
        </div>
      )
    }},
    { key: 'unit_price', label: 'Unit Price', render: (v) => currency(v) },
    { key: 'quantity', label: 'Stock Status', render: (v, row) => {
      const s = stockStatus(v, row.min_quantity)
      return <Badge status={s.status}>{s.label}</Badge>
    }},
    { key: 'actions', label: '', width: 90, render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><PencilIcon className="w-4 h-4" /></button>
        <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><TrashIcon className="w-4 h-4" /></button>
      </div>
    )},
  ]

  const lowStockCount = (data?.data || []).filter((p) => p.quantity <= p.min_quantity).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machine Parts"
        subtitle="Track spare parts inventory with low-stock alerts"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Machine Parts' }]}
        actions={
          <>
            {lowStockCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
                <ExclamationTriangleIcon className="w-4 h-4" /> {lowStockCount} low stock
              </span>
            )}
            <button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Part</button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        searchValue={search}
        onSearch={setSearch}
        filters={
          <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="input h-9 text-sm w-40">
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        }
        pagination={data?.meta ? { page: data.meta.current_page, lastPage: data.meta.last_page, total: data.meta.total, perPage: data.meta.per_page } : null}
        onPageChange={setPage}
      />

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Part' : 'Add Machine Part'} size="lg"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending} className="btn-primary">{saveMutation.isPending ? 'Saving…' : 'Save Part'}</button></>}
      >
        <form className="space-y-4">
          <FormRow>
            <FormField label="Part Name" error={errors.name?.message} required>
              <input {...register('name')} className="input" placeholder="e.g. Motor Bearing 6205" />
            </FormField>
            <FormField label="SKU" error={errors.sku?.message} required>
              <input {...register('sku')} className="input" placeholder="e.g. MB-6205" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Machine" error={errors.machine_id?.message} required>
              <select {...register('machine_id')} className="input">
                <option value="">Select machine…</option>
                {machineOptions.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Category" error={errors.category_id?.message} required>
              <select {...register('category_id')} className="input">
                <option value="">Select category…</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </FormField>
          </FormRow>
          <FormRow cols={3}>
            <FormField label="Quantity" error={errors.quantity?.message} required>
              <input {...register('quantity')} type="number" min="0" className="input" placeholder="0" />
            </FormField>
            <FormField label="Min Quantity" error={errors.min_quantity?.message} required>
              <input {...register('min_quantity')} type="number" min="0" className="input" placeholder="0" />
            </FormField>
            <FormField label="Unit (pcs, kg, set…)" error={errors.unit?.message}>
              <input {...register('unit')} className="input" placeholder="pcs" />
            </FormField>
          </FormRow>
          <FormField label="Unit Price (PKR)" error={errors.unit_price?.message} required>
            <input {...register('unit_price')} type="number" min="0" step="0.01" className="input" placeholder="0.00" />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteItem} onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending}
        title="Delete Part" message={`Delete "${deleteItem?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
