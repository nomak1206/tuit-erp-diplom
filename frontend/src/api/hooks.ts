/**
 * React Query hooks for all API modules.
 * These hooks handle data fetching, caching, and state management
 * by connecting to the FastAPI backend.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

// ==================== Analytics / Dashboard ====================

export const useDashboardKPIs = () =>
    useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    })

export const useRevenueChart = () =>
    useQuery({
        queryKey: ['analytics', 'revenue'],
        queryFn: () => api.get('/analytics/revenue-chart').then(r => r.data),
    })

export const useSalesAnalytics = () =>
    useQuery({
        queryKey: ['analytics', 'sales'],
        queryFn: () => api.get('/analytics/sales').then(r => r.data),
    })

// ==================== CRM ====================

export const useContacts = () =>
    useQuery({
        queryKey: ['crm', 'contacts'],
        queryFn: () => api.get('/crm/contacts').then(r => r.data),
    })

export const useLeads = () =>
    useQuery({
        queryKey: ['crm', 'leads'],
        queryFn: () => api.get('/crm/leads').then(r => r.data),
    })

export const useDeals = () =>
    useQuery({
        queryKey: ['crm', 'deals'],
        queryFn: () => api.get('/crm/deals').then(r => r.data),
    })

export const usePipelineStats = () =>
    useQuery({
        queryKey: ['crm', 'pipeline'],
        queryFn: () => api.get('/crm/pipeline-stats').then(r => r.data),
    })

export const useActivities = () =>
    useQuery({
        queryKey: ['crm', 'activities'],
        queryFn: () => api.get('/crm/activities').then(r => r.data),
    })

export const useCreateLead = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/crm/leads', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['crm', 'leads'] }),
    })
}

export const useCreateDeal = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/crm/deals', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['crm', 'deals'] }),
    })
}

// ==================== Accounting ====================

export const useChartOfAccounts = () =>
    useQuery({
        queryKey: ['accounting', 'chart'],
        queryFn: () => api.get('/accounting/accounts').then(r => r.data),
    })

export const useJournalEntries = () =>
    useQuery({
        queryKey: ['accounting', 'journal'],
        queryFn: () => api.get('/accounting/journal').then(r => r.data),
    })

export const useInvoices = () =>
    useQuery({
        queryKey: ['accounting', 'invoices'],
        queryFn: () => api.get('/accounting/invoices').then(r => r.data),
    })

export const usePayments = () =>
    useQuery({
        queryKey: ['accounting', 'payments'],
        queryFn: () => api.get('/accounting/payments').then(r => r.data),
    })

export const useFinancialSummary = () =>
    useQuery({
        queryKey: ['accounting', 'summary'],
        queryFn: () => api.get('/accounting/summary').then(r => r.data),
    })

// ==================== HR ====================

export const useDepartments = () =>
    useQuery({
        queryKey: ['hr', 'departments'],
        queryFn: () => api.get('/hr/departments').then(r => r.data),
    })

export const useEmployees = () =>
    useQuery({
        queryKey: ['hr', 'employees'],
        queryFn: () => api.get('/hr/employees').then(r => r.data),
    })

export const usePayroll = (month?: string, year?: number) =>
    useQuery({
        queryKey: ['hr', 'payroll', month, year],
        queryFn: () => api.get('/hr/payroll', { params: { month, year } }).then(r => r.data),
    })

export const useLeaves = () =>
    useQuery({
        queryKey: ['hr', 'leaves'],
        queryFn: () => api.get('/hr/leaves').then(r => r.data),
    })

export const useHrStats = () =>
    useQuery({
        queryKey: ['hr', 'stats'],
        queryFn: () => api.get('/hr/stats').then(r => r.data),
    })

// ==================== Warehouse ====================

export const useProducts = () =>
    useQuery({
        queryKey: ['warehouse', 'products'],
        queryFn: () => api.get('/warehouse/products').then(r => r.data),
    })

export const useCategories = () =>
    useQuery({
        queryKey: ['warehouse', 'categories'],
        queryFn: () => api.get('/warehouse/categories').then(r => r.data),
    })

export const useStockMovements = () =>
    useQuery({
        queryKey: ['warehouse', 'movements'],
        queryFn: () => api.get('/warehouse/movements').then(r => r.data),
    })

export const useStockReport = () =>
    useQuery({
        queryKey: ['warehouse', 'stock-report'],
        queryFn: () => api.get('/warehouse/stock-report').then(r => r.data),
    })

// ==================== Projects ====================

export const useProjects = () =>
    useQuery({
        queryKey: ['projects'],
        queryFn: () => api.get('/projects/').then(r => r.data),
    })

export const useTasks = (projectId?: number) =>
    useQuery({
        queryKey: ['projects', 'tasks', projectId],
        queryFn: () => api.get('/projects/tasks', { params: { project_id: projectId } }).then(r => r.data),
    })

export const useCreateTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/projects/tasks', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', 'tasks'] }),
    })
}

// ==================== Documents ====================

export const useDocuments = () =>
    useQuery({
        queryKey: ['documents'],
        queryFn: () => api.get('/documents/').then(r => r.data),
    })

export const useDocumentStats = () =>
    useQuery({
        queryKey: ['documents', 'stats'],
        queryFn: () => api.get('/documents/stats').then(r => r.data),
    })

// ==================== Auth ====================

export const useCurrentUser = () =>
    useQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => api.get('/auth/me').then(r => r.data),
        retry: false,
    })

export const useLogin = () =>
    useMutation({
        mutationFn: (data: { username: string; password: string }) =>
            api.post('/auth/login', new URLSearchParams(data)).then(r => r.data),
    })
