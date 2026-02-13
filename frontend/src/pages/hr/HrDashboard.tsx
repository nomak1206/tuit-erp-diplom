import { Row, Col, Card, Statistic, Tag, Table } from 'antd'
import { TeamOutlined, DollarOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const deptData = [
    { name: 'IT', count: 3 },
    { name: 'Продажи', count: 3 },
    { name: 'Бухгалтерия', count: 2 },
    { name: 'HR', count: 1 },
    { name: 'Склад', count: 1 },
]

const recentLeaves = [
    { id: 1, employee: 'Гулнора Маматова', type: 'vacation', start: '01.03.2026', days: 14, status: 'approved' },
    { id: 2, employee: 'Мария Петрова', type: 'sick', start: '08.02.2026', days: 3, status: 'approved' },
    { id: 3, employee: 'Анна Волкова', type: 'personal', start: '15.02.2026', days: 1, status: 'pending' },
]

const typeLabels: Record<string, string> = { vacation: 'Отпуск', sick: 'Больничный', personal: 'Отгул' }
const statusLabels: Record<string, { color: string; label: string }> = {
    approved: { color: 'green', label: 'Одобрено' },
    pending: { color: 'orange', label: 'Ожидает' },
    rejected: { color: 'red', label: 'Отклонено' },
}

export default function HrDashboard() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>HR и Кадры</h1><p>Управление персоналом предприятия</p></div>
            <div className="stats-grid">
                <div className="kpi-card blue stagger-item"><div className="kpi-value">10</div><div className="kpi-label">Сотрудников</div></div>
                <div className="kpi-card green stagger-item"><div className="kpi-value">5</div><div className="kpi-label">Отделов</div></div>
                <div className="kpi-card purple stagger-item"><div className="kpi-value">85 млн</div><div className="kpi-label">ФОТ / мес</div></div>
                <div className="kpi-card orange stagger-item"><div className="kpi-value">1</div><div className="kpi-label">Заявки на отпуск</div></div>
            </div>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <div className="chart-container"><h3>👥 Сотрудники по отделам</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={deptData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d4a', borderRadius: 8, color: '#e2e8f0' }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="📝 Заявки на отсутствие" bordered={false}>
                        <Table dataSource={recentLeaves} rowKey="id" pagination={false} size="small" columns={[
                            { title: 'Сотрудник', dataIndex: 'employee', key: 'employee', render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
                            { title: 'Тип', dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{typeLabels[v]}</Tag> },
                            { title: 'Начало', dataIndex: 'start', key: 'start' },
                            { title: 'Дней', dataIndex: 'days', key: 'days' },
                            { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusLabels[s]?.color}>{statusLabels[s]?.label}</Tag> },
                        ]} />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
