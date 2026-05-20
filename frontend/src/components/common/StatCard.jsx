import clsx from 'clsx'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend, trendLabel }) {
  const colorMap = {
    primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    green:   'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    red:     'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    amber:   'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    blue:    'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple:  'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    cyan:    'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  }

  const isPositive = trend > 0
  const isNegative = trend < 0

  return (
    <div className="stat-card">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', colorMap[color])}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
        {(trend !== undefined || subtitle) && (
          <div className="flex items-center gap-2 mt-1">
            {trend !== undefined && (
              <span className={clsx('flex items-center gap-0.5 text-xs font-medium',
                isPositive && 'text-emerald-600 dark:text-emerald-400',
                isNegative && 'text-red-500 dark:text-red-400',
                !isPositive && !isNegative && 'text-slate-400'
              )}>
                {isPositive ? <ArrowUpIcon className="w-3 h-3" /> : isNegative ? <ArrowDownIcon className="w-3 h-3" /> : null}
                {Math.abs(trend)}%
              </span>
            )}
            {(trendLabel || subtitle) && (
              <span className="text-xs text-slate-400 dark:text-slate-500">{trendLabel || subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
