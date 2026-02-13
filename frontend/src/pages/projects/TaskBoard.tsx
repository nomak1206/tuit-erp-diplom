import { Tag, Button, Avatar } from 'antd'
import { PlusOutlined, UserOutlined } from '@ant-design/icons'

interface Task {
    id: number; title: string; project: string; priority: string; assignee: string; status: string
}

const statuses = [
    { key: 'backlog', label: 'Бэклог', color: '#64748b' },
    { key: 'todo', label: 'К выполнению', color: '#8884d8' },
    { key: 'in_progress', label: 'В работе', color: '#1890ff' },
    { key: 'review', label: 'На проверке', color: '#faad14' },
    { key: 'done', label: 'Готово', color: '#52c41a' },
]

const priorityColors: Record<string, string> = { high: 'red', medium: 'orange', low: 'blue' }
const priorityLabels: Record<string, string> = { high: 'Высокий', medium: 'Средний', low: 'Низкий' }

const tasks: Task[] = [
    { id: 1, title: 'Проектирование базы данных', project: 'ERP TechCorp', priority: 'high', assignee: 'Мария Петрова', status: 'done' },
    { id: 2, title: 'API авторизации', project: 'ERP TechCorp', priority: 'high', assignee: 'Алексей Иванов', status: 'done' },
    { id: 3, title: 'Frontend Dashboard', project: 'ERP TechCorp', priority: 'high', assignee: 'Мария Петрова', status: 'in_progress' },
    { id: 4, title: 'Интеграция с 1С', project: 'ERP TechCorp', priority: 'medium', assignee: 'Дмитрий Сидоров', status: 'in_progress' },
    { id: 5, title: 'Модуль отчётов', project: 'Модуль аналитики', priority: 'medium', assignee: 'Мария Петрова', status: 'todo' },
    { id: 6, title: 'Виджеты графиков', project: 'Модуль аналитики', priority: 'medium', assignee: 'Мария Петрова', status: 'in_progress' },
    { id: 7, title: 'Тестирование', project: 'ERP TechCorp', priority: 'medium', assignee: 'Дмитрий Сидоров', status: 'backlog' },
    { id: 8, title: 'Документация API', project: 'ERP TechCorp', priority: 'low', assignee: 'Алексей Иванов', status: 'todo' },
    { id: 9, title: 'CI / CD Pipeline', project: 'ERP TechCorp', priority: 'medium', assignee: 'Дмитрий Сидоров', status: 'review' },
    { id: 10, title: 'Деплой на prod', project: 'ERP TechCorp', priority: 'high', assignee: 'Дмитрий Сидоров', status: 'backlog' },
]

export default function TaskBoard() {
    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>Kanban-доска задач</h1><p>Управление задачами в стиле Kanban</p></div>
                <Button type="primary" icon={<PlusOutlined />}>Новая задача</Button>
            </div>

            <div className="kanban-board">
                {statuses.map(status => {
                    const statusTasks = tasks.filter(t => t.status === status.key)
                    return (
                        <div className="kanban-column" key={status.key}>
                            <div className="kanban-column-header" style={{ borderColor: status.color }}>
                                <h4 style={{ color: status.color }}>{status.label}</h4>
                                <Tag style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: '#94a3b8' }}>{statusTasks.length}</Tag>
                            </div>
                            {statusTasks.map(task => (
                                <div className="kanban-card" key={task.id}>
                                    <div style={{ marginBottom: 4 }}>
                                        <Tag color={priorityColors[task.priority]} style={{ fontSize: 10 }}>{priorityLabels[task.priority]}</Tag>
                                    </div>
                                    <h5>{task.title}</h5>
                                    <p>{task.project}</p>
                                    <div className="kanban-card-footer">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Avatar size={20} style={{ background: '#6366f1' }} icon={<UserOutlined />} />
                                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{task.assignee}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
