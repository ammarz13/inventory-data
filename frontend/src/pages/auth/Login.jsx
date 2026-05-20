import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, selectAuthLoading } from '../../store/authSlice'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import FormField from '../../components/common/FormField'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})

export default function Login() {
  const dispatch = useDispatch()
  const loading = useSelector(selectAuthLoading)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@invenpro.com', password: 'password', remember: false },
  })

  const onSubmit = (data) => dispatch(loginUser(data))

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to your InvenPro account</p>

      <form onSubmit={handleSubmit(onSubmit)} method="post" className="mt-8 space-y-5">
        <FormField label="Email address" error={errors.email?.message} required>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="admin@invenpro.com"
              className="input pl-9"
            />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="input pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('remember')} type="checkbox" className="w-4 h-4 rounded text-primary-600 border-slate-300 dark:border-slate-600" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in…
            </span>
          ) : 'Sign in'}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-2">Demo credentials</p>
        <p className="text-xs text-primary-600 dark:text-primary-400">admin@invenpro.com / password</p>
      </div>
    </div>
  )
}
