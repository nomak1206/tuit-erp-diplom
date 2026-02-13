import { Table, Tag, Button, Space, Input } from 'antd'
import { PlusOutlined, SearchOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'

const entries = [
    { id: 1, date: '01.02.2026', description: 'Оплата от TechCorp за ERP', reference: 'ПП-001', is_posted: true },
    { id: 2, date: '03.02.2026', description: 'Закупка оборудования', reference: 'ПП-002', is_posted: true },
    { id: 3, date: '05.02.2026', description: 'Выплата зарплаты за январь', reference: 'ПП-003', is_posted: true },
    { id: 4, date: '07.02.2026', description: 'Оплата аренды офиса', reference: 'ПП-004', is_posted: true },
    { id: 5, date: '10.02.2026', description: 'Оплата от MediaGroup', reference: 'ПП-005', is_posted: false },
]

const columns = [
    { title: '№', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Дата', dataIndex: 'date', key: 'date', width: 110 },
    { title: 'Описание', dataIndex: 'description', key: 'description', render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: 'Документ', dataIndex: 'reference', key: 'reference', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Статус', dataIndex: 'is_posted', key: 'is_posted', render: (v: boolean) => v ? <Tag icon={<CheckCircleOutlined />} color="success">Проведён</Tag> : <Tag icon={<ClockCircleOutlined />} color="warning">Черновик</Tag> },
]

export default function JournalEntries() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Журнал проводок</h1><p>Бухгалтерские проводки предприятия</p></div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск..." prefix={<SearchOutlined />} style={{ width: 280 }} />
                <Button type="primary" icon={<PlusOutlined />}>Новая проводка</Button>
            </Space>
            <Table columns={columns} dataSource={entries} rowKey="id" pagination={{ pageSize: 10 }} />
        </div>
    )
}
