import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
  Bars3Icon, BellIcon, MagnifyingGlassIcon,
  SunIcon, MoonIcon, ArrowRightOnRectangleIcon,
  UserCircleIcon, Cog6ToothIcon, ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import { toggleSidebar, setSidebarMobile } from '../../store/uiSlice'
import { logoutUser, selectUser } from '../../store/authSlice'
import { useTheme } from '../../hooks/useTheme'
import clsx from 'clsx'

const iconBtn = 'p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <header className="h-16 flex items-center gap-3 px-4 shrink-0 sticky top-0 z-30
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
      border-b border-slate-200/60 dark:border-slate-700/60">

      {/* Sidebar toggles */}
      <motion.button whileTap={{ scale: 0.92 }}
        onClick={() => dispatch(toggleSidebar())}
        className={clsx(iconBtn, 'hidden lg:flex')}>
        <Bars3Icon className="w-5 h-5" />
      </motion.button>
      <motion.button whileTap={{ scale: 0.92 }}
        onClick={() => dispatch(setSidebarMobile(true))}
        className={clsx(iconBtn, 'flex lg:hidden')}>
        <Bars3Icon className="w-5 h-5" />
      </motion.button>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="search"
            placeholder="Search…"
            className="w-full h-9 pl-9 pr-4 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent
              focus:border-primary-400 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700
              text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500
              outline-none transition-all duration-200"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">

        {/* Theme toggle */}
        <motion.button whileTap={{ scale: 0.92 }} onClick={toggleTheme} className={iconBtn}>
          {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </motion.button>

        {/* Notifications */}
        <motion.button whileTap={{ scale: 0.92 }} className={clsx(iconBtn, 'relative')}>
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
          </span>
        </motion.button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User menu */}
        <Menu as="div" className="relative">
          <Menu.Button as={motion.button} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary-500/30">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role}</p>
            </div>
            <ChevronUpDownIcon className="w-4 h-4 text-slate-400 hidden md:block" />
          </Menu.Button>

          <Transition as={Fragment}
            enter="transition ease-out duration-150" enterFrom="opacity-0 translate-y-1 scale-95" enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-100" leaveFrom="opacity-100 translate-y-0 scale-100" leaveTo="opacity-0 translate-y-1 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right
              bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60
              border border-slate-200 dark:border-slate-700 py-2 focus:outline-none z-50 overflow-hidden">

              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="py-1 px-2">
                {[
                  { icon: UserCircleIcon, label: 'Profile', action: () => navigate('/settings') },
                  { icon: Cog6ToothIcon,  label: 'Settings', action: () => navigate('/settings') },
                ].map(({ icon: Icon, label, action }) => (
                  <Menu.Item key={label}>
                    {({ active }) => (
                      <button onClick={action}
                        className={clsx(
                          'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors',
                          active ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'
                        )}>
                        <Icon className="w-4 h-4 text-slate-400" />
                        {label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 py-1 px-2">
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={handleLogout}
                      className={clsx(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors text-red-600 dark:text-red-400',
                        active && 'bg-red-50 dark:bg-red-900/20'
                      )}>
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  )
}
