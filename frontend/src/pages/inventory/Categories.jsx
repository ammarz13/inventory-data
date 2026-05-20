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
import FormField from '../../components/common/FormField'
import Badge from '../../components/common/Badge'
import { resources } from '../../services/api'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.enum(['machine', 'part', 'product', 'expense']),
  description: z.string().optional(),
})

const DEMO = {
  data: [
    { id: 1, name: 'CNC Machines', type: 'machine', description: 'Computer Numerical Control equipment', items_count: 8 },
    { id: 2, name: 'Hydraulic Equipment', type: 'machine', description: 'Hydraulic press and related machinery', items_count: 5 },
    { id: 3, name: 'Bearings', type: 'part', description: 'Ball and roller bearings', items_count: 34 },
    { id: 4, name: 'Seals & Gaskets', type: 'part', description: 'Hydraulic seals and gaskets', items_count: 22 },
    { id: 5, name: 'Electronics', type: 'product', description: 'Electronic components for retail', items_count: 112 },
    { id: 6, name: 'Utilities', type: 'expense', description: 'Electricity, water, gas expenses', items_count: 0 },
  ],
  meta: { current_page: 1, last_page: 1, total: 6, per_page: 15 },
}

export default function Categories() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => resources.categories.list().then((r) => r.data),
    placeholderData: DEMO,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { type: 'machine' } })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? resources.categories.update(editItem.id, d) : resources.categories.create(d),
    onSuccess: () => { toast.success('Category saved!'); qc.invalidateQueries(['categories']); closeModal() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => resources.categories.remove(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['categories']); setDeleteItem(null) },
  })

  const openCreate = () => { setEditItem(null); reset({ type: 'machine' }); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset(item); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const typeColors = { machine: 'blue', part: 'purple', product: 'green', expense: 'amber' }

  const columns = [
    { key: 'name', label: 'Category Name', sortable: true, render: (v) => <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span> },
    { key: 'type', label: 'Type', render: (v) => <Badge variant={typeColors[v] || 'gray'}>{v}</Badge> },
    { key: 'description', label: 'Description', render: (v) => v || '—' },
    { key: 'items_count', label: 'Items', render: (v) => <span className="font-semibold">{v || 0}</span> },
    { key: 'actions', label: '', width: 90, render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><PencilIcon className="w-4 h-4" /></button>
        <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><TrashIcon className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" subtitle="Organize inventory, products, and expenses" breadcrumbs={[{ label: 'Inventory' }, { label: 'Categories' }]}
        actions={<button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Category</button>}
      />
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} />
      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Category' : 'Add Category'} size="sm"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending} className="btn-primary">Save</button></>}
      >
        <form className="space-y-4">
          <FormField label="Name" error={errors.name?.message} required>
            <input {...register('name')} className="input" placeholder="Category name" />
          </FormField>
          <FormField label="Type" error={errors.type?.message} required>
            <select {...register('type')} className="input">
              <option value="machine">Machine</option>
              <option value="part">Machine Part</option>
              <option value="product">Product</option>
              <option value="expense">Expense</option>
            </select>
          </FormField>
          <FormField label="Description">
            <textarea {...register('description')} rows={2} className="input resize-none" />
          </FormField>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} title="Delete Category" message={`Delete "${deleteItem?.name}"?`} />
    </div>
  )
}
