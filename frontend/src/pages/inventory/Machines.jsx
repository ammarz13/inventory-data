import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Badge from '../../components/common/Badge'
import FormField, { FormRow } from '../../components/common/FormField'
import { resources } from '../../services/api'
import { formatDate } from '../../utils/formatters'
import { useDebounce } from '../../hooks/useDebounce'

const schema = z.object({
  name:        z.string().min(2, 'Name is required'),
  model_no:    z.string().min(1, 'Model number is required'),
  sku:         z.string().min(1, 'SKU is required'),
  category_id: z.string().min(1, 'Category is required'),
  supplier_id: z.string().optional(),
  location:    z.string().optional(),
  status:      z.enum(['active', 'inactive', 'maintenance']),
  description: z.string().optional(),
})

const DEMO_MACHINES = {
  data: [
    { id: 1, name: 'CNC Lathe Machine', model_no: 'CNC-LT-2000', sku: 'MCH-001', category: 'CNC', status: 'active', location: 'Floor A', created_at: '2025-01-15' },
    { id: 2, name: 'Hydraulic Press 50T', model_no: 'HP-50T', sku: 'MCH-002', category: 'Press', status: 'maintenance', location: 'Floor B', created_at: '2025-03-10' },
    { id: 3, name: 'MIG Welder Pro', model_no: 'MW-500P', sku: 'MCH-003', category: 'Welding', status: 'active', location: 'Workshop', created_at: '2025-04-22' },
    { id: 4, name: 'Air Compressor 200L', model_no: 'AC-200', sku: 'MCH-004', category: 'Compressor', status: 'inactive', location: 'Store', created_at: '2024-12-01' },
    { id: 5, name: 'Drill Press 20"', model_no: 'DP-20', sku: 'MCH-005', category: 'Drilling', status: 'active', location: 'Floor A', created_at: '2025-02-14' },
  ],
  meta: { current_page: 1, last_page: 1, total: 5, per_page: 15 },
}

export default function Machines() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ['machines', page, debouncedSearch],
    queryFn: () => resources.machines.list({ page, search: debouncedSearch }).then((r) => r.data),
    placeholderData: DEMO_MACHINES,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'machine'],
    queryFn: () => resources.categories.list({ type: 'machine' }).then((r) => r.data),
  })
  const categoryOptions = categoriesData?.data || []

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? resources.machines.update(editItem.id, d) : resources.machines.create(d),
    onSuccess: () => { toast.success(editItem ? 'Machine updated!' : 'Machine added!'); qc.invalidateQueries(['machines']); closeModal() },
    onError: () => toast.error('Failed to save machine'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => resources.machines.remove(id),
    onSuccess: () => { toast.success('Machine deleted'); qc.invalidateQueries(['machines']); setDeleteItem(null) },
  })

  const openCreate = () => { setEditItem(null); reset({ status: 'active' }); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset({ ...item, category_id: String(item.category_id), supplier_id: String(item.supplier_id || '') }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const columns = [
    { key: 'name', label: 'Machine Name', sortable: true, render: (v) => <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span> },
    { key: 'model_no', label: 'Model No', sortable: true },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category', render: (v) => v?.name || v || '—' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
    { key: 'created_at', label: 'Added', render: (v) => formatDate(v) },
    {
      key: 'actions', label: '', width: 100,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machines"
        subtitle="Manage your machine inventory"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Machines' }]}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <PlusIcon className="w-4 h-4" /> Add Machine
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        searchValue={search}
        onSearch={setSearch}
        pagination={data?.meta ? { page: data.meta.current_page, lastPage: data.meta.last_page, total: data.meta.total, perPage: data.meta.per_page } : null}
        onPageChange={setPage}
      />

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Machine' : 'Add Machine'} size="lg"
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending} className="btn-primary">
              {saveMutation.isPending ? 'Saving…' : editItem ? 'Update' : 'Add Machine'}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <FormRow>
            <FormField label="Machine Name" error={errors.name?.message} required>
              <input {...register('name')} className="input" placeholder="e.g. CNC Lathe Machine" />
            </FormField>
            <FormField label="Model Number" error={errors.model_no?.message} required>
              <input {...register('model_no')} className="input" placeholder="e.g. CNC-LT-2000" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="SKU" error={errors.sku?.message} required>
              <input {...register('sku')} className="input" placeholder="e.g. MCH-001" />
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
          <FormRow>
            <FormField label="Location">
              <input {...register('location')} className="input" placeholder="e.g. Floor A" />
            </FormField>
            <FormField label="Status" error={errors.status?.message} required>
              <select {...register('status')} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </FormField>
          </FormRow>
          <FormField label="Description">
            <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Optional description…" />
          </FormField>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        loading={deleteMutation.isPending}
        title="Delete Machine"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
