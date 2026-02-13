import { Table, Tag, Button, Space, Input, Progress } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

const statusMap: Record<string, { color: string; label: string }> = {
    active: { color: 'blue', label: 'Активный' },
    completed: { color: 'green', label: 'Завершён' },
    on_hold: { color: 'orange', label: 'Приостановлен' },
    cancelled: { color: 'red', label: 'Отменён' },
}

const projects = [
    { id: 1, name: 'Внедрение ERP TechCorp', client: 'TechCorp UZ', status: 'active', progress: 55, budget: 15000000, start: '01.02.2026', deadline: '30.06.2026', manager: 'Алексей Иванов', tasks: { total: 12, done: 5 } },
    { id: 2, name: 'CRM BuildPro', client: 'BuildPro', status: 'active', progress: 20, budget: 25000000, start: '15.01.2026', deadline: '30.08.2026', manager: 'Бобур Ахмедов', tasks: { total: 8, done: 2 } },
    { id: 3, name: 'Модуль аналитики', client: 'Внутренний', status: 'active', progress: 40, budget: 5000000, start: '01.01.2026', deadline: '31.03.2026', manager: 'Мария Петрова', tasks: { total: 6, done: 3 } },
]

const columns = [
    { title: 'Проект', dataIndex: 'name', key: 'name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Клиент', dataIndex: 'client', key: 'client', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label}</Tag> },
    { title: 'Прогресс', dataIndex: 'progress', key: 'progress', render: (v: number) => <Progress percent={v} size="small" strokeColor="#6366f1" style={{ width: 120 }} /> },
    { title: 'Задачи', dataIndex: 'tasks', key: 'tasks', render: (t: any) => <span>{t.done}/{t.total}</span> },
    { title: 'Бюджет (UZS)', dataIndex: 'budget', key: 'budget', render: (v: number) => v.toLocaleString('ru-RU') },
    { title: 'Дедлайн', dataIndex: 'deadline', key: 'deadline' },
    { title: 'PM', dataIndex: 'manager', key: 'pm' },
]

export default function ProjectsList() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Проекты</h1><p>Управление проектами предприятия</p></div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск проектов..." prefix={<SearchOutlined />} style={{ width: 280 }} />
                <Button type="primary" icon={<PlusOutlined />}>Новый проект</Button>
            </Space>
            <Table columns={columns} dataSource={projects} rowKey="id" pagination={{ pageSize: 10 }} />
        </div>
    )
}
