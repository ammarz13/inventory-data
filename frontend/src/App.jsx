import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import DashboardLayout from './components/layout/DashboardLayout'
import AuthLayout from './components/layout/AuthLayout'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard from './pages/dashboard/Dashboard'
import Machines from './pages/inventory/Machines'
import MachineParts from './pages/inventory/MachineParts'
import Categories from './pages/inventory/Categories'
import Suppliers from './pages/inventory/Suppliers'
import Parties from './pages/cashflow/Parties'
import Transactions from './pages/cashflow/Transactions'
import Invoices from './pages/cashflow/Invoices'
import Products from './pages/retail/Products'
import Sales from './pages/retail/Sales'
import Purchases from './pages/retail/Purchases'
import Employees from './pages/employees/Employees'
import Salaries from './pages/employees/Salaries'
import Attendance from './pages/employees/Attendance'
import Expenses from './pages/expenses/Expenses'
import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'
import { selectIsAuthenticated } from './store/authSlice'

function PrivateRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      </Route>

      <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/inventory/machines" element={<Machines />} />
        <Route path="/inventory/parts" element={<MachineParts />} />
        <Route path="/inventory/categories" element={<Categories />} />
        <Route path="/inventory/suppliers" element={<Suppliers />} />

        <Route path="/cashflow/parties" element={<Parties />} />
        <Route path="/cashflow/transactions" element={<Transactions />} />
        <Route path="/cashflow/invoices" element={<Invoices />} />

        <Route path="/retail/products" element={<Products />} />
        <Route path="/retail/sales" element={<Sales />} />
        <Route path="/retail/purchases" element={<Purchases />} />

        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/salaries" element={<Salaries />} />
        <Route path="/employees/attendance" element={<Attendance />} />

        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
