import {
  ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import Skeleton from './Skeleton'
import Pagination from './Pagination'
import clsx from 'clsx'

export default function DataTable({
  columns,
  data = [],
  loading = false,
  pagination,
  onPageChange,
  onSort,
  sortBy,
  sortDir,
  searchValue,
  onSearch,
  filters,
  emptyMessage = 'No records found',
  stickyHeader = false,
}) {
  const SortIcon = ({ col }) => {
    if (!col.sortable) return null
    if (sortBy === col.key) {
      return sortDir === 'asc'
        ? <ChevronUpIcon className="w-3.5 h-3.5" />
        : <ChevronDownIcon className="w-3.5 h-3.5" />
    }
    return <ChevronUpDownIcon className="w-3.5 h-3.5 text-slate-300" />
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Toolbar */}
      {(onSearch || filters) && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100 dark:border-slate-700">
          {onSearch && (
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search…"
                className="input pl-9 h-9 text-sm"
              />
            </div>
          )}
          {filters && <div className="flex gap-2 flex-wrap">{filters}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={clsx('bg-slate-50 dark:bg-slate-800/60', stickyHeader && 'sticky top-0 z-10')}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx('table-header select-none', col.sortable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700')}
                  onClick={() => col.sortable && onSort?.(col.key)}
                  style={{ width: col.width }}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="table-cell">
                        <Skeleton className="h-4 rounded" style={{ width: col.skeletonWidth || '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              )
              : data.map((row, i) => (
                  <tr key={row.id ?? i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="table-cell">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700">
          <Pagination {...pagination} onChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
