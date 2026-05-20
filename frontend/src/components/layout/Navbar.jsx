import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon, BellIcon, MagnifyingGlassIcon,
  SunIcon, MoonIcon, ArrowRightOnRectangleIcon,
  UserCircleIcon, Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { toggleSidebar, setSidebarMobile, selectTheme } from '../../store/uiSlice'
import { logoutUser, selectUser } from '../../store/authSlice'
import { useTheme } from '../../hooks/useTheme'
import clsx from 'clsx'

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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 px-4 shrink-0 sticky top-0 z-30">
      {/* Toggle sidebar (desktop) */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Toggle sidebar (mobile) */}
      <button
        onClick={() => dispatch(setSidebarMobile(true))}
        className="flex lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search anything…"
            className="input pl-9 bg-slate-50 dark:bg-slate-800/50 h-9 text-sm"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-none">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">{user?.role}</p>
            </div>
          </Menu.Button>
          <Transition as={Fragment}
            enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 focus:outline-none z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              {[
                { icon: UserCircleIcon, label: 'Profile', action: () => navigate('/settings') },
                { icon: Cog6ToothIcon, label: 'Settings', action: () => navigate('/settings') },
              ].map(({ icon: Icon, label, action }) => (
                <Menu.Item key={label}>
                  {({ active }) => (
                    <button onClick={action} className={clsx('w-full flex items-center gap-3 px-4 py-2 text-sm', active ? 'bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300')}>
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  )}
                </Menu.Item>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={handleLogout} className={clsx('w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400', active && 'bg-red-50 dark:bg-red-900/20')}>
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
