import { Routes, Route } from 'react-router-dom'
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
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard'
import ProductsList from './pages/warehouse/ProductsList'
import StockMovements from './pages/warehouse/StockMovements'
import ProjectsList from './pages/projects/ProjectsList'
import TaskBoard from './pages/projects/TaskBoard'
import DocumentsList from './pages/documents/DocumentsList'
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard'
import Settings from './pages/settings/Settings'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/crm" element={<CrmDashboard />} />
        <Route path="/crm/leads" element={<LeadsList />} />
        <Route path="/crm/deals" element={<DealsPipeline />} />
        <Route path="/crm/contacts" element={<ContactsList />} />
        <Route path="/accounting" element={<AccountingDashboard />} />
        <Route path="/accounting/chart" element={<ChartOfAccounts />} />
        <Route path="/accounting/journal" element={<JournalEntries />} />
        <Route path="/accounting/invoices" element={<Invoices />} />
        <Route path="/hr" element={<HrDashboard />} />
        <Route path="/hr/employees" element={<EmployeesList />} />
        <Route path="/hr/timesheet" element={<Timesheet />} />
        <Route path="/hr/payroll" element={<Payroll />} />
        <Route path="/warehouse" element={<WarehouseDashboard />} />
        <Route path="/warehouse/products" element={<ProductsList />} />
        <Route path="/warehouse/movements" element={<StockMovements />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/tasks" element={<TaskBoard />} />
        <Route path="/documents" element={<DocumentsList />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppLayout>
  )
}

export default App
