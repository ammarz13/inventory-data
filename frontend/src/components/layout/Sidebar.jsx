import { NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { setSidebarMobile } from '../../store/uiSlice'
import { selectUser } from '../../store/authSlice'
import {
  HomeIcon, CubeIcon, BanknotesIcon, ShoppingCartIcon,
  UserGroupIcon, DocumentChartBarIcon, Cog6ToothIcon,
  ChevronDownIcon, WrenchScrewdriverIcon,
  TagIcon, TruckIcon, UsersIcon, ReceiptPercentIcon,
  ClipboardDocumentListIcon, BuildingStorefrontIcon,
  ArrowsRightLeftIcon, CurrencyDollarIcon, CalendarDaysIcon,
  PresentationChartLineIcon, XMarkIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const sections = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: HomeIcon, to: '/dashboard' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      {
        label: 'Inventory',
        icon: CubeIcon,
        children: [
          { label: 'Machines',      icon: WrenchScrewdriverIcon, to: '/inventory/machines' },
          { label: 'Machine Parts', icon: CubeIcon,              to: '/inventory/parts' },
          { label: 'Categories',    icon: TagIcon,               to: '/inventory/categories' },
          { label: 'Suppliers',     icon: TruckIcon,             to: '/inventory/suppliers' },
        ],
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      {
        label: 'Cash Flow',
        icon: BanknotesIcon,
        children: [
          { label: 'Parties',       icon: UsersIcon,              to: '/cashflow/parties' },
          { label: 'Transactions',  icon: ArrowsRightLeftIcon,    to: '/cashflow/transactions' },
          { label: 'Invoices',      icon: ReceiptPercentIcon,     to: '/cashflow/invoices' },
        ],
      },
      {
        label: 'Retail Stock',
        icon: BuildingStorefrontIcon,
        children: [
          { label: 'Products',  icon: ShoppingCartIcon,         to: '/retail/products' },
          { label: 'Sales',     icon: CurrencyDollarIcon,       to: '/retail/sales' },
          { label: 'Purchases', icon: ClipboardDocumentListIcon, to: '/retail/purchases' },
        ],
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        label: 'Employees',
        icon: UserGroupIcon,
        children: [
          { label: 'Profiles',    icon: UsersIcon,         to: '/employees' },
          { label: 'Salaries',    icon: BanknotesIcon,     to: '/employees/salaries' },
          { label: 'Attendance',  icon: CalendarDaysIcon,  to: '/employees/attendance' },
        ],
      },
      { label: 'Expenses', icon: DocumentChartBarIcon, to: '/expenses' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Reports',  icon: PresentationChartLineIcon, to: '/reports' },
      { label: 'Settings', icon: Cog6ToothIcon,             to: '/settings' },
    ],
  },
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
          'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-white/10 text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        )}
      >
        <span className="flex items-center gap-3">
          <span className={clsx('p-1 rounded-lg', isActive ? 'bg-white/10' : 'bg-white/5')}>
            <item.icon className="w-4 h-4" />
          </span>
          {item.label}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="w-3.5 h-3.5 opacity-60" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-1 ml-3 pl-3 border-l border-white/10 space-y-0.5 pb-1">
              {item.children.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-gradient-to-r from-primary-500/20 to-indigo-500/20 text-primary-300 border border-primary-500/20'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                  )}
                >
                  <child.icon className="w-3.5 h-3.5 shrink-0" />
                  {child.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Sidebar({ mobile = false }) {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  return (
    <aside className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 w-64 shrink-0">

      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <CubeIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">InvenPro</span>
        </div>
        {mobile && (
          <button onClick={() => dispatch(setSidebarMobile(false))}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600 select-none">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) =>
                item.children ? (
                  <NavGroup key={item.label} item={item} />
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/25'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={clsx('p-1 rounded-lg shrink-0', isActive ? 'bg-white/20' : 'bg-white/5')}>
                          <item.icon className="w-4 h-4" />
                        </span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-primary-500/30">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'admin'}</p>
          </div>
          <Cog6ToothIcon className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
        </div>
      </div>
    </aside>
  )
}
