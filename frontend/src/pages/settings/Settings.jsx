import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import FormField, { FormRow } from '../../components/common/FormField'
import { selectUser } from '../../store/authSlice'
import { selectTheme, setTheme } from '../../store/uiSlice'
import {
  UserCircleIcon, BellIcon, ShieldCheckIcon, Cog6ToothIcon,
  MoonIcon, SunIcon, ComputerDesktopIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
  { id: 'appearance', label: 'Appearance', icon: ComputerDesktopIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  { id: 'system', label: 'System', icon: Cog6ToothIcon },
]

export default function Settings() {
  const user = useSelector(selectUser)
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('profile')
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name, email: user?.email, phone: '', company: 'InvenPro Inc.', currency: 'PKR', timezone: 'Asia/Karachi' } })

  const onSaveProfile = (data) => toast.success('Profile updated!')
  const onChangePassword = () => toast.success('Password changed!')

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and application preferences" breadcrumbs={[{ label: 'Settings' }]} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 shrink-0">
          <div className="card p-2">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={clsx('sidebar-link w-full mb-0.5', activeTab === tab.id && 'active')}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card space-y-6">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Profile Information</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                <FormRow>
                  <FormField label="Full Name">
                    <input {...register('name')} className="input" />
                  </FormField>
                  <FormField label="Email Address">
                    <input {...register('email')} type="email" className="input" />
                  </FormField>
                </FormRow>
                <FormRow>
                  <FormField label="Phone">
                    <input {...register('phone')} className="input" placeholder="0300-0000000" />
                  </FormField>
                  <FormField label="Company">
                    <input {...register('company')} className="input" />
                  </FormField>
                </FormRow>
                <FormRow>
                  <FormField label="Currency">
                    <select {...register('currency')} className="input">
                      <option value="PKR">PKR — Pakistani Rupee</option>
                      <option value="USD">USD — US Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                    </select>
                  </FormField>
                  <FormField label="Timezone">
                    <select {...register('timezone')} className="input">
                      <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </FormField>
                </FormRow>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="card space-y-6">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Appearance</h2>
              <div>
                <p className="label mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: SunIcon },
                    { value: 'dark', label: 'Dark', icon: MoonIcon },
                    { value: 'system', label: 'System', icon: ComputerDesktopIcon },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => dispatch(setTheme(opt.value === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : opt.value))}
                      className={clsx('flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors', theme === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600')}
                    >
                      <opt.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Notification Preferences</h2>
              {[
                { label: 'Low stock alerts', desc: 'Get notified when items fall below minimum quantity', defaultChecked: true },
                { label: 'Payment reminders', desc: 'Remind me of pending/overdue payments', defaultChecked: true },
                { label: 'Salary due alerts', desc: 'Alert when payroll is due', defaultChecked: false },
                { label: 'New expense entries', desc: 'Notify on large expense entries', defaultChecked: false },
                { label: 'Daily summary', desc: 'Receive a daily business summary email', defaultChecked: true },
              ].map((n) => (
                <label key={n.label} className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={n.defaultChecked} className="mt-0.5 w-4 h-4 rounded text-primary-600 border-slate-300 dark:border-slate-600 shrink-0" />
                </label>
              ))}
              <div className="flex justify-end">
                <button onClick={() => toast.success('Preferences saved!')} className="btn-primary">Save Preferences</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Change Password</h2>
              <div className="space-y-4">
                <FormField label="Current Password">
                  <input type="password" className="input" placeholder="••••••••" />
                </FormField>
                <FormField label="New Password">
                  <input type="password" className="input" placeholder="••••••••" />
                </FormField>
                <FormField label="Confirm New Password">
                  <input type="password" className="input" placeholder="••••••••" />
                </FormField>
                <div className="flex justify-end">
                  <button onClick={onChangePassword} className="btn-primary">Update Password</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">System Settings</h2>
              <div className="space-y-4">
                {[
                  { label: 'Company Name', value: 'InvenPro Inc.' },
                  { label: 'Company Address', value: 'Lahore, Punjab, Pakistan' },
                  { label: 'Tax Number (NTN)', value: '1234567-8' },
                  { label: 'Financial Year Start', value: 'July' },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-48 shrink-0">{s.label}</span>
                    <input className="input flex-1" defaultValue={s.value} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => toast.success('Settings saved!')} className="btn-primary">Save System Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
