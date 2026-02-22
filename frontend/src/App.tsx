import { Routes, Route, Navigate } from 'react-router-dom'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import CrmDashboard from './pages/crm/CrmDashboard'
import LeadsList from './pages/crm/LeadsList'
import DealsPipeline from './pages/crm/DealsPipeline'
import ContactsList from './pages/crm/ContactsList'
import AccountingDashboard from './pages/accounting/AccountingDashboard'
import ChartOfAccounts from './pages/accounting/ChartOfAccounts'
import JournalEntries from './pages/accounting/JournalEntries'
import Invoices from './pages/accounting/Invoices'
import MonthClose from './pages/accounting/MonthClose'
import TrialBalance from './pages/accounting/TrialBalance'
import HrDashboard from './pages/hr/HrDashboard'
import EmployeesList from './pages/hr/EmployeesList'
import Timesheet from './pages/hr/Timesheet'
import Payroll from './pages/hr/Payroll'
import VacationCalc from './pages/hr/VacationCalc'
import WorkSchedules from './pages/hr/WorkSchedules'
import StaffingTable from './pages/hr/StaffingTable'
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard'
import ProductsList from './pages/warehouse/ProductsList'
import StockMovements from './pages/warehouse/StockMovements'
import InventoryCheck from './pages/warehouse/InventoryCheck'
import ProjectsDashboard from './pages/projects/ProjectsDashboard'
import ProjectsList from './pages/projects/ProjectsList'
import TaskBoard from './pages/projects/TaskBoard'
import DocumentsList from './pages/documents/DocumentsList'
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard'
import Settings from './pages/settings/Settings'
import NotificationCenter from './pages/notifications/NotificationCenter'

// ─── Private Route Guard ──────────────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ─── Login Page (demo auto-login) ─────────────────────────────────────────────
function LoginPage() {
  const nav = useNavigate()
  if (localStorage.getItem('access_token')) return <Navigate to="/" replace />
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Result
        status="403"
        title="Требуется авторизация"
        subTitle="Войдите в систему, чтобы продолжить."
        extra={
          <Button type="primary" size="large" onClick={() => {
            fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: 'admin', password: 'admin123' })
            }).then(r => r.json()).then(d => {
              if (d.access_token) {
                localStorage.setItem('access_token', d.access_token)
                if (d.refresh_token) localStorage.setItem('refresh_token', d.refresh_token)
                nav('/')
              }
            })
          }}>Войти как Admin</Button>
        }
      />
    </div>
  )
}

// ─── 404 Page ─────────────────────────────────────────────────────────────────
function NotFoundPage() {
  const nav = useNavigate()
  return (
    <Result
      status="404"
      title="404"
      subTitle="Страница не найдена."
      extra={<Button type="primary" onClick={() => nav('/')}>На главную</Button>}
    />
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={
        <PrivateRoute>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* CRM */}
              <Route path="/crm" element={<CrmDashboard />} />
              <Route path="/crm/leads" element={<LeadsList />} />
              <Route path="/crm/deals" element={<DealsPipeline />} />
              <Route path="/crm/contacts" element={<ContactsList />} />
              {/* Accounting */}
              <Route path="/accounting" element={<AccountingDashboard />} />
              <Route path="/accounting/chart" element={<ChartOfAccounts />} />
              <Route path="/accounting/journal" element={<JournalEntries />} />
              <Route path="/accounting/invoices" element={<Invoices />} />
              <Route path="/accounting/month-close" element={<MonthClose />} />
              <Route path="/accounting/trial-balance" element={<TrialBalance />} />
              {/* HR */}
              <Route path="/hr" element={<HrDashboard />} />
              <Route path="/hr/employees" element={<EmployeesList />} />
              <Route path="/hr/timesheet" element={<Timesheet />} />
              <Route path="/hr/payroll" element={<Payroll />} />
              <Route path="/hr/vacations" element={<VacationCalc />} />
              <Route path="/hr/schedules" element={<WorkSchedules />} />
              <Route path="/hr/staffing" element={<StaffingTable />} />
              {/* Warehouse */}
              <Route path="/warehouse" element={<WarehouseDashboard />} />
              <Route path="/warehouse/products" element={<ProductsList />} />
              <Route path="/warehouse/movements" element={<StockMovements />} />
              <Route path="/warehouse/inventory" element={<InventoryCheck />} />
              {/* Projects */}
              <Route path="/projects" element={<ProjectsDashboard />} />
              <Route path="/projects/list" element={<ProjectsList />} />
              <Route path="/projects/board" element={<TaskBoard />} />
              {/* Documents */}
              <Route path="/documents" element={<DocumentsList />} />
              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              {/* Notifications */}
              <Route path="/notifications" element={<NotificationCenter />} />
              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppLayout>
        </PrivateRoute>
      } />
    </Routes>
  )
}

export default App
