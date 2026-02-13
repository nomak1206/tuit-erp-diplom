import { Row, Col, Card, Tag, List, Typography } from 'antd'
import {
    DollarOutlined,
    ShoppingCartOutlined,
    ProjectOutlined,
    TeamOutlined,
    RiseOutlined,
    ArrowUpOutlined,
    PhoneOutlined,
    FileTextOutlined,
    UserOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
} from 'recharts'

const { Text } = Typography

const revenueData = [
    { month: 'Авг', revenue: 45, expenses: 32 },
    { month: 'Сен', revenue: 52, expenses: 35 },
    { month: 'Окт', revenue: 61, expenses: 38 },
    { month: 'Ноя', revenue: 58, expenses: 40 },
    { month: 'Дек', revenue: 72, expenses: 42 },
    { month: 'Янв', revenue: 85, expenses: 45 },
    { month: 'Фев', revenue: 95, expenses: 48 },
]

const pipelineData = [
    { stage: 'Новые', count: 2, fill: '#8884d8' },
    { stage: 'Переговоры', count: 1, fill: '#83a6ed' },
    { stage: 'Предложение', count: 1, fill: '#8dd1e1' },
    { stage: 'Контракт', count: 1, fill: '#82ca9d' },
    { stage: 'Выиграно', count: 1, fill: '#52c41a' },
    { stage: 'Проиграно', count: 1, fill: '#ff4d4f' },
]

const activities = [
    { icon: <PhoneOutlined />, title: 'Звонок Азизу Каримову', time: '2 часа назад', cls: 'call' },
    { icon: <FileTextOutlined />, title: 'Создан счёт INV-2026-003', time: '5 часов назад', cls: 'email' },
    { icon: <UserOutlined />, title: 'Новый сотрудник: Анна Волкова', time: 'Вчера', cls: 'task' },
    { icon: <CheckCircleOutlined />, title: 'Задача «Дизайн БД» завершена', time: 'Вчера', cls: 'meeting' },
    { icon: <DollarOutlined />, title: 'Оплата от TechCorp — 17 250 000 UZS', time: '3 дня назад', cls: 'email' },
]

const tasks = [
    { title: 'Frontend — Dashboard', project: 'ERP TechCorp', priority: 'high' },
    { title: 'Виджеты графиков', project: 'Модуль аналитики', priority: 'medium' },
    { title: 'Тестирование модулей', project: 'ERP TechCorp', priority: 'medium' },
    { title: 'Деплой на prod', project: 'ERP TechCorp', priority: 'medium' },
]

export default function Dashboard() {
    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Панель управления</h1>
                <p>Обзор ключевых показателей предприятия</p>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid">
                <div className="kpi-card purple stagger-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="kpi-value">95 млн</div>
                            <div className="kpi-label">Выручка</div>
                            <div className="kpi-change up"><ArrowUpOutlined /> +12.5% к прошлому месяцу</div>
                        </div>
                        <DollarOutlined style={{ fontSize: 32, color: '#6366f1', opacity: 0.5 }} />
                    </div>
                </div>

                <div className="kpi-card blue stagger-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="kpi-value">7</div>
                            <div className="kpi-label">Сделки</div>
                            <div className="kpi-change up"><ArrowUpOutlined /> +3 новых</div>
                        </div>
                        <ShoppingCartOutlined style={{ fontSize: 32, color: '#1890ff', opacity: 0.5 }} />
                    </div>
                </div>

                <div className="kpi-card green stagger-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="kpi-value">3</div>
                            <div className="kpi-label">Активные проекты</div>
                            <div className="kpi-change up"><RiseOutlined /> на 55% выполнено</div>
                        </div>
                        <ProjectOutlined style={{ fontSize: 32, color: '#52c41a', opacity: 0.5 }} />
                    </div>
                </div>

                <div className="kpi-card orange stagger-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="kpi-value">10</div>
                            <div className="kpi-label">Сотрудники</div>
                            <div className="kpi-change up"><ArrowUpOutlined /> 1 новый</div>
                        </div>
                        <TeamOutlined style={{ fontSize: 32, color: '#fa8c16', opacity: 0.5 }} />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={14}>
                    <div className="chart-container">
                        <h3>📊 Выручка и расходы (млн UZS)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="revenue" name="Выручка" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2} />
                                <Area type="monotone" dataKey="expenses" name="Расходы" stroke="#ff4d4f" fill="url(#colorExpenses)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Col>

                <Col xs={24} lg={10}>
                    <div className="chart-container">
                        <h3>🎯 Воронка продаж</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={pipelineData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis dataKey="stage" type="category" stroke="#64748b" fontSize={11} width={90} />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }}
                                />
                                <Bar dataKey="count" name="Сделки" radius={[0, 6, 6, 0]} barSize={20}>
                                    {pipelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
            </Row>

            {/* Bottom Row */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card title="🔔 Последние активности" bordered={false}>
                        {activities.map((item, i) => (
                            <div key={i} className="activity-item">
                                <div className={`activity-icon ${item.cls}`}>{item.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, fontSize: 13 }}>{item.title}</div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                                </div>
                            </div>
                        ))}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="📋 Мои задачи на сегодня" bordered={false}>
                        <List
                            dataSource={tasks}
                            renderItem={(task) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<span style={{ fontSize: 13, fontWeight: 500 }}>{task.title}</span>}
                                        description={<Text type="secondary" style={{ fontSize: 12 }}>{task.project}</Text>}
                                    />
                                    <Tag color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'}>
                                        {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                                    </Tag>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
