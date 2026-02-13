import { Table, Tag, Button, Space, Input, Select } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

const statusColors: Record<string, string> = {
    new: 'blue',
    in_progress: 'orange',
    qualified: 'green',
    converted: 'purple',
    lost: 'red',
}

const statusLabels: Record<string, string> = {
    new: 'Новый',
    in_progress: 'В работе',
    qualified: 'Квалифицирован',
    converted: 'Конвертирован',
    lost: 'Потерян',
}

const sourceLabels: Record<string, string> = {
    website: 'Сайт',
    phone: 'Телефон',
    email: 'Email',
    referral: 'Реферал',
    social: 'Соцсети',
    advertising: 'Реклама',
    other: 'Другое',
}

const leads = [
    { id: 1, title: 'Автоматизация склада', contact_name: 'Азиз Каримов', company: 'TechCorp UZ', source: 'website', status: 'qualified', score: 85, estimated_value: 15000000 },
    { id: 2, title: 'CRM для строительной компании', contact_name: 'Нодира Рахимова', company: 'BuildPro', source: 'referral', status: 'in_progress', score: 70, estimated_value: 25000000 },
    { id: 3, title: 'ERP для логистики', contact_name: 'Дмитрий Ким', company: 'LogiTrans', source: 'phone', status: 'new', score: 60, estimated_value: 50000000 },
    { id: 4, title: 'Торговая платформа', contact_name: 'Шахзод Усманов', company: 'FoodMarket', source: 'advertising', status: 'new', score: 45, estimated_value: 8000000 },
    { id: 5, title: 'Маркетинговая аналитика', contact_name: 'Лола Мирзаева', company: 'MediaGroup', source: 'social', status: 'converted', score: 90, estimated_value: 12000000 },
]

const columns = [
    { title: 'Заголовок', dataIndex: 'title', key: 'title', render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: 'Контакт', dataIndex: 'contact_name', key: 'contact_name' },
    { title: 'Компания', dataIndex: 'company', key: 'company' },
    { title: 'Источник', dataIndex: 'source', key: 'source', render: (src: string) => <Tag>{sourceLabels[src] || src}</Tag> },
    { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> },
    { title: 'Скоринг', dataIndex: 'score', key: 'score', sorter: (a: any, b: any) => a.score - b.score, render: (v: number) => <Tag color={v >= 80 ? 'green' : v >= 50 ? 'orange' : 'red'}>{v}</Tag> },
    { title: 'Сумма (UZS)', dataIndex: 'estimated_value', key: 'estimated_value', render: (v: number) => v.toLocaleString('ru-RU'), sorter: (a: any, b: any) => a.estimated_value - b.estimated_value },
]

export default function LeadsList() {
    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Лиды</h1>
                <p>Управление потенциальными клиентами</p>
            </div>

            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder="Поиск лидов..." prefix={<SearchOutlined />} style={{ width: 250 }} />
                <Select placeholder="Статус" style={{ width: 160 }} allowClear options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
                <Select placeholder="Источник" style={{ width: 160 }} allowClear options={Object.entries(sourceLabels).map(([v, l]) => ({ value: v, label: l }))} />
                <Button type="primary" icon={<PlusOutlined />}>Новый лид</Button>
            </Space>

            <Table columns={columns} dataSource={leads} rowKey="id" pagination={{ pageSize: 10, showTotal: (t) => `Всего: ${t}` }} />
        </div>
    )
}
