import { Outlet } from 'react-router-dom'
import { CubeIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../../hooks/useTheme'

export default function AuthLayout() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-slate-100 via-primary-50 to-slate-200 dark:from-slate-950 dark:via-primary-950 dark:to-slate-900 p-6">

      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-400/20 dark:bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg">
            <CubeIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">InvenPro</span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/80 dark:shadow-slate-900/80 p-8 ring-1 ring-slate-200 dark:ring-slate-700">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
