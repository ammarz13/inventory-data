import { Outlet } from 'react-router-dom'
import { CubeIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../../hooks/useTheme'

export default function AuthLayout() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">

      {/* ── Left panel ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 flex-col items-center justify-center p-16">

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary-500/10 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
              <CubeIcon className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">InvenPro</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your business,<br />fully in control
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed mb-12">
            Inventory, payroll, cash flow and more — in one elegant dashboard.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center">
            {['Inventory', 'Payroll', 'Cash Flow', 'Reports', 'Retail'].map((f) => (
              <span key={f} className="px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full ring-1 ring-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="absolute bottom-8 text-primary-300 text-sm">
          © {new Date().getFullYear()} InvenPro · All rights reserved
        </p>
      </div>

      {/* ── Right panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <CubeIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white">InvenPro</span>
        </div>

        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
