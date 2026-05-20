import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, PhoneIcon } from '@heroicons/react/24/outline'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import FormField, { FormRow } from '../../components/common/FormField'
import Badge from '../../components/common/Badge'
import { resources } from '../../services/api'
import { currency, formatDate, initials } from '../../utils/formatters'
import { useDebounce } from '../../hooks/useDebounce'

const schema = z.object({
  name:        z.string().min(2),
  email:       z.string().email().optional().or(z.literal('')),
  phone:       z.string().optional(),
  department:  z.string().optional(),
  position:    z.string().min(2, 'Position is required'),
  salary:      z.coerce.number().min(0),
  join_date:   z.string().min(1, 'Join date is required'),
  status:      z.enum(['active', 'inactive', 'on_leave']),
  cnic:        z.string().optional(),
  address:     z.string().optional(),
})

const DEMO = {
  data: [
    { id: 1, name: 'Muhammad Bilal', position: 'Senior Technician', department: 'Maintenance', phone: '0300-1111222', salary: 55000, join_date: '2022-03-15', status: 'active' },
    { id: 2, name: 'Fatima Zahra', position: 'Accountant', department: 'Finance', phone: '0321-3334444', salary: 45000, join_date: '2023-01-10', status: 'active' },
    { id: 3, name: 'Ahmed Raza', position: 'Warehouse Manager', department: 'Operations', phone: '0333-5556666', salary: 60000, join_date: '2021-07-01', status: 'active' },
    { id: 4, name: 'Sara Khan', position: 'HR Executive', department: 'HR', phone: '0345-7778888', salary: 42000, join_date: '2023-06-15', status: 'on_leave' },
    { id: 5, name: 'Usman Tariq', position: 'Machine Operator', department: 'Production', phone: '0311-9990000', salary: 35000, join_date: '2024-02-01', status: 'active' },
  ],
  meta: { current_page: 1, last_page: 1, total: 5, per_page: 15 },
}

const statusColor = { active: 'green', inactive: 'red', on_leave: 'yellow' }

export default function Employees() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const dSearch = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ['employees', dSearch],
    queryFn: () => resources.employees.list({ search: dSearch }).then((r) => r.data),
    placeholderData: DEMO,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status: 'active' } })

  const saveMutation = useMutation({
    mutationFn: (d) => editItem ? resources.employees.update(editItem.id, d) : resources.employees.create(d),
    onSuccess: () => { toast.success('Employee saved!'); qc.invalidateQueries(['employees']); closeModal() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => resources.employees.remove(id),
    onSuccess: () => { toast.success('Employee removed'); qc.invalidateQueries(['employees']); setDeleteItem(null) },
  })

  const openCreate = () => { setEditItem(null); reset({ status: 'active' }); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset(item); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditItem(null) }

  const columns = [
    { key: 'name', label: 'Employee', render: (v) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-bold shrink-0">
          {initials(v)}
        </div>
        <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span>
      </div>
    )},
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'phone', label: 'Phone', render: (v) => v ? <a href={`tel:${v}`} className="flex items-center gap-1 text-primary-600 hover:underline text-xs"><PhoneIcon className="w-3.5 h-3.5" />{v}</a> : '—' },
    { key: 'salary', label: 'Salary', render: (v) => <span className="font-semibold">{currency(v)}</span> },
    { key: 'join_date', label: 'Joined', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={statusColor[v]}>{v.replace('_', ' ')}</Badge> },
    { key: 'actions', label: '', width: 90, render: (_, row) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"><PencilIcon className="w-4 h-4" /></button>
        <button onClick={() => setDeleteItem(row)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><TrashIcon className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" subtitle="Manage employee profiles and information" breadcrumbs={[{ label: 'Employees' }]}
        actions={<button onClick={openCreate} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Employee</button>}
      />
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} searchValue={search} onSearch={setSearch} />

      <Modal open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Employee' : 'Add Employee'} size="lg"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending} className="btn-primary">Save Employee</button></>}
      >
        <form className="space-y-4">
          <FormRow>
            <FormField label="Full Name" error={errors.name?.message} required>
              <input {...register('name')} className="input" />
            </FormField>
            <FormField label="Phone">
              <input {...register('phone')} className="input" placeholder="0300-0000000" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" className="input" />
            </FormField>
            <FormField label="CNIC">
              <input {...register('cnic')} className="input" placeholder="35201-0000000-0" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Position" error={errors.position?.message} required>
              <input {...register('position')} className="input" />
            </FormField>
            <FormField label="Department">
              <input {...register('department')} className="input" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Monthly Salary (PKR)" error={errors.salary?.message} required>
              <input {...register('salary')} type="number" min="0" className="input" />
            </FormField>
            <FormField label="Join Date" error={errors.join_date?.message} required>
              <input {...register('join_date')} type="date" className="input" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Status">
              <select {...register('status')} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </FormField>
          </FormRow>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} title="Remove Employee" message={`Remove "${deleteItem?.name}" from the system?`} />
    </div>
  )
}
