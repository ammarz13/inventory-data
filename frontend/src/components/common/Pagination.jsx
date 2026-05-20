import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export default function Pagination({ page, lastPage, total, perPage, onChange }) {
  if (!lastPage || lastPage <= 1) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  const pages = []
  const delta = 2
  for (let i = Math.max(1, page - delta); i <= Math.min(lastPage, page + delta); i++) {
    pages.push(i)
  }
  if (pages[0] > 1) { if (pages[0] > 2) pages.unshift('…'); pages.unshift(1) }
  if (pages[pages.length - 1] < lastPage) {
    if (pages[pages.length - 1] < lastPage - 1) pages.push('…')
    pages.push(lastPage)
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={clsx(
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
