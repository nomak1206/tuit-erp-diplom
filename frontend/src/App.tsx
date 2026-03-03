import { Routes, Route, Navigate } from 'react-router-dom'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import CrmDashboard from './pages/crm/CrmDashboard'
import LeadsList from './pages/crm/LeadsList'
import DealsPipeline from './pages/crm/DealsPipeline'
import ContactsList from './pages/crm/ContactsList'
import ActivitiesList from './pages/crm/ActivitiesList'
import AccountingDashboard from './pages/accounting/AccountingDashboard'
import ChartOfAccounts from './pages/accounting/ChartOfAccounts'
import JournalEntries from './pages/accounting/JournalEntries'
import Invoices from './pages/accounting/Invoices'
import PaymentsList from './pages/accounting/PaymentsList'
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

import { useState, useEffect } from 'react'
import api from './api/client'

// ─── Private Route Guard ──────────────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    api.get('/auth/me')
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
  }, [])

  if (isAuthenticated === null) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}

// ─── Login Page ─────────────────────────────────────────────────────────────
function LoginPage() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/auth/me')
      .then(() => nav('/', { replace: true }))
      .catch(() => setCheckingAuth(false))
  }, [nav])

  if (checkingAuth) return null

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/login', values)
      window.location.href = '/'
    } catch (err: any) {
      setError(err?.response?.data?.detail || t('common.login_error', 'Неверный логин или пароль'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ width: 380, padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>ERP/CRM System</h2>
        {error && <div style={{ color: '#ff4d4f', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          handleLogin({ username: fd.get('username') as string, password: fd.get('password') as string })
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>{t('common.username', 'Имя пользователя')}</label>
            <input name="username" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d9d9d9', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>{t('common.password', 'Пароль')}</label>
            <input name="password" type="password" required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d9d9d9', boxSizing: 'border-box' }} />
          </div>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            {t('common.login', 'Войти')}
          </Button>
        </form>
      </div>
    </div>
  )
}

// ─── 404 Page ─────────────────────────────────────────────────────────────────
function NotFoundPage() {
  const nav = useNavigate()
  const { t } = useTranslation()
  return (
    <Result
      status="404"
      title="404"
      subTitle={t('common.page_not_found')}
      extra={<Button type="primary" onClick={() => nav('/')}>{t('common.back_to_home')}</Button>}
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
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              {/* CRM */}
              <Route path="/crm" element={<CrmDashboard />} />
              <Route path="/crm/leads" element={<LeadsList />} />
              <Route path="/crm/deals" element={<DealsPipeline />} />
              <Route path="/crm/contacts" element={<ContactsList />} />
              <Route path="/crm/activities" element={<ActivitiesList />} />
              {/* Accounting */}
              <Route path="/accounting" element={<AccountingDashboard />} />
              <Route path="/accounting/chart" element={<ChartOfAccounts />} />
              <Route path="/accounting/journal" element={<JournalEntries />} />
              <Route path="/accounting/invoices" element={<Invoices />} />
              <Route path="/accounting/payments" element={<PaymentsList />} />
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
