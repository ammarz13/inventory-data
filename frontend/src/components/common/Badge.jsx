import clsx from 'clsx'
import { statusColor } from '../../utils/formatters'

export default function Badge({ children, variant, status }) {
  const cls = variant ? `badge-${variant}` : status ? statusColor(status) : 'badge-gray'
  return <span className={clsx('badge', cls)}>{children}</span>
}
