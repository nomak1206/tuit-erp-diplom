import { Row, Col, Spin, Card, Statistic, List, Tag, Avatar, Badge, Divider } from 'antd'
import { DollarOutlined, TeamOutlined, ShoppingCartOutlined, FileTextOutlined, ProjectOutlined, RiseOutlined, WalletOutlined, ClockCircleOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useContacts, useLeads, useDeals, useEmployees, useProducts, useProjects, useDocuments, useInvoices, useLeaves } from '../api/hooks'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']
const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function Dashboard() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { data: contacts = [], isLoading: cl } = useContacts()
    const { data: leads = [] } = useLeads()
    const { data: deals = [], isLoading: dl } = useDeals()
    const { data: employees = [] } = useEmployees()
    const { data: products = [] } = useProducts()
    const { data: projects = [] } = useProjects()
    const { data: documents = [] } = useDocuments()
    const { data: invoices = [] } = useInvoices()
    const { data: leaves = [] } = useLeaves()

    if (cl || dl) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const totalRevenue = invoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + (i.total_amount || 0), 0)
    const pipelineValue = deals.filter((d: any) => !['won', 'lost'].includes(d.stage)).reduce((s: number, d: any) => s + (d.amount || 0), 0)
    const totalSalary = employees.reduce((s: number, e: any) => s + (e.salary || 0), 0)
    const activeEmployees = employees.filter((e: any) => e.status === 'active').length
    const pendingLeaves = leaves.filter((l: any) => l.status === 'pending').length

    const revenueChart = [
        { month: t('dashboard.months.jan'), value: totalRevenue * 0.08 },
        { month: t('dashboard.months.feb'), value: totalRevenue * 0.12 },
        { month: t('dashboard.months.mar'), value: totalRevenue * 0.10 },
        { month: t('dashboard.months.apr'), value: totalRevenue * 0.15 },
        { month: t('dashboard.months.may'), value: totalRevenue * 0.18 },
        { month: t('dashboard.months.jun'), value: totalRevenue * 0.14 },
        { month: t('dashboard.months.jul'), value: totalRevenue * 0.23 },
    ]

    const moduleData = [
        { name: t('dashboard.modules.contacts'), value: contacts.length },
        { name: t('dashboard.modules.leads'), value: leads.length },
        { name: t('dashboard.modules.deals'), value: deals.length },
        { name: t('dashboard.modules.employees'), value: employees.length },
        { name: t('dashboard.modules.products'), value: products.length },
        { name: t('dashboard.modules.documents'), value: documents.length },
    ]

    const kpis = [
        { title: t('dashboard.revenue', 'Daromad'), value: `${(totalRevenue / 1e6).toFixed(1)}M`, suffix: 'UZS', icon: <DollarOutlined />, color: '#6366f1', path: '/accounting/invoices' },
        { title: t('dashboard.pipeline', 'Savdo voronkasi'), value: `${(pipelineValue / 1e6).toFixed(1)}M`, suffix: 'UZS', icon: <RiseOutlined />, color: '#8b5cf6', path: '/crm/deals' },
        { title: t('dashboard.employees', 'Xodimlar'), value: activeEmployees, suffix: `/ ${employees.length}`, icon: <TeamOutlined />, color: '#22c55e', path: '/hr' },
        { title: t('dashboard.payroll', 'Ish haqi fondi'), value: `${(totalSalary / 1e6).toFixed(1)}M`, suffix: 'UZS', icon: <WalletOutlined />, color: '#ec4899', path: '/hr/payroll' },
    ]

    /* Multi-type activity feed */
    const activityFeed: any[] = []

    leaves.slice(0, 2).forEach((l: any) => activityFeed.push({
        id: `leave-${l.id}`, icon: <CalendarOutlined style={{ color: '#f97316' }} />,
        title: `${l.employee_name || t('dashboard.employees')} — ${l.leave_type === 'vacation' ? t('dashboard.vacation') : l.leave_type === 'sick' ? t('dashboard.sick') : t('dashboard.dayoff')}`,
        desc: `${l.start_date || ''} – ${l.end_date || ''}`,
        tag: l.status === 'approved' ? <Tag color="green">{t('dashboard.approved')}</Tag> : l.status === 'pending' ? <Tag color="orange">{t('dashboard.pending')}</Tag> : <Tag>{l.status}</Tag>,
    }))

    deals.slice(0, 2).forEach((d: any) => activityFeed.push({
        id: `deal-${d.id}`, icon: <RiseOutlined style={{ color: '#6366f1' }} />,
        title: `${t('dashboard.deal_prefix')}: ${d.title || d.name || '—'}`,
        desc: `${(d.amount || 0).toLocaleString('ru-RU')} UZS`,
        tag: d.stage === 'won' ? <Tag color="green">{t('dashboard.won')}</Tag> : d.stage === 'lost' ? <Tag color="red">{t('dashboard.lost')}</Tag> : <Tag color="blue">{d.stage}</Tag>,
    }))

    invoices.filter((i: any) => i.status === 'sent' || i.status === 'overdue').slice(0, 2).forEach((inv: any) => activityFeed.push({
        id: `inv-${inv.id}`, icon: <FileTextOutlined style={{ color: '#f43f5e' }} />,
        title: `${t('dashboard.invoice_prefix')}${inv.invoice_number || inv.id}`,
        desc: `${inv.client_name || t('deals.client')} — ${(inv.total_amount || 0).toLocaleString('ru-RU')} UZS`,
        tag: <Tag color="orange">{t('dashboard.unpaid')}</Tag>,
    }))

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{t('dashboard.title', 'Boshqaruv paneli')}</h1><p>{t('dashboard.subtitle', 'Tizimning umumiy ko\'rinishi')}</p></div>
            <Row gutter={[16, 16]}>
                {kpis.map(k => (
                    <Col xs={12} lg={6} key={k.title}>
                        <Card hoverable onClick={() => navigate(k.path)} style={{ cursor: 'pointer', borderLeft: `3px solid ${k.color}` }}>
                            <Statistic title={k.title} value={k.value} suffix={<span style={{ fontSize: 12, color: '#64748b' }}>{k.suffix}</span>} prefix={<span style={{ color: k.color }}>{k.icon}</span>} />
                        </Card>
                    </Col>
                ))}
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={14}>
                    <Card title={t('dashboard.revenue_by_month', 'Oylar bo\'yicha daromad')} extra={<a onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }}>{t('dashboard.analytics_link', 'Analitika →')}</a>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueChart}><CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" /><XAxis dataKey="month" tick={{ fill: 'var(--chart-label)' }} /><YAxis tick={{ fill: 'var(--chart-label)' }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} /><Tooltip formatter={(v: number) => `${fmt(v)} UZS`} /><defs><linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs><Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#colorGrad)" strokeWidth={2} /></AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title={t('dashboard.system_modules', 'Tizim modullari')} extra={<a onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }}>{t('dashboard.details_link', 'Tafsilotlar →')}</a>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart><Pie data={moduleData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value">
                                {moduleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /><Legend verticalAlign="bottom" height={36} /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={14}>
                    <Row gutter={[16, 16]}>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/crm')} style={{ cursor: 'pointer', textAlign: 'center' }}><TeamOutlined style={{ fontSize: 24, color: '#6366f1' }} /><h4>CRM</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{contacts.length + leads.length + deals.length} {t('common.records')}</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/accounting')} style={{ cursor: 'pointer', textAlign: 'center' }}><DollarOutlined style={{ fontSize: 24, color: '#8b5cf6' }} /><h4>{t('dashboard.accounting_label')}</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{invoices.length} {t('dashboard.invoices_count')}</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/hr')} style={{ cursor: 'pointer', textAlign: 'center' }}><Badge count={pendingLeaves} size="small"><TeamOutlined style={{ fontSize: 24, color: '#ec4899' }} /></Badge><h4>HR</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{employees.length} {t('dashboard.employees_count')}</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/warehouse')} style={{ cursor: 'pointer', textAlign: 'center' }}><ShoppingCartOutlined style={{ fontSize: 24, color: '#f97316' }} /><h4>{t('dashboard.warehouse_label')}</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{products.length} {t('dashboard.products_count')}</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/projects')} style={{ cursor: 'pointer', textAlign: 'center' }}><ProjectOutlined style={{ fontSize: 24, color: '#22c55e' }} /><h4>{t('dashboard.projects_label')}</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{projects.length} {t('dashboard.projects_count')}</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/documents')} style={{ cursor: 'pointer', textAlign: 'center' }}><FileTextOutlined style={{ fontSize: 24, color: '#06b6d4' }} /><h4>{t('dashboard.modules.documents')}</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{documents.length} {t('dashboard.documents_count')}</p></Card></Col>
                    </Row>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title={<><ClockCircleOutlined /> {t('dashboard.recent_events')}</>} extra={<a onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>{t('dashboard.all_events')} →</a>}>
                        {activityFeed.length > 0 ? (
                            <List dataSource={activityFeed} renderItem={(item: any) => (
                                <List.Item extra={item.tag}>
                                    <List.Item.Meta avatar={<Avatar style={{ background: 'rgba(99,102,241,0.15)' }} icon={item.icon} />} title={item.title} description={item.desc} />
                                </List.Item>
                            )} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                                <CheckCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} /><br />{t('dashboard.no_events')}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
