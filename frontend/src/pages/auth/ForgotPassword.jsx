import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, selectAuthLoading } from '../../store/authSlice'
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import FormField from '../../components/common/FormField'

const schema = z.object({ email: z.string().email('Enter a valid email address') })

export default function ForgotPassword() {
  const dispatch = useDispatch()
  const loading = useSelector(selectAuthLoading)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    const result = await dispatch(forgotPassword(data.email))
    if (!result.error) setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Check your email</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          We've sent a password reset link to your email address. It may take a few minutes to arrive.
        </p>
        <Link to="/login" className="btn-primary inline-flex mt-6">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link to="/login" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6">
        <ArrowLeftIcon className="w-4 h-4" /> Back to login
      </Link>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot password?</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <FormField label="Email address" error={errors.email?.message} required>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input {...register('email')} type="email" placeholder="you@example.com" className="input pl-9" />
          </div>
        </FormField>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base">
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </div>
  )
}
