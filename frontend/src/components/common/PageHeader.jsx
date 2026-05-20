import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export default function PageHeader({ title, subtitle, breadcrumbs, actions }) {
  return (
    <div className="page-header">
      <div>
        {breadcrumbs && (
          <nav className="flex items-center gap-1 text-xs text-slate-400 mb-2">
            <Link to="/dashboard" className="hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1">
              <HomeIcon className="w-3.5 h-3.5" /> Dashboard
            </Link>
            {breadcrumbs.map((b) => (
              <span key={b.label} className="flex items-center gap-1">
                <ChevronRightIcon className="w-3 h-3" />
                {b.to ? (
                  <Link to={b.to} className="hover:text-slate-600 dark:hover:text-slate-300">{b.label}</Link>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
