import { Row, Col, Card, Statistic, Tag } from 'antd'
import { DollarOutlined, UserOutlined, PhoneOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const stageData = [
    { name: 'Новые', value: 2, color: '#8884d8' },
    { name: 'Переговоры', value: 1, color: '#83a6ed' },
    { name: 'Предложение', value: 1, color: '#8dd1e1' },
    { name: 'Контракт', value: 1, color: '#82ca9d' },
    { name: 'Выиграно', value: 1, color: '#52c41a' },
    { name: 'Проиграно', value: 1, color: '#ff4d4f' },
]

const leadSourceData = [
    { source: 'Сайт', count: 12 },
    { source: 'Телефон', count: 8 },
    { source: 'Реферал', count: 6 },
    { source: 'Соцсети', count: 5 },
    { source: 'Реклама', count: 4 },
]

export default function CrmDashboard() {
    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>CRM</h1>
                <p>Управление взаимоотношениями с клиентами</p>
            </div>

            <div className="stats-grid">
                <div className="kpi-card purple stagger-item">
                    <div className="kpi-value">5</div>
                    <div className="kpi-label">Лидов</div>
                    <div className="kpi-change up"><RiseOutlined /> 2 новых на этой неделе</div>
                </div>
                <div className="kpi-card blue stagger-item">
                    <div className="kpi-value">7</div>
                    <div className="kpi-label">Сделок</div>
                    <div className="kpi-change up"><RiseOutlined /> 110 млн UZS в воронке</div>
                </div>
                <div className="kpi-card green stagger-item">
                    <div className="kpi-value">14.3%</div>
                    <div className="kpi-label">Конверсия</div>
                    <div className="kpi-change up"><RiseOutlined /> +2.1%</div>
                </div>
                <div className="kpi-card orange stagger-item">
                    <div className="kpi-value">12 млн</div>
                    <div className="kpi-label">Выиграно</div>
                    <div className="kpi-change up"><DollarOutlined /> в этом месяце</div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <div className="chart-container">
                        <h3>🎯 Воронка сделок</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={stageData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                    {stageData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col xs={24} lg={12}>
                    <div className="chart-container">
                        <h3>📊 Источники лидов</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={leadSourceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                                <XAxis dataKey="source" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
            </Row>
        </div>
    )
}
