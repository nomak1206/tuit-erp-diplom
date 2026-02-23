/**
 * React Query hooks for all API modules.
 * Full CRUD: query + create + update + delete for every entity.
 * Cross-module cache invalidation ensures dashboards stay in sync.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './client'

// ---------- Helper: invalidate multiple query keys at once ----------
const invalidateMany = (qc: ReturnType<typeof useQueryClient>, keys: string[][]) => {
    keys.forEach(k => qc.invalidateQueries({ queryKey: k }))
}

// ==================== Analytics / Dashboard ====================

export const useDashboardKPIs = () =>
    useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
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

export const useUserActivities = (userId?: number) =>
    useQuery({
        queryKey: ['users', 'activities', userId],
        queryFn: () => api.get(`/users/${userId}/activities`).then(r => r.data),
        enabled: !!userId,
    })

// ==================== Notifications ====================

export const useNotifications = () =>
    useQuery({
        queryKey: ['notifications'],
        queryFn: () => api.get('/notifications/').then(r => r.data),
        refetchInterval: 30000, // auto refetch every 30s
    })

export const useMarkNotificationRead = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.put(`/notifications/${id}/read`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    })
}

export const useMarkAllNotificationsRead = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: () => api.put('/notifications/read-all').then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    })
}

export const useContact = (id: number) =>
    useQuery({
        queryKey: ['crm', 'contacts', id],
        queryFn: () => api.get(`/crm/contacts/${id}`).then(r => r.data),
        enabled: !!id,
    })

export const useCreateContact = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/crm/contacts', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'contacts'],
            ['dashboard', 'kpis'],
            ['analytics', 'sales'],
        ]),
    })
}

export const useUpdateContact = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/crm/contacts/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'contacts'],
            ['accounting', 'invoices'], // invoices reference contact name
        ]),
    })
}

export const useDeleteContact = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/crm/contacts/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'contacts'],
            ['crm', 'deals'],        // deals FK → contacts (SET NULL)
            ['crm', 'activities'],    // activities FK → contacts (SET NULL)
            ['accounting', 'invoices'], // invoices FK → contacts (SET NULL)
            ['crm', 'pipeline'],
            ['dashboard', 'kpis'],
            ['analytics', 'sales'],
        ]),
    })
}

export const useLeads = () =>
    useQuery({
        queryKey: ['crm', 'leads'],
        queryFn: () => api.get('/crm/leads').then(r => r.data),
    })

export const useLead = (id: number) =>
    useQuery({
        queryKey: ['crm', 'leads', id],
        queryFn: () => api.get(`/crm/leads/${id}`).then(r => r.data),
        enabled: !!id,
    })

export const useCreateLead = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/crm/leads', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'leads'],
            ['crm', 'pipeline'],
            ['dashboard', 'kpis'],
            ['analytics', 'sales'],
        ]),
    })
}

export const useUpdateLead = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/crm/leads/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'leads'],
            ['crm', 'pipeline'],
            ['analytics', 'sales'],
        ]),
    })
}

export const useDeleteLead = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/crm/leads/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'leads'],
            ['crm', 'deals'],     // deals FK → leads (SET NULL)
            ['crm', 'activities'],
            ['crm', 'pipeline'],
            ['dashboard', 'kpis'],
            ['analytics', 'sales'],
        ]),
    })
}

export const useDeals = () =>
    useQuery({
        queryKey: ['crm', 'deals'],
        queryFn: () => api.get('/crm/deals').then(r => r.data),
    })

export const useDeal = (id: number) =>
    useQuery({
        queryKey: ['crm', 'deals', id],
        queryFn: () => api.get(`/crm/deals/${id}`).then(r => r.data),
        enabled: !!id,
    })

export const useCreateDeal = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/crm/deals', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'deals'],
            ['crm', 'leads'],      // lead status may change after conversion
            ['crm', 'pipeline'],
            ['dashboard', 'kpis'],
            ['analytics', 'sales'],
        ]),
    })
}

export const useUpdateDeal = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/crm/deals/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'deals'],
            ['crm', 'pipeline'],
            ['dashboard', 'kpis'],
            ['analytics', 'sales'],
        ]),
    })
}

export const useDeleteDeal = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/crm/deals/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'deals'],
            ['crm', 'activities'],
            ['crm', 'pipeline'],
            ['dashboard', 'kpis'],
            ['analytics', 'sales'],
        ]),
    })
}

export const usePipelineStats = () =>
    useQuery({
        queryKey: ['crm', 'pipeline'],
        queryFn: () => api.get('/crm/pipeline/stats').then(r => r.data),
    })

export const useActivities = () =>
    useQuery({
        queryKey: ['crm', 'activities'],
        queryFn: () => api.get('/crm/activities').then(r => r.data),
    })

export const useCreateActivity = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/crm/activities', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['crm', 'activities'],
            ['dashboard', 'kpis'],
        ]),
    })
}

// ==================== Accounting ====================

export const useChartOfAccounts = () =>
    useQuery({
        queryKey: ['accounting', 'accounts'],
        queryFn: () => api.get('/accounting/accounts').then(r => r.data),
    })

export const useCreateAccount = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/accounting/accounts', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'accounts'],
            ['accounting', 'summary'],
        ]),
    })
}

export const useUpdateAccount = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/accounting/accounts/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'accounts'],
            ['accounting', 'summary'],
        ]),
    })
}

export const useDeleteAccount = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/accounting/accounts/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'accounts'],
            ['accounting', 'journal'], // journal lines reference accounts (RESTRICT, but UI should refresh)
            ['accounting', 'summary'],
        ]),
    })
}

export const useJournalEntries = () =>
    useQuery({
        queryKey: ['accounting', 'journal'],
        queryFn: () => api.get('/accounting/journal').then(r => r.data),
    })

export const useCreateJournalEntry = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/accounting/journal', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'journal'],
            ['accounting', 'accounts'],  // balances change
            ['accounting', 'summary'],   // financial summary changes
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useDeleteJournalEntry = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/accounting/journal/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'journal'],
            ['accounting', 'accounts'],
            ['accounting', 'summary'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useInvoices = () =>
    useQuery({
        queryKey: ['accounting', 'invoices'],
        queryFn: () => api.get('/accounting/invoices').then(r => r.data),
    })

export const useCreateInvoice = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/accounting/invoices', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'invoices'],
            ['accounting', 'summary'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useUpdateInvoice = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/accounting/invoices/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'invoices'],
            ['accounting', 'summary'],  // status change affects totals
            ['dashboard', 'kpis'],      // overdue count may change
        ]),
    })
}

export const useDeleteInvoice = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/accounting/invoices/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'invoices'],
            ['accounting', 'payments'],
            ['accounting', 'summary'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const usePayments = () =>
    useQuery({
        queryKey: ['accounting', 'payments'],
        queryFn: () => api.get('/accounting/payments').then(r => r.data),
    })

export const useCreatePayment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/accounting/payments', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'payments'],
            ['accounting', 'invoices'],  // payment affects invoice status
            ['accounting', 'summary'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useFinancialSummary = () =>
    useQuery({
        queryKey: ['accounting', 'summary'],
        queryFn: () => api.get('/accounting/reports/summary').then(r => r.data),
    })

// ==================== HR ====================

export const useDepartments = () =>
    useQuery({
        queryKey: ['hr', 'departments'],
        queryFn: () => api.get('/hr/departments').then(r => r.data),
    })

export const useCreateDepartment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/hr/departments', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'departments'],
            ['hr', 'stats'],
        ]),
    })
}

export const useEmployees = () =>
    useQuery({
        queryKey: ['hr', 'employees'],
        queryFn: () => api.get('/hr/employees').then(r => r.data),
    })

export const useEmployee = (id: number) =>
    useQuery({
        queryKey: ['hr', 'employees', id],
        queryFn: () => api.get(`/hr/employees/${id}`).then(r => r.data),
        enabled: !!id,
    })

export const useCreateEmployee = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/hr/employees', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'employees'],
            ['hr', 'departments'],   // department employee count changes
            ['hr', 'stats'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useUpdateEmployee = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/hr/employees/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'employees'],
            ['hr', 'departments'],
            ['hr', 'stats'],
        ]),
    })
}

export const useDeleteEmployee = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/hr/employees/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'employees'],
            ['hr', 'departments'],
            ['hr', 'payroll'],     // CASCADE deletes payroll entries
            ['hr', 'leaves'],      // CASCADE deletes leaves
            ['hr', 'stats'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const usePayroll = () =>
    useQuery({
        queryKey: ['hr', 'payroll'],
        queryFn: () => api.get('/hr/payroll').then(r => r.data),
    })

export const useCalculatePayroll = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/hr/payroll/calculate', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'payroll'],
            ['hr', 'stats'],
            ['accounting', 'summary'], // payroll affects financial summary
        ]),
    })
}

export const useLeaves = () =>
    useQuery({
        queryKey: ['hr', 'leaves'],
        queryFn: () => api.get('/hr/leaves').then(r => r.data),
    })

export const useCreateLeave = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/hr/leaves', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'leaves'],
            ['hr', 'employees'],  // employee status may change to on_leave
            ['hr', 'stats'],
        ]),
    })
}

export const useHrStats = () =>
    useQuery({
        queryKey: ['hr', 'stats'],
        queryFn: () => api.get('/hr/stats').then(r => r.data),
    })

// ==================== Warehouse ====================

export const useCategories = () =>
    useQuery({
        queryKey: ['warehouse', 'categories'],
        queryFn: () => api.get('/warehouse/categories').then(r => r.data),
    })

export const useCreateCategory = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/warehouse/categories', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['warehouse', 'categories'],
        ]),
    })
}

export const useProducts = () =>
    useQuery({
        queryKey: ['warehouse', 'products'],
        queryFn: () => api.get('/warehouse/products').then(r => r.data),
    })

export const useProduct = (id: number) =>
    useQuery({
        queryKey: ['warehouse', 'products', id],
        queryFn: () => api.get(`/warehouse/products/${id}`).then(r => r.data),
        enabled: !!id,
    })

export const useCreateProduct = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/warehouse/products', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['warehouse', 'products'],
            ['warehouse', 'categories'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useUpdateProduct = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/warehouse/products/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['warehouse', 'products'],
            ['warehouse', 'stock-report'],
        ]),
    })
}

export const useDeleteProduct = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/warehouse/products/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['warehouse', 'products'],
            ['warehouse', 'movements'],    // movements reference product (RESTRICT)
            ['warehouse', 'stock-report'],
            ['warehouse', 'categories'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useWarehouses = () =>
    useQuery({
        queryKey: ['warehouse', 'warehouses'],
        queryFn: () => api.get('/warehouse/warehouses').then(r => r.data),
    })

export const useStockMovements = () =>
    useQuery({
        queryKey: ['warehouse', 'movements'],
        queryFn: () => api.get('/warehouse/movements').then(r => r.data),
    })

export const useCreateMovement = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/warehouse/movements', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['warehouse', 'movements'],
            ['warehouse', 'stock-report'],
            ['warehouse', 'products'],   // product stock levels change
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useDeleteMovement = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/warehouse/movements/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['warehouse', 'movements'],
            ['warehouse', 'stock-report'],
            ['warehouse', 'products'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useStockReport = () =>
    useQuery({
        queryKey: ['warehouse', 'stock-report'],
        queryFn: () => api.get('/warehouse/stock/report').then(r => r.data),
    })

// ==================== Projects ====================

export const useProjects = () =>
    useQuery({
        queryKey: ['projects'],
        queryFn: () => api.get('/projects/').then(r => r.data),
    })

export const useProject = (id: number) =>
    useQuery({
        queryKey: ['projects', id],
        queryFn: () => api.get(`/projects/${id}`).then(r => r.data),
        enabled: !!id,
    })

export const useCreateProject = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/projects/', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['projects'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useUpdateProject = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/projects/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['projects'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useDeleteProject = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/projects/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['projects'],
            ['projects', 'tasks'],  // CASCADE deletes tasks
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useTasks = (projectId?: number) =>
    useQuery({
        queryKey: ['projects', 'tasks', projectId],
        queryFn: () => api.get('/projects/tasks/all', { params: projectId ? { project_id: projectId } : {} }).then(r => r.data),
    })

export const useCreateTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/projects/tasks', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['projects', 'tasks'],
            ['projects'],           // project progress may change
            ['dashboard', 'kpis'],  // pending_tasks count changes
        ]),
    })
}

export const useUpdateTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/projects/tasks/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['projects', 'tasks'],
            ['projects'],           // project progress recalculated
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useDeleteTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/projects/tasks/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['projects', 'tasks'],
            ['projects'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useTaskComments = (taskId: number) =>
    useQuery({
        queryKey: ['projects', 'tasks', taskId, 'comments'],
        queryFn: () => api.get(`/projects/tasks/${taskId}/comments`).then(r => r.data),
        enabled: !!taskId,
    })

export const useCreateComment = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ taskId, ...data }: any) => api.post(`/projects/tasks/${taskId}/comments`, data).then(r => r.data),
        onSuccess: (_d: any, vars: any) => qc.invalidateQueries({ queryKey: ['projects', 'tasks', vars.taskId, 'comments'] }),
    })
}

// ==================== Documents ====================

export const useDocuments = (params?: { doc_type?: string; status?: string }) =>
    useQuery({
        queryKey: ['documents', params],
        queryFn: () => api.get('/documents/', { params }).then(r => r.data),
    })

export const useDocument = (id: number) =>
    useQuery({
        queryKey: ['documents', id],
        queryFn: () => api.get(`/documents/${id}`).then(r => r.data),
        enabled: !!id,
    })

export const useCreateDocument = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/documents/', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['documents'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useUpdateDocument = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/documents/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['documents'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useDeleteDocument = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/documents/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['documents'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useDocumentStats = () =>
    useQuery({
        queryKey: ['documents', 'stats'],
        queryFn: () => api.get('/documents/stats/summary').then(r => r.data),
    })

export const useDocTemplates = () =>
    useQuery({
        queryKey: ['documents', 'templates'],
        queryFn: () => api.get('/documents/templates').then(r => r.data),
    })

// ==================== HR: Holidays, Schedules, Vacation ====================

export const useHolidays = () =>
    useQuery({
        queryKey: ['hr', 'holidays'],
        queryFn: () => api.get('/hr/holidays').then(r => r.data),
    })

export const useSchedules = () =>
    useQuery({
        queryKey: ['hr', 'schedules'],
        queryFn: () => api.get('/hr/schedules').then(r => r.data),
    })

export const useCreateSchedule = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/hr/schedules', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['hr', 'schedules'] }),
    })
}

export const useCalculatePayrollAll = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/hr/payroll/calculate-all', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'payroll'],
            ['hr', 'stats'],
            ['dashboard', 'kpis'],
        ]),
    })
}

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
            api.post('/auth/login', data).then(r => r.data),
    })

export const useUpdateProfile = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.patch('/auth/me', data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'me'] }),
    })
}

// ==================== Month Close (1С) ====================

export const useCloseMonth = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/accounting/close-month', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['accounting', 'closed-months'],
            ['accounting', 'journal'],
            ['accounting', 'accounts'],
            ['accounting', 'summary'],
            ['accounting', 'trial-balance'],
            ['dashboard', 'kpis'],
        ]),
    })
}

export const useClosedMonths = () =>
    useQuery({
        queryKey: ['accounting', 'closed-months'],
        queryFn: () => api.get('/accounting/closed-months').then(r => r.data),
    })

// ==================== Trial Balance (ОСВ) ====================

export const useTrialBalance = () =>
    useQuery({
        queryKey: ['accounting', 'trial-balance'],
        queryFn: () => api.get('/accounting/trial-balance').then(r => r.data),
    })

// ==================== Staffing Table ====================

export const useStaffing = () =>
    useQuery({
        queryKey: ['hr', 'staffing'],
        queryFn: () => api.get('/hr/staffing').then(r => r.data),
    })

export const useStaffingSummary = () =>
    useQuery({
        queryKey: ['hr', 'staffing', 'summary'],
        queryFn: () => api.get('/hr/staffing/summary').then(r => r.data),
    })

export const useCreateStaffing = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/hr/staffing', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'staffing'],
        ]),
    })
}

export const useUpdateStaffing = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...data }: any) => api.patch(`/hr/staffing/${id}`, data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'staffing'],
        ]),
    })
}

export const useDeleteStaffing = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => api.delete(`/hr/staffing/${id}`).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['hr', 'staffing'],
        ]),
    })
}

// ==================== Inventory ====================

export const useInventories = () =>
    useQuery({
        queryKey: ['warehouse', 'inventory'],
        queryFn: () => api.get('/warehouse/inventory').then(r => r.data),
    })

export const useCreateInventory = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => api.post('/warehouse/inventory', data).then(r => r.data),
        onSuccess: () => invalidateMany(qc, [
            ['warehouse', 'inventory'],
            ['warehouse', 'movements'],
            ['warehouse', 'products'],
            ['warehouse', 'stock-report'],
        ]),
    })
}

