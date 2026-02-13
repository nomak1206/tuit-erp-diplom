import { Routes, Route, Navigate } from 'react-router-dom'
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
import HrDashboard from './pages/hr/HrDashboard'
import EmployeesList from './pages/hr/EmployeesList'
import Timesheet from './pages/hr/Timesheet'
import Payroll from './pages/hr/Payroll'
import VacationCalc from './pages/hr/VacationCalc'
import WorkSchedules from './pages/hr/WorkSchedules'
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard'
import ProductsList from './pages/warehouse/ProductsList'
import StockMovements from './pages/warehouse/StockMovements'
import ProjectsDashboard from './pages/projects/ProjectsDashboard'
import TaskBoard from './pages/projects/TaskBoard'
import DocumentsList from './pages/documents/DocumentsList'
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard'
import Settings from './pages/settings/Settings'

function App() {
  return (
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
        {/* HR */}
        <Route path="/hr" element={<HrDashboard />} />
        <Route path="/hr/employees" element={<EmployeesList />} />
        <Route path="/hr/timesheet" element={<Timesheet />} />
        <Route path="/hr/payroll" element={<Payroll />} />
        <Route path="/hr/vacations" element={<VacationCalc />} />
        <Route path="/hr/schedules" element={<WorkSchedules />} />
        {/* Warehouse */}
        <Route path="/warehouse" element={<WarehouseDashboard />} />
        <Route path="/warehouse/products" element={<ProductsList />} />
        <Route path="/warehouse/movements" element={<StockMovements />} />
        {/* Projects */}
        <Route path="/projects" element={<ProjectsDashboard />} />
        <Route path="/projects/board" element={<TaskBoard />} />
        {/* Documents */}
        <Route path="/documents" element={<DocumentsList />} />
        {/* Analytics */}
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
