import { Row, Col, Spin, Card, Statistic, Tag, Descriptions } from 'antd'
import { DollarOutlined, RiseOutlined, TeamOutlined, ShoppingCartOutlined, ProjectOutlined, WalletOutlined, BankOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts'
import { useContacts, useLeads, useDeals, useEmployees, useProducts, useProjects, useInvoices, usePayroll } from '../../api/hooks'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function AnalyticsDashboard() {
    const { data: contacts = [], isLoading: l1 } = useContacts()
    const { data: leads = [], isLoading: l2 } = useLeads()
    const { data: deals = [], isLoading: l3 } = useDeals()
    const { data: employees = [], isLoading: l4 } = useEmployees()
    const { data: products = [], isLoading: l5 } = useProducts()
    const { data: projects = [], isLoading: l6 } = useProjects()
    const { data: invoices = [] } = useInvoices()
    const { data: payroll = [] } = usePayroll()
    const isLoading = l1 || l2 || l3 || l4 || l5 || l6

    /* CRM conversion funnel */
    const funnelData = [
        { stage: 'Контакты', count: contacts.length },
        { stage: 'Лиды', count: leads.length },
        { stage: 'Квалиф.', count: leads.filter((l: any) => l.status === 'qualified' || l.status === 'converted').length },
        { stage: 'Сделки', count: deals.length },
        { stage: 'Выиграно', count: deals.filter((d: any) => d.stage === 'won').length },
    ]

    /* Module radar */
    const radarData = [
        { module: 'CRM', score: contacts.length + leads.length + deals.length },
        { module: 'HR', score: employees.length },
        { module: 'Склад', score: products.length },
        { module: 'Проекты', score: projects.length },
    ].map(d => ({ ...d, score: Math.min(d.score * 10, 100) }))

    /* Deal amounts by stage */
    const stageLabels: Record<string, string> = { new: 'Новые', negotiation: 'Перегов.', proposal: 'Предлож.', contract: 'Контракт', won: 'Выиграно', lost: 'Проиграно' }
    const stageAmounts = ['new', 'negotiation', 'proposal', 'contract', 'won', 'lost'].map(s => ({
        stage: stageLabels[s],
        amount: deals.filter((d: any) => d.stage === s).reduce((sum: number, d: any) => sum + (d.amount || 0), 0),
        count: deals.filter((d: any) => d.stage === s).length,
    }))

    /* HR analytics */
    const totalSalary = employees.reduce((s: number, e: any) => s + (e.salary || 0), 0)
    const totalNdfl = totalSalary * 0.12
    const totalInps = totalSalary * 0.01
    const totalEsn = totalSalary * 0.12
    const totalNetSalary = totalSalary - totalNdfl - totalInps

    const payrollPieData = [
        { name: 'К выплате', value: totalNetSalary },
        { name: 'НДФЛ 12%', value: totalNdfl },
        { name: 'ИНПС 1%', value: totalInps },
        { name: 'ЕСН 12%', value: totalEsn },
    ]

    /* Warehouse */
    const totalStockValue = products.reduce((s: number, p: any) => s + (p.sell_price || 0) * (p.quantity || 0), 0)
    const lowStock = products.filter((p: any) => (p.quantity || 0) <= (p.min_quantity || 5)).length

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const totalWon = deals.filter((d: any) => d.stage === 'won').reduce((s: number, d: any) => s + (d.amount || 0), 0)
    const avgDeal = deals.length > 0 ? Math.round(deals.reduce((s: number, d: any) => s + (d.amount || 0), 0) / deals.length) : 0
    const convRate = leads.length > 0 ? ((leads.filter((l: any) => l.status === 'converted').length / leads.length) * 100).toFixed(0) : '0'

    return (
        <div className="fade-in">
            <div className="page-header"><h1>Аналитика</h1><p>Бизнес-аналитика и отчётность (УзР)</p></div>

            <div className="stats-grid">
                <div className="kpi-card purple stagger-item">
                    <div className="kpi-value">{(totalWon / 1e6).toFixed(1)} млн</div>
                    <div className="kpi-label">Выручка</div>
                    <div className="kpi-change up"><DollarOutlined /> по выигранным сделкам</div>
                </div>
                <div className="kpi-card blue stagger-item">
                    <div className="kpi-value">{(avgDeal / 1e6).toFixed(1)} млн</div>
                    <div className="kpi-label">Средний чек</div>
                    <div className="kpi-change up"><RiseOutlined /> средняя сделка</div>
                </div>
                <div className="kpi-card green stagger-item">
                    <div className="kpi-value">{convRate}%</div>
                    <div className="kpi-label">Конверсия</div>
                    <div className="kpi-change up"><TeamOutlined /> лидов в сделки</div>
                </div>
                <div className="kpi-card orange stagger-item">
                    <div className="kpi-value">{(totalSalary / 1e6).toFixed(1)} млн</div>
                    <div className="kpi-label">ФОТ (месяц)</div>
                    <div className="kpi-change up"><WalletOutlined /> фонд оплаты труда</div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <div className="chart-container">
                        <h3>📈 Воронка продаж (CRM)</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={funnelData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                                <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                                <Bar dataKey="count" name="Количество" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col xs={24} lg={10}>
                    <div className="chart-container">
                        <h3>🎯 Активность модулей</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#2d2d4a" />
                                <PolarAngleAxis dataKey="module" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis tick={false} axisLine={false} />
                                <Radar name="Активность" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={14}>
                    <div className="chart-container">
                        <h3>💰 Суммы по стадиям сделок</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={stageAmounts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                                <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} formatter={(v: number) => `${fmt(v)} UZS`} />
                                <Bar dataKey="amount" name="Сумма (UZS)" fill="#10b981" radius={[6, 6, 0, 0]} barSize={50} />
                                <Bar dataKey="count" name="Количество" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col xs={24} lg={10}>
                    <div className="chart-container">
                        <h3>👥 ФОТ: Распределение затрат</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart><Pie data={payrollPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, value }: any) => `${name}: ${(value / 1e6).toFixed(1)}M`}>
                                {payrollPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip formatter={(v: number) => `${fmt(v)} UZS`} /></PieChart>
                        </ResponsiveContainer>
                        <Descriptions size="small" column={2} style={{ marginTop: 8 }}>
                            <Descriptions.Item label="Склад"><strong>{fmt(totalStockValue)} UZS</strong></Descriptions.Item>
                            <Descriptions.Item label="Мало на складе">{lowStock > 0 ? <Tag color="red">{lowStock} поз.</Tag> : <Tag color="green">Все ОК</Tag>}</Descriptions.Item>
                        </Descriptions>
                    </div>
                </Col>
            </Row>
        </div>
    )
}
