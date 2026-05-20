import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import FormField, { FormRow } from '../../components/common/FormField'
import Badge from '../../components/common/Badge'
import { resources } from '../../services/api'
import { currency } from '../../utils/formatters'
import { useDebounce } from '../../hooks/useDebounce'

const schema = z.object({
  name:         z.string().min(2),
  sku:          z.string().min(1),
  category_id:  z.string().min(1),
  purchase_price: z.coerce.number().min(0),
  sale_price:   z.coerce.number().min(0),
  stock:        z.coerce.number().min(0),
  min_stock:    z.coerce.number().min(0),
  unit:         z.string().optional(),
  barcode:      z.string().optional(),
})

const DEMO = {
  data: [
    { id: 1, name: 'Motor Oil 15W-40 (4L)', sku: 'PRD-001', category: 'Lubricants', purchase_price: 850, sale_price: 1100, stock: 45, min_stock: 10, unit: 'can', barcode: '6923450012341' },
    { id: 2, name: 'Hydraulic Oil 68 (20L)', sku: 'PRD-002', category: 'Lubricants', purchase_price: 3200, sale_price: 4200, stock: 12, min_stock: 5, unit: 'drum', barcode: '6923450012342' },
    { id: 3, name: 'Safety Gloves L', sku: 'PRD-003', category: 'Safety', purchase_price: 120, sale_price: 200, stock: 200, min_stock: 50, unit: 'pair', barcode: '6923450012343' },
    { id: 4, name: 'Teflon Tape 12mm', sku: 'PRD-004', category: 'Fittings', purchase_price: 25, sale_price: 45, stock: 8, min_stock: 20, unit: 'roll', barcode: '6923450012344' },
    { id: 5, name: 'Electric Wire 2.5mm (100m)', sku: 'PRD-005', category: 'Electrical', purchase_price: 1800, sale_price: 2500, stock: 30, min_stock: 10, unit: 'roll', barcode: '6923450012345' },
  ],
  meta: { current_page: 1, last_page: 1, total: 5, per_page: 15 },
}

export default function Products() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const dSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ['products', dSearch],
    queryFn: () => resources.products.list({ search: dSearch }).then((r) => r.data),
    placeholderData: DEMO,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? resources.products.update(editItem.id, d) : resources.products.create(d),
    onSuccess: () => { toast.success('Product saved!'); qc.invalidateQueries(['products']); closeModal() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => resources.products.remove(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['products']); setDeleteItem(null) },
  })

  const openCreate = () => { setEditItem(null); reset(); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset({ ...item, category_id: String(item.category_id || '1') }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const profit = (row) => row.sale_price - row.purchase_price
  const profitPct = (row) => row.purchase_price > 0 ? ((profit(row) / row.purchase_price) * 100).toFixed(1) : 0

  const columns = [
    { key: 'name', label: 'Product', sortable: true, render: (v) => <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span> },
    { key: 'sku', label: 'SKU' },
    { key: 'barcode', label: 'Barcode', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'category', label: 'Category' },
    { key: 'purchase_price', label: 'Buy Price', render: (v) => currency(v) },
    { key: 'sale_price', label: 'Sale Price', render: (v) => <span className="font-semibold">{currency(v)}</span> },
    { key: 'sale_price', label: 'Profit', render: (v, row) => (
      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{profitPct(row)}%</span>
    )},
    { key: 'stock', label: 'Stock', render: (v, row) => (
      <span className={`font-semibold ${v <= row.min_stock ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'}`}>{v} {row.unit}</span>
    )},
    { key: 'actions', label: '', width: 90, render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"><PencilIcon className="w-4 h-4" /></button>
        <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><TrashIcon className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Products" subtitle="Manage retail product catalog" breadcrumbs={[{ label: 'Retail' }, { label: 'Products' }]}
        actions={<button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Product</button>}
      />
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} searchValue={search} onSearch={setSearch} />

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Product' : 'Add Product'} size="lg"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending} className="btn-primary">Save Product</button></>}
      >
        <form className="space-y-4">
          <FormRow>
            <FormField label="Product Name" error={errors.name?.message} required>
              <input {...register('name')} className="input" />
            </FormField>
            <FormField label="SKU" error={errors.sku?.message} required>
              <input {...register('sku')} className="input" placeholder="PRD-001" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Barcode">
              <input {...register('barcode')} className="input" />
            </FormField>
            <FormField label="Category" error={errors.category_id?.message} required>
              <select {...register('category_id')} className="input">
                <option value="">Select…</option>
                <option value="1">Lubricants</option>
                <option value="2">Safety</option>
                <option value="3">Fittings</option>
                <option value="4">Electrical</option>
              </select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Purchase Price" error={errors.purchase_price?.message} required>
              <input {...register('purchase_price')} type="number" min="0" step="0.01" className="input" />
            </FormField>
            <FormField label="Sale Price" error={errors.sale_price?.message} required>
              <input {...register('sale_price')} type="number" min="0" step="0.01" className="input" />
            </FormField>
          </FormRow>
          <FormRow cols={3}>
            <FormField label="Stock Quantity" error={errors.stock?.message} required>
              <input {...register('stock')} type="number" min="0" className="input" />
            </FormField>
            <FormField label="Min Stock" error={errors.min_stock?.message} required>
              <input {...register('min_stock')} type="number" min="0" className="input" />
            </FormField>
            <FormField label="Unit">
              <input {...register('unit')} className="input" placeholder="pcs" />
            </FormField>
          </FormRow>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} title="Delete Product" message={`Delete "${deleteItem?.name}"?`} />
    </div>
  )
}
