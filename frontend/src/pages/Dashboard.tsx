import { Row, Col, Spin, Card, Statistic, List, Tag, Avatar, Badge, Divider } from 'antd'
import { DollarOutlined, TeamOutlined, ShoppingCartOutlined, FileTextOutlined, ProjectOutlined, RiseOutlined, WalletOutlined, ClockCircleOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useContacts, useLeads, useDeals, useEmployees, useProducts, useProjects, useDocuments, useInvoices, useLeaves } from '../api/hooks'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']
const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function Dashboard() {
    const navigate = useNavigate()
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
        { month: 'Янв', value: totalRevenue * 0.08 },
        { month: 'Фев', value: totalRevenue * 0.12 },
        { month: 'Мар', value: totalRevenue * 0.10 },
        { month: 'Апр', value: totalRevenue * 0.15 },
        { month: 'Май', value: totalRevenue * 0.18 },
        { month: 'Июн', value: totalRevenue * 0.14 },
        { month: 'Июл', value: totalRevenue * 0.23 },
    ]

    const moduleData = [
        { name: 'Контакты', value: contacts.length },
        { name: 'Лиды', value: leads.length },
        { name: 'Сделки', value: deals.length },
        { name: 'Сотрудники', value: employees.length },
        { name: 'Товары', value: products.length },
        { name: 'Документы', value: documents.length },
    ]

    const kpis = [
        { title: 'Выручка', value: `${(totalRevenue / 1e6).toFixed(1)}M`, suffix: 'UZS', icon: <DollarOutlined />, color: '#6366f1', path: '/accounting/invoices' },
        { title: 'Воронка', value: `${(pipelineValue / 1e6).toFixed(1)}M`, suffix: 'UZS', icon: <RiseOutlined />, color: '#8b5cf6', path: '/crm/deals' },
        { title: 'Сотрудники', value: activeEmployees, suffix: `/ ${employees.length}`, icon: <TeamOutlined />, color: '#22c55e', path: '/hr' },
        { title: 'ФОТ', value: `${(totalSalary / 1e6).toFixed(1)}M`, suffix: 'UZS', icon: <WalletOutlined />, color: '#ec4899', path: '/hr/payroll' },
    ]

    /* Recent activity */
    const recentLeaves = leaves.slice(0, 3).map((l: any) => ({
        id: l.id, icon: <CalendarOutlined style={{ color: '#f97316' }} />,
        title: `${l.employee_name || 'Сотрудник'} — ${l.leave_type === 'vacation' ? 'Отпуск' : l.leave_type === 'sick' ? 'Больничный' : 'Отгул'}`,
        desc: `${l.start_date || ''} – ${l.end_date || ''}`,
        tag: l.status === 'approved' ? <Tag color="green">Одобрено</Tag> : l.status === 'pending' ? <Tag color="orange">Ожидание</Tag> : <Tag>{l.status}</Tag>,
    }))

    return (
        <div className="fade-in">
            <div className="page-header"><h1>Дашборд</h1><p>Общий обзор системы</p></div>
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
                    <Card title="Выручка по месяцам" extra={<a onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }}>Аналитика →</a>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueChart}><CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" /><XAxis dataKey="month" tick={{ fill: '#94a3b8' }} /><YAxis tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} /><Tooltip formatter={(v: number) => `${fmt(v)} UZS`} /><defs><linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs><Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#colorGrad)" strokeWidth={2} /></AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title="Модули системы" extra={<a onClick={() => navigate('/analytics')} style={{ cursor: 'pointer' }}>Детали →</a>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart><Pie data={moduleData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                                {moduleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={14}>
                    <Row gutter={[16, 16]}>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/crm')} style={{ cursor: 'pointer', textAlign: 'center' }}><TeamOutlined style={{ fontSize: 24, color: '#6366f1' }} /><h4>CRM</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{contacts.length + leads.length + deals.length} записей</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/accounting')} style={{ cursor: 'pointer', textAlign: 'center' }}><DollarOutlined style={{ fontSize: 24, color: '#8b5cf6' }} /><h4>Бухгалтерия</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{invoices.length} счетов</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/hr')} style={{ cursor: 'pointer', textAlign: 'center' }}><Badge count={pendingLeaves} size="small"><TeamOutlined style={{ fontSize: 24, color: '#ec4899' }} /></Badge><h4>HR</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{employees.length} сотрудников</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/warehouse')} style={{ cursor: 'pointer', textAlign: 'center' }}><ShoppingCartOutlined style={{ fontSize: 24, color: '#f97316' }} /><h4>Склад</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{products.length} товаров</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/projects')} style={{ cursor: 'pointer', textAlign: 'center' }}><ProjectOutlined style={{ fontSize: 24, color: '#22c55e' }} /><h4>Проекты</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{projects.length} проектов</p></Card></Col>
                        <Col xs={12} lg={8}><Card hoverable onClick={() => navigate('/documents')} style={{ cursor: 'pointer', textAlign: 'center' }}><FileTextOutlined style={{ fontSize: 24, color: '#06b6d4' }} /><h4>Документы</h4><p style={{ color: '#94a3b8', fontSize: 12 }}>{documents.length} документов</p></Card></Col>
                    </Row>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title={<><ClockCircleOutlined /> Последние события</>}>
                        {recentLeaves.length > 0 ? (
                            <List dataSource={recentLeaves} renderItem={(item: any) => (
                                <List.Item extra={item.tag}>
                                    <List.Item.Meta avatar={<Avatar style={{ background: 'rgba(99,102,241,0.15)' }} icon={item.icon} />} title={item.title} description={item.desc} />
                                </List.Item>
                            )} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                                <CheckCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} /><br />Нет ожидающих событий
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
