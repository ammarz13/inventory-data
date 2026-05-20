# InvenPro — Inventory Management System

A modern, production-ready full-stack ERP/Inventory dashboard built with **React.js + Laravel 12**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, React Query |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Backend | Laravel 12, PHP 8.2+ |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL 8+ |
| Permissions | Spatie Laravel Permission |
| PDF/Excel | jsPDF, XLSX (frontend), DomPDF, Maatwebsite Excel (backend) |

---

## Modules

| Module | Features |
|---|---|
| **Inventory** | Machines, Machine Parts, Low Stock Alerts, Categories, Suppliers |
| **Cash Flow** | Parties/Clients, Credit/Debit Transactions, Invoices, Payment Status |
| **Retail Stock** | Products (SKU/Barcode), Sales Entry, Purchase Orders, Profit Tracking |
| **Employees** | Profiles, Salary Records, Advance/Bonus/Deductions, Attendance, Salary Slips |
| **Expenses** | Categories, Monthly Reports, Excel Export, Charts |
| **Reports** | Revenue vs Expenses, Sales Analytics, Cash Flow Charts, Tabbed Views |
| **Dashboard** | KPI Cards, Area/Bar/Pie Charts, Low Stock Alerts, Recent Transactions |
| **Settings** | Profile, Appearance (Dark/Light), Notifications, Password, System Config |

---

## Quick Start

### Frontend

```bash
cd frontend
npm install
cp .env.example .env       # set VITE_API_URL=http://localhost:8000/api
npm run dev                # runs on http://localhost:3000
```

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configure DB in .env, then:
php artisan migrate
php artisan db:seed        # seeds demo users, categories, and sample data

php artisan serve          # runs on http://localhost:8000
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@invenpro.com | password |
| Manager | manager@invenpro.com | password |
| Employee | employee@invenpro.com | password |

---

## Project Structure

```
inventory-data/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── common/       # Reusable: Modal, DataTable, StatCard, Skeleton…
│       │   ├── layout/       # Sidebar, Navbar, DashboardLayout, AuthLayout
│       │   └── charts/
│       ├── pages/
│       │   ├── auth/         # Login, ForgotPassword
│       │   ├── dashboard/    # Main Dashboard
│       │   ├── inventory/    # Machines, Parts, Categories, Suppliers
│       │   ├── cashflow/     # Parties, Transactions, Invoices
│       │   ├── retail/       # Products, Sales, Purchases
│       │   ├── employees/    # Employees, Salaries, Attendance
│       │   ├── expenses/     # Expense Tracking
│       │   ├── reports/      # Analytics Reports
│       │   └── settings/     # User & System Settings
│       ├── store/            # Redux Toolkit (auth, ui slices)
│       ├── services/         # Axios API client + resource helpers
│       ├── hooks/            # useDebounce, useTheme
│       └── utils/            # formatters, exportHelpers
│
└── backend/
    ├── app/
    │   ├── Http/Controllers/Api/   # AuthController, DashboardController, …
    │   ├── Http/Middleware/        # RoleMiddleware
    │   └── Models/                 # All Eloquent models
    ├── database/
    │   ├── migrations/             # 13 migration files
    │   └── seeders/                # DatabaseSeeder with demo data
    └── routes/
        └── api.php                 # All REST API routes
```

---

## API Endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password

GET    /api/dashboard

GET|POST               /api/machines
GET|PUT|DELETE         /api/machines/{id}

GET|POST               /api/machine-parts
GET|PUT|DELETE         /api/machine-parts/{id}

GET|POST               /api/categories
GET|PUT|DELETE         /api/categories/{id}

GET|POST               /api/suppliers
GET|PUT|DELETE         /api/suppliers/{id}

GET|POST               /api/parties
GET|PUT|DELETE         /api/parties/{id}

GET|POST               /api/cashflows
GET|PUT|DELETE         /api/cashflows/{id}

GET|POST               /api/products
GET|PUT|DELETE         /api/products/{id}

GET|POST               /api/employees
GET|PUT|DELETE         /api/employees/{id}

GET|POST               /api/salaries
GET|PUT|DELETE         /api/salaries/{id}

GET|POST               /api/expenses
GET|PUT|DELETE         /api/expenses/{id}
```

---

## User Roles

- **Admin** — Full access to all modules
- **Manager** — Can manage all modules, cannot delete users
- **Employee** — Read-only access, can record attendance

---

## Key UI Features

- Dark / Light mode toggle (persisted in localStorage)
- Collapsible sidebar on desktop, slide-in drawer on mobile
- Loading skeletons for all data tables
- Toast notifications for all CRUD operations
- Confirm dialogs before destructive actions
- Demo placeholder data when API is unavailable
- Print salary slips directly from browser
- Excel export for expenses and reports

---

*Built with InvenPro © 2026*
