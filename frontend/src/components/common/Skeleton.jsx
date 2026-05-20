import clsx from 'clsx'

export default function Skeleton({ className, ...props }) {
  return <div className={clsx('skeleton rounded-md', className)} {...props} />
}

export function StatCardSkeleton() {
  return (
    <div className="card flex items-start gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <Skeleton className="h-9 w-64 rounded-lg" />
      </div>
      <table className="w-full">
        <thead className="bg-slate-50 dark:bg-slate-800/60">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="table-header">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri}>
              {Array.from({ length: cols }).map((_, ci) => (
                <td key={ci} className="table-cell">
                  <Skeleton className="h-4" style={{ width: `${60 + Math.random() * 30}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
