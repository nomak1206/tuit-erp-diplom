import { Table, Tag, Button, Space, Input, Avatar } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'

const deptNames: Record<number, string> = { 1: 'IT-отдел', 2: 'Продажи', 3: 'Бухгалтерия', 4: 'HR', 5: 'Склад' }
const statusMap: Record<string, { color: string; label: string }> = {
    active: { color: 'green', label: 'Работает' },
    on_leave: { color: 'orange', label: 'В отпуске' },
    dismissed: { color: 'red', label: 'Уволен' },
}

const employees = [
    { id: 1, employee_number: 'EMP-001', first_name: 'Алексей', last_name: 'Иванов', position: 'Руководитель IT', department_id: 1, salary: 12000000, status: 'active', phone: '+998901001001' },
    { id: 2, employee_number: 'EMP-002', first_name: 'Мария', last_name: 'Петрова', position: 'Разработчик', department_id: 1, salary: 9000000, status: 'active', phone: '+998901002002' },
    { id: 3, employee_number: 'EMP-003', first_name: 'Бобур', last_name: 'Ахмедов', position: 'Руководитель продаж', department_id: 2, salary: 11000000, status: 'active', phone: '+998901003003' },
    { id: 4, employee_number: 'EMP-004', first_name: 'Гулнора', last_name: 'Маматова', position: 'Менеджер по продажам', department_id: 2, salary: 7500000, status: 'active', phone: '+998901004004' },
    { id: 5, employee_number: 'EMP-005', first_name: 'Татьяна', last_name: 'Козлова', position: 'Главный бухгалтер', department_id: 3, salary: 10000000, status: 'active', phone: '+998901005005' },
    { id: 6, employee_number: 'EMP-006', first_name: 'Отабек', last_name: 'Назаров', position: 'Бухгалтер', department_id: 3, salary: 6500000, status: 'active', phone: '+998901006006' },
    { id: 7, employee_number: 'EMP-007', first_name: 'Динара', last_name: 'Юсупова', position: 'HR-менеджер', department_id: 4, salary: 8000000, status: 'active', phone: '+998901007007' },
    { id: 8, employee_number: 'EMP-008', first_name: 'Дмитрий', last_name: 'Сидоров', position: 'DevOps инженер', department_id: 1, salary: 10000000, status: 'active', phone: '+998901008008' },
    { id: 9, employee_number: 'EMP-009', first_name: 'Равшан', last_name: 'Турсунов', position: 'Заведующий складом', department_id: 5, salary: 7000000, status: 'active', phone: '+998901009009' },
    { id: 10, employee_number: 'EMP-010', first_name: 'Анна', last_name: 'Волкова', position: 'Стажёр', department_id: 2, salary: 4000000, status: 'active', phone: '+998901010010' },
]

const columns = [
    { title: 'Таб. №', dataIndex: 'employee_number', key: 'num', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Сотрудник', key: 'name', render: (_: any, r: any) => <Space><Avatar style={{ background: '#6366f1' }} icon={<UserOutlined />} size="small" /><span style={{ fontWeight: 600 }}>{r.first_name} {r.last_name}</span></Space> },
    { title: 'Должность', dataIndex: 'position', key: 'position' },
    { title: 'Отдел', dataIndex: 'department_id', key: 'dept', render: (v: number) => <Tag color="blue">{deptNames[v]}</Tag> },
    { title: 'Оклад (UZS)', dataIndex: 'salary', key: 'salary', render: (v: number) => v.toLocaleString('ru-RU'), sorter: (a: any, b: any) => a.salary - b.salary },
    { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label}</Tag> },
]

export default function EmployeesList() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Сотрудники</h1><p>Кадровый реестр предприятия</p></div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск сотрудников..." prefix={<SearchOutlined />} style={{ width: 280 }} />
                <Button type="primary" icon={<PlusOutlined />}>Добавить сотрудника</Button>
            </Space>
            <Table columns={columns} dataSource={employees} rowKey="id" pagination={{ pageSize: 10, showTotal: (t) => `Всего: ${t}` }} />
        </div>
    )
}
