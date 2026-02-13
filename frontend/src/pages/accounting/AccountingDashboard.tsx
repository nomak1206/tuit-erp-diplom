import { Row, Col, Spin, Card, Statistic, Space, Button } from 'antd'
import { DollarOutlined, AccountBookOutlined, AuditOutlined, FileTextOutlined, ArrowRightOutlined, RiseOutlined, FallOutlined, BankOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useChartOfAccounts, useJournalEntries, useInvoices, useFinancialSummary } from '../../api/hooks'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']
const typeLabels: Record<string, string> = { asset: 'Активы', liability: 'Пассивы', equity: 'Капитал', revenue: 'Доходы', expense: 'Расходы', contra_asset: 'Контр-активы' }
const invoiceStatusLabels: Record<string, string> = { draft: 'Черновик', sent: 'Отправлен', paid: 'Оплачен', overdue: 'Просрочен', cancelled: 'Отменён' }
const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function AccountingDashboard() {
    const navigate = useNavigate()
    const { data: accounts = [], isLoading: al } = useChartOfAccounts()
    const { data: journal = [], isLoading: jl } = useJournalEntries()
    const { data: invoices = [], isLoading: il } = useInvoices()
    const { data: summary } = useFinancialSummary()

    if (al || jl || il) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const totalAssets = accounts.filter((a: any) => a.account_type === 'asset').reduce((s: number, a: any) => s + (a.balance || 0), 0)
    const totalContraAsset = accounts.filter((a: any) => a.account_type === 'contra_asset').reduce((s: number, a: any) => s + (a.balance || 0), 0)
    const totalLiabilities = accounts.filter((a: any) => a.account_type === 'liability').reduce((s: number, a: any) => s + (a.balance || 0), 0)
    const paidInvoices = invoices.filter((i: any) => i.status === 'paid')
    const totalRevenue = paidInvoices.reduce((s: number, i: any) => s + (i.total_amount || 0), 0)
    const netAssets = totalAssets - totalContraAsset

    const accountsByType = Object.entries(accounts.reduce((acc: any, a: any) => { acc[a.account_type] = (acc[a.account_type] || 0) + 1; return acc }, {})).map(([name, value]) => ({ name: typeLabels[name] || name, value }))
    const invoicesByStatus = Object.entries(invoices.reduce((acc: any, i: any) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc }, {})).map(([name, value]) => ({ name: invoiceStatusLabels[name] || name, value }))

    const kpis = [
        { title: 'Активы (нетто)', value: netAssets, icon: <RiseOutlined />, color: '#22c55e', path: '/accounting/chart' },
        { title: 'Обязательства', value: totalLiabilities, icon: <FallOutlined />, color: '#f43f5e', path: '/accounting/chart' },
        { title: 'Выручка', value: totalRevenue, icon: <DollarOutlined />, color: '#6366f1', path: '/accounting/invoices' },
        { title: 'Проводки', value: journal.length, icon: <AuditOutlined />, color: '#8b5cf6', path: '/accounting/journal' },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1><BankOutlined /> Бухгалтерия — Обзор</h1><p>Финансовый учёт по НСБУ</p></div>
            <Row gutter={[16, 16]}>
                {kpis.map(k => (
                    <Col xs={12} lg={6} key={k.title}>
                        <Card hoverable onClick={() => navigate(k.path)} style={{ cursor: 'pointer', borderLeft: `3px solid ${k.color}` }}>
                            <Statistic title={k.title} value={typeof k.value === 'number' && k.value > 1000 ? `${(k.value / 1e6).toFixed(1)}M` : k.value} suffix={typeof k.value === 'number' && k.value > 1000 ? 'UZS' : undefined} prefix={<span style={{ color: k.color }}>{k.icon}</span>} />
                            <div style={{ textAlign: 'right', marginTop: 8 }}><ArrowRightOutlined style={{ color: k.color }} /></div>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Счета по типам (НСБУ)" extra={<Button type="link" onClick={() => navigate('/accounting/chart')}>План счетов →</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart><Pie data={accountsByType} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                                {accountsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Счета-фактуры" extra={<Button type="link" onClick={() => navigate('/accounting/invoices')}>Все счета →</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={invoicesByStatus}><CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} /></BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="Быстрые действия">
                        <Space wrap>
                            <Button icon={<AccountBookOutlined />} onClick={() => navigate('/accounting/chart')}>План счетов</Button>
                            <Button icon={<AuditOutlined />} onClick={() => navigate('/accounting/journal')}>Журнал проводок</Button>
                            <Button icon={<FileTextOutlined />} onClick={() => navigate('/accounting/invoices')}>Счета-фактуры</Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
