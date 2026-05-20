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

const schema = z.object({
  name:    z.string().min(2),
  type:    z.enum(['client', 'vendor', 'both']),
  phone:   z.string().optional(),
  email:   z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  opening_balance: z.coerce.number().default(0),
  balance_type:    z.enum(['credit', 'debit']).default('credit'),
})

const DEMO = {
  data: [
    { id: 1, name: 'Al-Falah Traders', type: 'client', phone: '0300-1234567', balance: 125000, balance_type: 'credit', total_transactions: 28 },
    { id: 2, name: 'Metro Supplies', type: 'vendor', phone: '0321-9876543', balance: 45000, balance_type: 'debit', total_transactions: 15 },
    { id: 3, name: 'TechParts Ltd', type: 'both', phone: '0333-5554444', balance: 72000, balance_type: 'credit', total_transactions: 42 },
    { id: 4, name: 'City Hardware', type: 'vendor', phone: '0345-1112222', balance: 0, balance_type: 'credit', total_transactions: 7 },
    { id: 5, name: 'Pak Industrial', type: 'client', phone: '0311-3334444', balance: 31000, balance_type: 'debit', total_transactions: 19 },
  ],
  meta: { current_page: 1, last_page: 1, total: 5, per_page: 15 },
}

export default function Parties() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['parties', search],
    queryFn: () => resources.parties.list({ search }).then((r) => r.data),
    placeholderData: DEMO,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { type: 'client', balance_type: 'credit', opening_balance: 0 } })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? resources.parties.update(editItem.id, d) : resources.parties.create(d),
    onSuccess: () => { toast.success('Party saved!'); qc.invalidateQueries(['parties']); closeModal() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => resources.parties.remove(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['parties']); setDeleteItem(null) },
  })

  const openCreate = () => { setEditItem(null); reset({ type: 'client', balance_type: 'credit', opening_balance: 0 }); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset(item); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const typeColor = { client: 'green', vendor: 'blue', both: 'purple' }

  const columns = [
    { key: 'name', label: 'Party Name', sortable: true, render: (v) => <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span> },
    { key: 'type', label: 'Type', render: (v) => <Badge variant={typeColor[v]}>{v}</Badge> },
    { key: 'phone', label: 'Phone' },
    { key: 'total_transactions', label: 'Transactions', render: (v) => <span className="font-semibold">{v || 0}</span> },
    { key: 'balance', label: 'Balance', render: (v, row) => (
      <span className={`font-semibold ${row.balance_type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
        {row.balance_type === 'credit' ? '+' : '-'}{currency(v)}
      </span>
    )},
    { key: 'actions', label: '', width: 90, render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><PencilIcon className="w-4 h-4" /></button>
        <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><TrashIcon className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Parties / Clients" subtitle="Manage clients and vendor accounts" breadcrumbs={[{ label: 'Cash Flow' }, { label: 'Parties' }]}
        actions={<button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Party</button>}
      />
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} searchValue={search} onSearch={setSearch} />

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Party' : 'Add Party/Client'} size="md"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending} className="btn-primary">Save</button></>}
      >
        <form className="space-y-4">
          <FormRow>
            <FormField label="Name" error={errors.name?.message} required>
              <input {...register('name')} className="input" placeholder="Party / Company name" />
            </FormField>
            <FormField label="Type" required>
              <select {...register('type')} className="input">
                <option value="client">Client</option>
                <option value="vendor">Vendor</option>
                <option value="both">Both</option>
              </select>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Phone">
              <input {...register('phone')} className="input" placeholder="0300-0000000" />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" className="input" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Opening Balance (PKR)">
              <input {...register('opening_balance')} type="number" min="0" className="input" placeholder="0" />
            </FormField>
            <FormField label="Balance Type">
              <select {...register('balance_type')} className="input">
                <option value="credit">Credit (receivable)</option>
                <option value="debit">Debit (payable)</option>
              </select>
            </FormField>
          </FormRow>
          <FormField label="Address">
            <textarea {...register('address')} rows={2} className="input resize-none" />
          </FormField>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} title="Delete Party" message={`Delete "${deleteItem?.name}"?`} />
    </div>
  )
}
