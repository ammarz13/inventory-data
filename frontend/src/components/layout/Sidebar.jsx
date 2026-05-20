import { NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { setSidebarMobile, selectSidebarOpen } from '../../store/uiSlice'
import { selectUser } from '../../store/authSlice'
import {
  HomeIcon, CubeIcon, BanknotesIcon, ShoppingCartIcon,
  UserGroupIcon, DocumentChartBarIcon, Cog6ToothIcon,
  ChevronDownIcon, ChevronRightIcon, WrenchScrewdriverIcon,
  TagIcon, TruckIcon, UsersIcon, ReceiptPercentIcon,
  ClipboardDocumentListIcon, BuildingStorefrontIcon,
  ArrowsRightLeftIcon, CurrencyDollarIcon, CalendarDaysIcon,
  PresentationChartLineIcon, XMarkIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const nav = [
  { label: 'Dashboard', icon: HomeIcon, to: '/dashboard' },
  {
    label: 'Inventory',
    icon: CubeIcon,
    children: [
      { label: 'Machines', icon: WrenchScrewdriverIcon, to: '/inventory/machines' },
      { label: 'Machine Parts', icon: CubeIcon, to: '/inventory/parts' },
      { label: 'Categories', icon: TagIcon, to: '/inventory/categories' },
      { label: 'Suppliers', icon: TruckIcon, to: '/inventory/suppliers' },
    ],
  },
  {
    label: 'Cash Flow',
    icon: BanknotesIcon,
    children: [
      { label: 'Parties / Clients', icon: UsersIcon, to: '/cashflow/parties' },
      { label: 'Transactions', icon: ArrowsRightLeftIcon, to: '/cashflow/transactions' },
      { label: 'Invoices', icon: ReceiptPercentIcon, to: '/cashflow/invoices' },
    ],
  },
  {
    label: 'Retail Stock',
    icon: BuildingStorefrontIcon,
    children: [
      { label: 'Products', icon: ShoppingCartIcon, to: '/retail/products' },
      { label: 'Sales', icon: CurrencyDollarIcon, to: '/retail/sales' },
      { label: 'Purchases', icon: ClipboardDocumentListIcon, to: '/retail/purchases' },
    ],
  },
  {
    label: 'Employees',
    icon: UserGroupIcon,
    children: [
      { label: 'Employee Profiles', icon: UsersIcon, to: '/employees' },
      { label: 'Salaries', icon: BanknotesIcon, to: '/employees/salaries' },
      { label: 'Attendance', icon: CalendarDaysIcon, to: '/employees/attendance' },
    ],
  },
  { label: 'Expenses', icon: DocumentChartBarIcon, to: '/expenses' },
  { label: 'Reports', icon: PresentationChartLineIcon, to: '/reports' },
  { label: 'Settings', icon: Cog6ToothIcon, to: '/settings' },
]

function NavGroup({ item }) {
  const location = useLocation()
  const isActive = item.children?.some((c) => location.pathname.startsWith(c.to))
  const [open, setOpen] = useState(isActive)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'sidebar-link w-full justify-between',
          isActive && 'text-slate-900 dark:text-slate-100'
        )}
      >
        <span className="flex items-center gap-3">
          <item.icon className="w-5 h-5 shrink-0" />
          <span>{item.label}</span>
        </span>
        {open ? (
          <ChevronDownIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
      </button>
      {open && (
        <div className="mt-1 ml-4 pl-3 border-l border-slate-200 dark:border-slate-700 space-y-0.5">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                clsx('sidebar-link', isActive && 'active')
              }
            >
              <child.icon className="w-4 h-4 shrink-0" />
              <span>{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ mobile = false }) {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <CubeIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">InvenPro</span>
        </div>
        {mobile && (
          <button
            onClick={() => dispatch(setSidebarMobile(false))}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {nav.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
