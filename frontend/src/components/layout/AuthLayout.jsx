import { Outlet } from 'react-router-dom'
import { CubeIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../../hooks/useTheme'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function AuthLayout() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 p-6">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <CubeIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">InvenPro</span>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
