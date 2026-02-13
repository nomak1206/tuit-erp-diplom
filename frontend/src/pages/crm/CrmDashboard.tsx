import { Row, Col, Spin, Card, Statistic, List, Tag, Space, Button } from 'antd'
import { TeamOutlined, DollarOutlined, RiseOutlined, FundProjectionScreenOutlined, ArrowRightOutlined, PhoneOutlined, ContactsOutlined, SolutionOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useContacts, useLeads, useDeals, useActivities } from '../../api/hooks'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e']

const leadStatusMap: Record<string, string> = { new: 'Новый', contacted: 'Связались', qualified: 'Квалифицирован', converted: 'Конвертирован', lost: 'Потерян' }
const dealStageMap: Record<string, string> = { new: 'Новые', negotiation: 'Переговоры', proposal: 'Предложение', contract: 'Контракт', won: 'Выиграно', lost: 'Проиграно' }
const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function CrmDashboard() {
    const navigate = useNavigate()
    const { data: contacts = [], isLoading: cl } = useContacts()
    const { data: leads = [], isLoading: ll } = useLeads()
    const { data: deals = [], isLoading: dl } = useDeals()
    const { data: activities = [] } = useActivities()

    if (cl || ll || dl) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const totalPipeline = deals.filter((d: any) => !['won', 'lost'].includes(d.stage)).reduce((s: number, d: any) => s + (d.amount || 0), 0)
    const wonDeals = deals.filter((d: any) => d.stage === 'won')
    const conversionRate = deals.length ? ((wonDeals.length / deals.length) * 100).toFixed(1) : '0'
    const avgDeal = wonDeals.length ? (wonDeals.reduce((s: number, d: any) => s + (d.amount || 0), 0) / wonDeals.length) : 0

    const leadsByStatus = Object.entries(leads.reduce((acc: any, l: any) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc }, {})).map(([name, value]) => ({ name: leadStatusMap[name] || name, value }))
    const dealsByStage = Object.entries(deals.reduce((acc: any, d: any) => { acc[d.stage] = (acc[d.stage] || 0) + (d.amount || 0); return acc }, {})).map(([key, value]) => ({ name: dealStageMap[key] || key, value }))

    const activityTypeMap: Record<string, string> = { call: 'Звонок', meeting: 'Встреча', email: 'Email', task: 'Задача', note: 'Заметка' }

    const kpis = [
        { title: 'Контакты', value: contacts.length, icon: <ContactsOutlined />, color: '#6366f1', path: '/crm/contacts' },
        { title: 'Лиды', value: leads.length, icon: <SolutionOutlined />, color: '#8b5cf6', path: '/crm/leads' },
        { title: 'Воронка', value: `${(totalPipeline / 1e6).toFixed(1)}M`, icon: <DollarOutlined />, color: '#ec4899', path: '/crm/deals', suffix: 'UZS' },
        { title: 'Конверсия', value: parseFloat(conversionRate), icon: <RiseOutlined />, color: '#22c55e', suffix: '%', path: '/crm/deals' },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1>CRM — Обзор</h1><p>Управление взаимоотношениями с клиентами</p></div>
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
                    <Card title="Лиды по статусам" extra={<Button type="link" onClick={() => navigate('/crm/leads')}>Все лиды →</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart><Pie data={leadsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                                {leadsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Сделки по стадиям (UZS)" extra={<Button type="link" onClick={() => navigate('/crm/deals')}>Воронка →</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={dealsByStage}><CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} /><Tooltip formatter={(v: number) => `${fmt(v)} UZS`} /><Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Последние активности" extra={<Button type="link" onClick={() => navigate('/crm/contacts')}>Контакты →</Button>}>
                        <List dataSource={(activities as any[]).slice(0, 5)} renderItem={(a: any) => (
                            <List.Item><List.Item.Meta title={activityTypeMap[a.type] || a.type || 'Активность'} description={a.description || a.notes || '—'} /></List.Item>
                        )} locale={{ emptyText: 'Нет активностей' }} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Быстрые действия">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button block icon={<ContactsOutlined />} onClick={() => navigate('/crm/contacts')}>Открыть контакты</Button>
                            <Button block icon={<SolutionOutlined />} onClick={() => navigate('/crm/leads')}>Управление лидами</Button>
                            <Button block icon={<DollarOutlined />} onClick={() => navigate('/crm/deals')}>Воронка продаж</Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
