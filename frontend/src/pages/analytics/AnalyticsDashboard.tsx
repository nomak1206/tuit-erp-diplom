import { Row, Col, Card, Statistic, Table, Tag } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend,
} from 'recharts'

const monthlyRevenue = [
    { month: 'Сен', revenue: 52, expenses: 35, profit: 17 },
    { month: 'Окт', revenue: 61, expenses: 38, profit: 23 },
    { month: 'Ноя', revenue: 58, expenses: 40, profit: 18 },
    { month: 'Дек', revenue: 72, expenses: 42, profit: 30 },
    { month: 'Янв', revenue: 85, expenses: 45, profit: 40 },
    { month: 'Фев', revenue: 95, expenses: 48, profit: 47 },
]

const regionData = [
    { name: 'Ташкент', value: 60, color: '#6366f1' },
    { name: 'Самарканд', value: 15, color: '#8b5cf6' },
    { name: 'Бухара', value: 10, color: '#a78bfa' },
    { name: 'Другие', value: 15, color: '#c4b5fd' },
]

const departmentPerformance = [
    { dept: 'Продажи', kpi: 92 },
    { dept: 'IT', kpi: 88 },
    { dept: 'Бухгалтерия', kpi: 95 },
    { dept: 'HR', kpi: 85 },
    { dept: 'Склад', kpi: 78 },
]

const topProducts = [
    { id: 1, name: 'ERP-система', sales: 3, revenue: 45000000 },
    { id: 2, name: 'CRM-система', sales: 4, revenue: 32000000 },
    { id: 3, name: 'Модуль аналитики', sales: 5, revenue: 12000000 },
    { id: 4, name: 'Мобильное приложение', sales: 2, revenue: 18000000 },
]

export default function AnalyticsDashboard() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Аналитика</h1><p>Расширенная аналитика и отчётность</p></div>

            <div className="stats-grid">
                <div className="kpi-card green stagger-item">
                    <div className="kpi-value">423 млн</div>
                    <div className="kpi-label">Выручка за год</div>
                    <div className="kpi-change up"><ArrowUpOutlined /> +18.5%</div>
                </div>
                <div className="kpi-card purple stagger-item">
                    <div className="kpi-value">175 млн</div>
                    <div className="kpi-label">Прибыль за год</div>
                    <div className="kpi-change up"><ArrowUpOutlined /> +24.3%</div>
                </div>
                <div className="kpi-card blue stagger-item">
                    <div className="kpi-value">41.4%</div>
                    <div className="kpi-label">Маржинальность</div>
                    <div className="kpi-change up"><ArrowUpOutlined /> +3.2%</div>
                </div>
                <div className="kpi-card orange stagger-item">
                    <div className="kpi-value">87.6%</div>
                    <div className="kpi-label">Средний KPI отделов</div>
                    <div className="kpi-change up"><ArrowUpOutlined /> +5.1%</div>
                </div>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <div className="chart-container">
                        <h3>📈 Доходы, расходы и прибыль (млн UZS)</h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={monthlyRevenue}>
                                <defs>
                                    <linearGradient id="cRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="cProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3} /><stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" name="Выручка" stroke="#6366f1" fill="url(#cRevenue)" strokeWidth={2} />
                                <Area type="monotone" dataKey="profit" name="Прибыль" stroke="#52c41a" fill="url(#cProfit)" strokeWidth={2} />
                                <Line type="monotone" dataKey="expenses" name="Расходы" stroke="#ff4d4f" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col xs={24} lg={8}>
                    <div className="chart-container">
                        <h3>🌍 Продажи по регионам</h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie data={regionData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                                    {regionData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <div className="chart-container">
                        <h3>📊 KPI по отделам (%)</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={departmentPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                                <XAxis type="number" stroke="#64748b" fontSize={12} domain={[0, 100]} />
                                <YAxis dataKey="dept" type="category" stroke="#64748b" fontSize={12} width={100} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                                <Bar dataKey="kpi" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="🏆 Топ продукты по продажам" bordered={false}>
                        <Table dataSource={topProducts} rowKey="id" pagination={false} size="small" columns={[
                            { title: 'Продукт', dataIndex: 'name', key: 'name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
                            { title: 'Продаж', dataIndex: 'sales', key: 'sales' },
                            { title: 'Выручка (UZS)', dataIndex: 'revenue', key: 'revenue', render: (v: number) => <span style={{ color: '#818cf8', fontWeight: 600 }}>{v.toLocaleString('ru-RU')}</span> },
                        ]} />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
