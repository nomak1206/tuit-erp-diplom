import { Row, Col, Spin, Card, Statistic, List, Tag, Space, Button } from 'antd'
import { TeamOutlined, DollarOutlined, RiseOutlined, FundProjectionScreenOutlined, ArrowRightOutlined, PhoneOutlined, ContactsOutlined, SolutionOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useContacts, useLeads, useDeals, useActivities } from '../../api/hooks'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e']
const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function CrmDashboard() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { data: contacts = [], isLoading: cl } = useContacts()
    const { data: leads = [], isLoading: ll } = useLeads()
    const { data: deals = [], isLoading: dl } = useDeals()
    const { data: activities = [] } = useActivities()

    if (cl || ll || dl) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const totalPipeline = deals.filter((d: any) => !['won', 'lost'].includes(d.stage)).reduce((s: number, d: any) => s + (d.amount || 0), 0)
    const wonDeals = deals.filter((d: any) => d.stage === 'won')
    const conversionRate = deals.length ? ((wonDeals.length / deals.length) * 100).toFixed(1) : '0'
    const avgDeal = wonDeals.length ? (wonDeals.reduce((s: number, d: any) => s + (d.amount || 0), 0) / wonDeals.length) : 0

    const leadsByStatus = Object.entries(leads.reduce((acc: any, l: any) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc }, {})).map(([name, value]) => ({ name: t(`crm.lead_statuses.${name}`, name), value }))
    const dealsByStage = Object.entries(deals.reduce((acc: any, d: any) => { acc[d.stage] = (acc[d.stage] || 0) + (d.amount || 0); return acc }, {})).map(([key, value]) => ({ name: t(`crm.deal_stages.${key}`, key), value }))

    const kpis = [
        { title: t('crm.contacts'), value: contacts.length, icon: <ContactsOutlined />, color: '#6366f1', path: '/crm/contacts' },
        { title: t('crm.leads'), value: leads.length, icon: <SolutionOutlined />, color: '#8b5cf6', path: '/crm/leads' },
        { title: t('crm.pipeline'), value: `${(totalPipeline / 1e6).toFixed(1)}M`, icon: <DollarOutlined />, color: '#ec4899', path: '/crm/deals', suffix: 'UZS' },
        { title: t('crm.conversion'), value: parseFloat(conversionRate), icon: <RiseOutlined />, color: '#22c55e', suffix: '%', path: '/crm/deals' },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{t('crm.title')}</h1><p>{t('crm.subtitle')}</p></div>
            <Row gutter={[16, 16]}>
                {kpis.map(k => (
                    <Col xs={12} lg={6} key={k.title}>
                        <Card hoverable onClick={() => navigate(k.path)} style={{ cursor: 'pointer', borderLeft: `3px solid ${k.color}` }}>
                            <Statistic title={k.title} value={k.value} prefix={<span style={{ color: k.color }}>{k.icon}</span>} suffix={k.suffix} />
                            <div style={{ textAlign: 'right', marginTop: 8 }}><ArrowRightOutlined style={{ color: k.color }} /></div>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title={t('crm.leads_by_status')} extra={<Button type="link" onClick={() => navigate('/crm/leads')}>{t('crm.all_leads')}</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart><Pie data={leadsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                                {leadsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title={t('crm.deals_by_stage')} extra={<Button type="link" onClick={() => navigate('/crm/deals')}>{t('crm.pipeline_link')}</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={dealsByStage}><CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" /><XAxis dataKey="name" tick={{ fill: 'var(--chart-label)', fontSize: 11 }} /><YAxis tick={{ fill: 'var(--chart-label)', fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} /><Tooltip formatter={(v: number) => `${fmt(v)} UZS`} /><Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title={t('crm.recent_activities')} extra={<Button type="link" onClick={() => navigate('/crm/contacts')}>{t('crm.contacts_link')}</Button>}>
                        <List dataSource={(activities as any[]).slice(0, 5)} renderItem={(a: any) => (
                            <List.Item><List.Item.Meta title={String(t(`crm.activity_types.${a.type}`, a.type || 'Activity'))} description={a.description || a.notes || '—'} /></List.Item>
                        )} locale={{ emptyText: t('crm.no_activities') }} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title={t('crm.quick_actions')}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button block icon={<ContactsOutlined />} onClick={() => navigate('/crm/contacts')}>{t('crm.open_contacts')}</Button>
                            <Button block icon={<SolutionOutlined />} onClick={() => navigate('/crm/leads')}>{t('crm.manage_leads')}</Button>
                            <Button block icon={<DollarOutlined />} onClick={() => navigate('/crm/deals')}>{t('crm.sales_funnel')}</Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
