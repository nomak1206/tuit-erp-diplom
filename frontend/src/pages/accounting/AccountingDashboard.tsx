import { Row, Col, Card, Statistic, Table, Tag } from 'antd'
import { DollarOutlined, RiseOutlined, FallOutlined, BankOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const balanceData = [
    { name: 'Активы', value: 268000000, color: '#6366f1' },
    { name: 'Обязательства', value: 12000000, color: '#ff4d4f' },
    { name: 'Капитал', value: 200000000, color: '#52c41a' },
]

const monthlyData = [
    { month: 'Окт', income: 61, expense: 38 },
    { month: 'Ноя', income: 58, expense: 40 },
    { month: 'Дек', income: 72, expense: 42 },
    { month: 'Янв', income: 85, expense: 45 },
    { month: 'Фев', income: 95, expense: 48 },
]

const recentInvoices = [
    { id: 1, number: 'INV-2026-001', contact: 'TechCorp UZ', total: 17250000, status: 'paid' },
    { id: 2, number: 'INV-2026-002', contact: 'MediaGroup', total: 13800000, status: 'sent' },
    { id: 3, number: 'INV-2026-003', contact: 'BuildPro', total: 28750000, status: 'draft' },
    { id: 4, number: 'INV-2026-004', contact: 'FoodMarket', total: 9200000, status: 'overdue' },
]
const statusMap: Record<string, { color: string; label: string }> = {
    paid: { color: 'green', label: 'Оплачен' },
    sent: { color: 'blue', label: 'Отправлен' },
    draft: { color: 'default', label: 'Черновик' },
    overdue: { color: 'red', label: 'Просрочен' },
}

export default function AccountingDashboard() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Бухгалтерия</h1><p>Финансовый обзор предприятия</p></div>
            <div className="stats-grid">
                <div className="kpi-card green stagger-item"><div className="kpi-value">95 млн</div><div className="kpi-label">Доходы</div><div className="kpi-change up"><RiseOutlined /> +12%</div></div>
                <div className="kpi-card red stagger-item"><div className="kpi-value">67 млн</div><div className="kpi-label">Расходы</div><div className="kpi-change down"><FallOutlined /> +8%</div></div>
                <div className="kpi-card purple stagger-item"><div className="kpi-value">28 млн</div><div className="kpi-label">Чистая прибыль</div><div className="kpi-change up"><RiseOutlined /> +15%</div></div>
                <div className="kpi-card blue stagger-item"><div className="kpi-value">4</div><div className="kpi-label">Счетов к оплате</div><div className="kpi-change down"><FallOutlined /> 1 просрочен</div></div>
            </div>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={14}>
                    <div className="chart-container"><h3>📊 Доходы и расходы (млн UZS)</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                                <Bar dataKey="income" name="Доходы" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="expense" name="Расходы" fill="#ff4d4f" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col xs={24} lg={10}>
                    <div className="chart-container"><h3>🏦 Структура баланса</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart><Pie data={balanceData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name }) => name}>{balanceData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie>
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} formatter={(v: any) => `${(v / 1000000).toFixed(0)} млн UZS`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
            </Row>
            <Card title="📄 Последние счета" bordered={false} style={{ marginTop: 24 }}>
                <Table dataSource={recentInvoices} rowKey="id" pagination={false} columns={[
                    { title: '№', dataIndex: 'number', key: 'number', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
                    { title: 'Контрагент', dataIndex: 'contact', key: 'contact' },
                    { title: 'Сумма (UZS)', dataIndex: 'total', key: 'total', render: (v: number) => v.toLocaleString('ru-RU') },
                    { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label}</Tag> },
                ]} />
            </Card>
        </div>
    )
}
