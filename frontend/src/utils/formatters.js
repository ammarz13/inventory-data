import { format, parseISO, formatDistanceToNow } from 'date-fns'

export const currency = (amount, symbol = 'PKR') =>
  `${symbol} ${Number(amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '—'
  try { return format(typeof date === 'string' ? parseISO(date) : date, fmt) } catch { return '—' }
}

export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, hh:mm a')

export const timeAgo = (date) => {
  if (!date) return '—'
  try { return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true }) } catch { return '—' }
}

export const truncate = (str, len = 30) =>
  str && str.length > len ? `${str.slice(0, len)}…` : (str || '—')

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

export const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')

export const statusColor = (status) => ({
  active: 'badge-green',
  inactive: 'badge-gray',
  pending: 'badge-yellow',
  paid: 'badge-green',
  unpaid: 'badge-red',
  partial: 'badge-yellow',
  credit: 'badge-blue',
  debit: 'badge-red',
  in_stock: 'badge-green',
  low_stock: 'badge-yellow',
  out_of_stock: 'badge-red',
  maintenance: 'badge-yellow',
  received: 'badge-green',
  present: 'badge-green',
  absent: 'badge-red',
  half_day: 'badge-yellow',
  leave: 'badge-blue',
  on_leave: 'badge-blue',
  cancelled: 'badge-red',
  approved: 'badge-green',
  rejected: 'badge-red',
}[status?.toLowerCase()] || 'badge-gray')

export const pluralize = (count, word) =>
  `${count} ${word}${count !== 1 ? 's' : ''}`
