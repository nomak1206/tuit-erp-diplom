import { Table, Tag, Button, Space, Input } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

const statusMap: Record<string, { color: string; label: string }> = {
    paid: { color: 'green', label: 'Оплачен' },
    sent: { color: 'blue', label: 'Отправлен' },
    draft: { color: 'default', label: 'Черновик' },
    overdue: { color: 'red', label: 'Просрочен' },
    cancelled: { color: 'default', label: 'Отменён' },
}

const invoices = [
    { id: 1, number: 'INV-2026-001', contact_name: 'TechCorp UZ', date: '20.01.2026', due_date: '20.02.2026', status: 'paid', total: 17250000 },
    { id: 2, number: 'INV-2026-002', contact_name: 'MediaGroup', date: '09.02.2026', due_date: '09.03.2026', status: 'sent', total: 13800000 },
    { id: 3, number: 'INV-2026-003', contact_name: 'BuildPro', date: '11.02.2026', due_date: '11.03.2026', status: 'draft', total: 28750000 },
    { id: 4, number: 'INV-2026-004', contact_name: 'FoodMarket', date: '15.01.2026', due_date: '15.02.2026', status: 'overdue', total: 9200000 },
]

const columns = [
    { title: '№ Счёта', dataIndex: 'number', key: 'number', render: (v: string) => <span style={{ fontWeight: 600, color: '#818cf8' }}>{v}</span> },
    { title: 'Контрагент', dataIndex: 'contact_name', key: 'contact_name' },
    { title: 'Дата', dataIndex: 'date', key: 'date' },
    { title: 'Срок оплаты', dataIndex: 'due_date', key: 'due_date' },
    { title: 'Сумма (UZS)', dataIndex: 'total', key: 'total', render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toLocaleString('ru-RU')}</span>, sorter: (a: any, b: any) => a.total - b.total },
    { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label}</Tag> },
]

export default function Invoices() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Счета на оплату</h1><p>Управление счетами и оплатами</p></div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск счетов..." prefix={<SearchOutlined />} style={{ width: 280 }} />
                <Button type="primary" icon={<PlusOutlined />}>Создать счёт</Button>
            </Space>
            <Table columns={columns} dataSource={invoices} rowKey="id" pagination={{ pageSize: 10 }} />
        </div>
    )
}
