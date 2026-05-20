import { useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import PageHeader from '../../components/common/PageHeader'
import { ArrowDownTrayIcon, PrinterIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { exportToExcel } from '../../utils/exportHelpers'
import toast from 'react-hot-toast'
import { useTheme } from '../../hooks/useTheme'
import clsx from 'clsx'
import {
  BanknotesIcon, CurrencyDollarIcon, ArrowTrendingUpIcon,
  UserGroupIcon, CubeIcon, ShoppingCartIcon,
} from '@heroicons/react/24/outline'

const fmt = (v) => {
  if (v >= 1_000_000) return `PKR ${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000)     return `PKR ${(v / 1_000).toFixed(0)}K`
  return `PKR ${v}`
}

function KpiCard({ title, value, trend, sub, icon: Icon, iconCls }) {
  const up = trend > 0
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">{title}</p>
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconCls)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-none">{value}</p>
      <div className="flex items-center gap-1.5">
        <span className={clsx('inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded',
          up ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
             : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
        )}>
          {up ? <ArrowUpIcon className="w-2.5 h-2.5" /> : <ArrowDownIcon className="w-2.5 h-2.5" />}
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{sub}</span>
      </div>
    </div>
  )
}

const monthlyData = [
  { month: 'Jan', revenue: 380000, expenses: 105000, profit: 275000 },
  { month: 'Feb', revenue: 420000, expenses: 115000, profit: 305000 },
  { month: 'Mar', revenue: 460000, expenses: 120000, profit: 340000 },
  { month: 'Apr', revenue: 410000, expenses: 112000, profit: 298000 },
  { month: 'May', revenue: 485000, expenses: 128000, profit: 357000 },
  { month: 'Jun', revenue: 530000, expenses: 132000, profit: 398000 },
]

const salesData = [
  { category: 'Lubricants', sales: 125000 },
  { category: 'Safety',     sales: 45000  },
  { category: 'Electrical', sales: 78000  },
  { category: 'Fittings',   sales: 32000  },
  { category: 'Tools',      sales: 65000  },
]

const cashflowPie = [
  { name: 'Cash In',  value: 620000, color: '#10b981' },
  { name: 'Cash Out', value: 135000, color: '#ef4444' },
]

const inventoryData = [
  { category: 'Bearings',    inStock: 42, lowStock: 8,  outOfStock: 2  },
  { category: 'Seals',       inStock: 18, lowStock: 5,  outOfStock: 1  },
  { category: 'Belts',       inStock: 30, lowStock: 3,  outOfStock: 0  },
  { category: 'Consumables', inStock: 95, lowStock: 12, outOfStock: 4  },
  { category: 'Tools',       inStock: 27, lowStock: 6,  outOfStock: 1  },
]

const payrollData = [
  { month: 'Jan', salary: 185000, bonus: 12000, total: 197000 },
  { month: 'Feb', salary: 185000, bonus: 8000,  total: 193000 },
  { month: 'Mar', salary: 190000, bonus: 15000, total: 205000 },
  { month: 'Apr', salary: 190000, bonus: 10000, total: 200000 },
  { month: 'May', salary: 195000, bonus: 18000, total: 213000 },
  { month: 'Jun', salary: 195000, bonus: 22000, total: 217000 },
]

const deptData = [
  { dept: 'Production', employees: 12, cost: 98000  },
  { dept: 'Sales',      employees: 5,  cost: 45000  },
  { dept: 'Admin',      employees: 4,  cost: 35000  },
  { dept: 'Warehouse',  employees: 6,  cost: 52000  },
  { dept: 'IT',         employees: 3,  cost: 38000  },
]

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const TABS = ['Overview', 'Sales', 'Cash Flow', 'Inventory', 'Payroll']

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [period, setPeriod] = useState('monthly')
  const { isDark } = useTheme()

  const gridColor  = isDark ? '#334155' : '#e2e8f0'
  const labelColor = isDark ? '#94a3b8' : '#64748b'

  const axisProps = {
    tick: { fontSize: 12, fill: labelColor },
  }

  const handleExport = () => {
    exportToExcel(
      monthlyData.map((d) => ({ Month: d.month, Revenue: d.revenue, Expenses: d.expenses, Profit: d.profit })),
      'report-overview'
    )
    toast.success('Exported!')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business intelligence and performance reports"
        breadcrumbs={[{ label: 'Reports' }]}
        actions={
          <>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input h-9 text-sm w-36">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button onClick={handleExport} className="btn-secondary">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export
            </button>
            <button onClick={() => window.print()} className="btn-secondary">
              <PrinterIcon className="w-4 h-4" /> Print
            </button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Revenue"     value={fmt(485000)}   trend={8.2}  sub="vs last month" icon={ArrowTrendingUpIcon} iconCls="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
        <KpiCard title="Expenses"    value={fmt(128000)}   trend={-3.1} sub="vs last month" icon={CurrencyDollarIcon}  iconCls="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400" />
        <KpiCard title="Net Profit"  value={fmt(357000)}   trend={12.4} sub="vs last month" icon={BanknotesIcon}       iconCls="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" />
        <KpiCard title="Total Sales" value={fmt(345000)}   trend={6.7}  sub="vs last month" icon={ShoppingCartIcon}    iconCls="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <KpiCard title="Payroll"     value={fmt(229000)}   trend={1.8}  sub="vs last month" icon={UserGroupIcon}       iconCls="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <KpiCard title="Stock Value" value={fmt(1240000)}  trend={4.3}  sub="vs last month" icon={CubeIcon}            iconCls="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-1 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-5">Revenue vs Expenses vs Profit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" {...axisProps} axisLine={false} tickLine={false} />
                <YAxis {...axisProps} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(v, name) => [currency(v), name]}
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="revenue"  name="Revenue"  fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
                <Bar dataKey="profit"   name="Profit"   fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-5">Profit Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" {...axisProps} axisLine={false} tickLine={false} />
                <YAxis {...axisProps} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(v) => [currency(v), 'Profit']}
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fill="url(#profitGrad)" dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'Sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-5">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" {...axisProps} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="category" {...axisProps} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  formatter={(v) => [currency(v), 'Sales']}
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="sales" name="Sales" fill="#6366f1" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-5">Sales Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={salesData} dataKey="sales" nameKey="category" cx="50%" cy="46%" outerRadius={110} paddingAngle={3} label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {salesData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  formatter={(v) => [currency(v), 'Sales']}
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cash Flow Tab */}
      {activeTab === 'Cash Flow' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-5">Cash In vs Cash Out</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={cashflowPie} dataKey="value" cx="50%" cy="46%" innerRadius={75} outerRadius={115} paddingAngle={5}>
                  {cashflowPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v) => [currency(v)]}
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card flex flex-col justify-center gap-5">
            {cashflowPie.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: item.color }}>{currency(item.value)}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(item.value / 620000) * 100}%`, background: item.color }} />
                </div>
              </div>
            ))}
            <div className="mt-2 pt-5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Net Balance</span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{currency(485000)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'Inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-5">Stock Levels by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="category" {...axisProps} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: labelColor }} />
                <YAxis {...axisProps} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="inStock"    name="In Stock"     fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="lowStock"   name="Low Stock"    fill="#f59e0b" radius={[4,4,0,0]} />
                <Bar dataKey="outOfStock" name="Out of Stock" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Stock Summary</h3>
            <div className="space-y-3">
              {inventoryData.map((row) => {
                const total = row.inStock + row.lowStock + row.outOfStock
                return (
                  <div key={row.category}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{row.category}</span>
                      <span className="text-slate-500 dark:text-slate-400">{total} items</span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden gap-px">
                      <div className="bg-emerald-500" style={{ width: `${(row.inStock / total) * 100}%` }} />
                      <div className="bg-amber-400"   style={{ width: `${(row.lowStock / total) * 100}%` }} />
                      <div className="bg-red-500"     style={{ width: `${(row.outOfStock / total) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="flex gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />In Stock</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />Low Stock</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />Out of Stock</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === 'Payroll' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-5">Monthly Payroll Cost</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payrollData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" {...axisProps} axisLine={false} tickLine={false} />
                <YAxis {...axisProps} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(v, name) => [currency(v), name]}
                  contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="salary" name="Base Salary" fill="#8b5cf6" radius={[0,0,0,0]} stackId="a" />
                <Bar dataKey="bonus"  name="Bonus"        fill="#a78bfa" radius={[4,4,0,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Cost by Department</h3>
            <div className="space-y-3.5">
              {deptData.map((d) => {
                const maxCost = Math.max(...deptData.map((r) => r.cost))
                return (
                  <div key={d.dept}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{d.dept}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 dark:text-slate-500 text-xs">{d.employees} staff</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{currency(d.cost)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(d.cost / maxCost) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
