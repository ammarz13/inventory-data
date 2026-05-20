import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import api from '../../services/api'
import StatCard from '../../components/common/StatCard'
import PageHeader from '../../components/common/PageHeader'
import { StatCardSkeleton } from '../../components/common/Skeleton'
import Badge from '../../components/common/Badge'
import { currency, formatDate } from '../../utils/formatters'
import {
  CubeIcon, BanknotesIcon, ShoppingCartIcon,
  UserGroupIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon,
  CurrencyDollarIcon, ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

// Fallback demo data
const DEMO = {
  stats: {
    total_machines: 142, machines_trend: 5,
    total_parts: 1840, parts_trend: 12,
    monthly_revenue: 485000, revenue_trend: 8.4,
    monthly_expenses: 128000, expenses_trend: -3.2,
    cash_in: 620000, cash_out: 135000,
    total_employees: 28, employees_trend: 0,
    low_stock_count: 14, pending_payments: 7,
  },
  revenueChart: [
    { month: 'Jan', revenue: 380000, expenses: 105000 },
    { month: 'Feb', revenue: 420000, expenses: 115000 },
    { month: 'Mar', revenue: 460000, expenses: 120000 },
    { month: 'Apr', revenue: 410000, expenses: 112000 },
    { month: 'May', revenue: 485000, expenses: 128000 },
    { month: 'Jun', revenue: 530000, expenses: 132000 },
  ],
  salesChart: [
    { day: 'Mon', sales: 42000 },
    { day: 'Tue', sales: 58000 },
    { day: 'Wed', sales: 35000 },
    { day: 'Thu', sales: 67000 },
    { day: 'Fri', sales: 72000 },
    { day: 'Sat', sales: 89000 },
    { day: 'Sun', sales: 24000 },
  ],
  inventoryPie: [
    { name: 'In Stock', value: 72, color: '#10b981' },
    { name: 'Low Stock', value: 18, color: '#f59e0b' },
    { name: 'Out of Stock', value: 10, color: '#ef4444' },
  ],
  recentTransactions: [
    { id: 1, party: 'Al-Falah Traders', type: 'credit', amount: 45000, date: '2026-05-18', status: 'paid' },
    { id: 2, party: 'Metro Supplies', type: 'debit', amount: 18500, date: '2026-05-17', status: 'paid' },
    { id: 3, party: 'TechParts Ltd', type: 'credit', amount: 72000, date: '2026-05-16', status: 'pending' },
    { id: 4, party: 'City Hardware', type: 'debit', amount: 9200, date: '2026-05-15', status: 'paid' },
    { id: 5, party: 'Pak Industrial', type: 'credit', amount: 31000, date: '2026-05-14', status: 'unpaid' },
  ],
  lowStockItems: [
    { id: 1, name: 'Motor Bearing 6205', sku: 'MB-6205', qty: 3, min_qty: 10 },
    { id: 2, name: 'Hydraulic Seal Kit', sku: 'HSK-001', qty: 1, min_qty: 5 },
    { id: 3, name: 'V-Belt A50', sku: 'VB-A50', qty: 8, min_qty: 20 },
    { id: 4, name: 'Pressure Gauge 100psi', sku: 'PG-100', qty: 2, min_qty: 8 },
  ],
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-semibold">{currency(p.value, '')}</span>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data.data),
    placeholderData: DEMO,
  })

  const d = dashData || DEMO

  const statCards = [
    { title: 'Total Machines', value: d.stats?.total_machines?.toLocaleString(), icon: CubeIcon, color: 'primary', trend: d.stats?.machines_trend, trendLabel: 'this month' },
    { title: 'Spare Parts', value: d.stats?.total_parts?.toLocaleString(), icon: ClipboardDocumentListIcon, color: 'blue', trend: d.stats?.parts_trend, trendLabel: 'this month' },
    { title: 'Monthly Revenue', value: currency(d.stats?.monthly_revenue), icon: ArrowTrendingUpIcon, color: 'green', trend: d.stats?.revenue_trend, trendLabel: 'vs last month' },
    { title: 'Monthly Expenses', value: currency(d.stats?.monthly_expenses), icon: CurrencyDollarIcon, color: 'red', trend: d.stats?.expenses_trend, trendLabel: 'vs last month' },
    { title: 'Cash In', value: currency(d.stats?.cash_in), icon: BanknotesIcon, color: 'cyan', trendLabel: 'this month' },
    { title: 'Cash Out', value: currency(d.stats?.cash_out), icon: BanknotesIcon, color: 'amber', trendLabel: 'this month' },
    { title: 'Employees', value: d.stats?.total_employees, icon: UserGroupIcon, color: 'purple', trend: d.stats?.employees_trend, trendLabel: 'this month' },
    { title: 'Low Stock Alerts', value: d.stats?.low_stock_count, icon: ExclamationTriangleIcon, color: 'red', subtitle: `${d.stats?.pending_payments} pending payments` },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => <StatCard key={card.title} {...card} />)
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Revenue vs Expenses</h3>
            <span className="badge badge-green">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={d.revenueChart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#gRevenue)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#gExpenses)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Status Pie */}
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Inventory Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={d.inventoryPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {d.inventoryPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {d.inventoryPie.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Sales & Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Weekly Sales</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.salesChart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" name="Sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Low Stock Alerts</h3>
          </div>
          <div className="space-y-3">
            {d.lowStockItems?.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-sm font-bold ${item.qty <= 2 ? 'text-red-500' : 'text-amber-500'}`}>{item.qty}</span>
                  <p className="text-xs text-slate-400">min: {item.min_qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Transactions</h3>
          <a href="/cashflow/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100 dark:border-slate-700">
                {['Party / Client', 'Type', 'Amount', 'Date', 'Status'].map((h) => (
                  <th key={h} className="table-header first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
              {d.recentTransactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="table-cell first:pl-0 font-medium">{tx.party}</td>
                  <td className="table-cell">
                    <Badge status={tx.type}>{tx.type === 'credit' ? 'Cash In' : 'Cash Out'}</Badge>
                  </td>
                  <td className={`table-cell font-semibold ${tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{currency(tx.amount)}
                  </td>
                  <td className="table-cell text-slate-500">{formatDate(tx.date)}</td>
                  <td className="table-cell"><Badge status={tx.status}>{tx.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
