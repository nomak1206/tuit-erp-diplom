import { Table, Tag, Button, Space, Input } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

const typeLabels: Record<string, { color: string; label: string }> = {
    receipt: { color: 'green', label: 'Приход' },
    shipment: { color: 'red', label: 'Расход' },
    transfer: { color: 'blue', label: 'Перемещение' },
    write_off: { color: 'default', label: 'Списание' },
    return: { color: 'orange', label: 'Возврат' },
}

const movements = [
    { id: 1, date: '10.02.2026', type: 'receipt', product: 'Монитор LG 27" 4K', quantity: 10, warehouse: 'Основной склад', document: 'ПН-2026-001', employee: 'Равшан Турсунов' },
    { id: 2, date: '09.02.2026', type: 'shipment', product: 'Ноутбук Dell Latitude 5540', quantity: 3, warehouse: 'Основной склад', document: 'РН-2026-001', employee: 'Равшан Турсунов' },
    { id: 3, date: '08.02.2026', type: 'transfer', product: 'Кресло офисное ErgoMax', quantity: 5, warehouse: 'Доп. склад', document: 'ПМ-2026-001', employee: 'Равшан Турсунов' },
    { id: 4, date: '05.02.2026', type: 'receipt', product: 'Бумага А4 Svetocopy', quantity: 100, warehouse: 'Основной склад', document: 'ПН-2026-002', employee: 'Равшан Турсунов' },
    { id: 5, date: '03.02.2026', type: 'write_off', product: 'Картридж HP 105A', quantity: 2, warehouse: 'Основной склад', document: 'АС-2026-001', employee: 'Татьяна Козлова' },
]

const columns = [
    { title: 'Дата', dataIndex: 'date', key: 'date', width: 110 },
    { title: 'Тип', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color={typeLabels[v]?.color}>{typeLabels[v]?.label}</Tag> },
    { title: 'Товар', dataIndex: 'product', key: 'product', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Кол-во', dataIndex: 'quantity', key: 'qty', width: 80 },
    { title: 'Склад', dataIndex: 'warehouse', key: 'wh', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Документ', dataIndex: 'document', key: 'doc', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Ответственный', dataIndex: 'employee', key: 'emp' },
]

export default function StockMovements() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Движения товаров</h1><p>Приход, расход, перемещение и списание</p></div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск..." prefix={<SearchOutlined />} style={{ width: 280 }} />
                <Button type="primary" icon={<PlusOutlined />}>Новое движение</Button>
            </Space>
            <Table columns={columns} dataSource={movements} rowKey="id" pagination={{ pageSize: 10 }} />
        </div>
    )
}
