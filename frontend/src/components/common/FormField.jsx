import clsx from 'clsx'

export default function FormField({ label, error, required, children, hint }) {
  return (
    <div className="form-group">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}

export function FormRow({ children, cols = 2 }) {
  return (
    <div className={clsx('grid gap-4', { 'grid-cols-1 sm:grid-cols-2': cols === 2, 'grid-cols-1 sm:grid-cols-3': cols === 3, 'grid-cols-1': cols === 1 })}>
      {children}
    </div>
  )
}
