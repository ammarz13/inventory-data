import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import FormField, { FormRow } from '../../components/common/FormField'
import Badge from '../../components/common/Badge'
import { resources } from '../../services/api'

const schema = z.object({
  name:    z.string().min(2),
  contact: z.string().optional(),
  email:   z.string().email().optional().or(z.literal('')),
  phone:   z.string().optional(),
  address: z.string().optional(),
  status:  z.enum(['active', 'inactive']),
})

const DEMO = {
  data: [
    { id: 1, name: 'Al-Falah Bearings Co.', contact: 'Ahmed Khan', email: 'ahmed@alfalah.pk', phone: '0300-1234567', address: 'Lahore, Punjab', status: 'active', items_supplied: 45 },
    { id: 2, name: 'Metro Industrial Supply', contact: 'Bilal Raza', email: 'bilal@metro.pk', phone: '0321-9876543', address: 'Karachi, Sindh', status: 'active', items_supplied: 112 },
    { id: 3, name: 'TechParts Pakistan', contact: 'Sara Ali', email: 'sara@techparts.pk', phone: '0333-5554444', address: 'Islamabad', status: 'inactive', items_supplied: 23 },
  ],
  meta: { current_page: 1, last_page: 1, total: 3, per_page: 15 },
}

export default function Suppliers() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', search],
    queryFn: () => resources.suppliers.list({ search }).then((r) => r.data),
    placeholderData: DEMO,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status: 'active' } })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? resources.suppliers.update(editItem.id, d) : resources.suppliers.create(d),
    onSuccess: () => { toast.success('Supplier saved!'); qc.invalidateQueries(['suppliers']); closeModal() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => resources.suppliers.remove(id),
    onSuccess: () => { toast.success('Supplier deleted'); qc.invalidateQueries(['suppliers']); setDeleteItem(null) },
  })

  const openCreate = () => { setEditItem(null); reset({ status: 'active' }); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset(item); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const columns = [
    { key: 'name', label: 'Supplier Name', sortable: true, render: (v) => <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span> },
    { key: 'contact', label: 'Contact Person' },
    { key: 'phone', label: 'Phone', render: (v) => v ? <a href={`tel:${v}`} className="flex items-center gap-1 text-primary-600 hover:underline"><PhoneIcon className="w-3.5 h-3.5" />{v}</a> : '—' },
    { key: 'email', label: 'Email', render: (v) => v ? <a href={`mailto:${v}`} className="flex items-center gap-1 text-primary-600 hover:underline"><EnvelopeIcon className="w-3.5 h-3.5" />{v}</a> : '—' },
    { key: 'address', label: 'Location' },
    { key: 'items_supplied', label: 'Items', render: (v) => <span className="font-semibold">{v || 0}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
    { key: 'actions', label: '', width: 90, render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><PencilIcon className="w-4 h-4" /></button>
        <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><TrashIcon className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Suppliers" subtitle="Manage your supplier information" breadcrumbs={[{ label: 'Inventory' }, { label: 'Suppliers' }]}
        actions={<button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Supplier</button>}
      />
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} searchValue={search} onSearch={setSearch} />

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Supplier' : 'Add Supplier'} size="md"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending} className="btn-primary">Save Supplier</button></>}
      >
        <form className="space-y-4">
          <FormField label="Supplier / Company Name" error={errors.name?.message} required>
            <input {...register('name')} className="input" placeholder="e.g. Al-Falah Bearings Co." />
          </FormField>
          <FormRow>
            <FormField label="Contact Person">
              <input {...register('contact')} className="input" placeholder="Contact name" />
            </FormField>
            <FormField label="Phone">
              <input {...register('phone')} className="input" placeholder="0300-0000000" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
            </FormField>
            <FormField label="Status">
              <select {...register('status')} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </FormRow>
          <FormField label="Address">
            <textarea {...register('address')} rows={2} className="input resize-none" placeholder="City, Province" />
          </FormField>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} title="Delete Supplier" message={`Delete "${deleteItem?.name}"?`} />
    </div>
  )
}
