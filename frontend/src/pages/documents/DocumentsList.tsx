import { Table, Tag, Button, Space, Input } from 'antd'
import { PlusOutlined, SearchOutlined, FileTextOutlined, FilePdfOutlined, FileExcelOutlined, FileWordOutlined } from '@ant-design/icons'

const typeIcons: Record<string, any> = {
    contract: <FileTextOutlined style={{ color: '#6366f1' }} />,
    invoice: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
    report: <FileExcelOutlined style={{ color: '#52c41a' }} />,
    letter: <FileWordOutlined style={{ color: '#1890ff' }} />,
    other: <FileTextOutlined style={{ color: '#64748b' }} />,
}

const typeLabels: Record<string, string> = { contract: 'Договор', invoice: 'Счёт', report: 'Отчёт', letter: 'Письмо', other: 'Прочее' }

const statusMap: Record<string, { color: string; label: string }> = {
    draft: { color: 'default', label: 'Черновик' },
    pending: { color: 'orange', label: 'На согласовании' },
    approved: { color: 'green', label: 'Утверждён' },
    rejected: { color: 'red', label: 'Отклонён' },
    archived: { color: 'default', label: 'Архив' },
}

const documents = [
    { id: 1, title: 'Договор с TechCorp — ERP внедрение', number: 'DOC-2026-001', type: 'contract', status: 'approved', version: 3, created: '15.01.2026', author: 'Бобур Ахмедов' },
    { id: 2, title: 'Коммерческое предложение BuildPro', number: 'DOC-2026-002', type: 'letter', status: 'pending', version: 1, created: '08.02.2026', author: 'Гулнора Маматова' },
    { id: 3, title: 'Финансовый отчёт Q4-2025', number: 'DOC-2026-003', type: 'report', status: 'approved', version: 2, created: '10.01.2026', author: 'Татьяна Козлова' },
    { id: 4, title: 'Акт приёмки — MediaGroup', number: 'DOC-2026-004', type: 'contract', status: 'draft', version: 1, created: '11.02.2026', author: 'Бобур Ахмедов' },
    { id: 5, title: 'Заявка на закупку оборудования', number: 'DOC-2026-005', type: 'other', status: 'rejected', version: 2, created: '05.02.2026', author: 'Равшан Турсунов' },
    { id: 6, title: 'Политика ИБ v2.0', number: 'DOC-2026-006', type: 'other', status: 'pending', version: 1, created: '12.02.2026', author: 'Алексей Иванов' },
]

const columns = [
    { title: '', dataIndex: 'type', key: 'icon', width: 40, render: (v: string) => typeIcons[v] },
    { title: 'Документ', dataIndex: 'title', key: 'title', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: '№', dataIndex: 'number', key: 'number', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Тип', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color="blue">{typeLabels[v]}</Tag> },
    { title: 'Версия', dataIndex: 'version', key: 'version', width: 80, render: (v: number) => `v${v}` },
    { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label}</Tag> },
    { title: 'Автор', dataIndex: 'author', key: 'author' },
    { title: 'Дата', dataIndex: 'created', key: 'created' },
]

export default function DocumentsList() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Документы</h1><p>Электронный документооборот и согласование</p></div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск документов..." prefix={<SearchOutlined />} style={{ width: 280 }} />
                <Button type="primary" icon={<PlusOutlined />}>Создать документ</Button>
            </Space>
            <Table columns={columns} dataSource={documents} rowKey="id" pagination={{ pageSize: 10, showTotal: (t) => `Всего: ${t}` }} />
        </div>
    )
}
