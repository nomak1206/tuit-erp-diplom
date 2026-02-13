import { Table, Tag, Button, Space, Input, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

const categories: Record<number, string> = { 1: 'Техника', 2: 'Мебель', 3: 'Расходники', 4: 'Канцтовары', 5: 'Прочее' }

const products = [
    { id: 1, sku: 'TECH-001', name: 'Ноутбук Dell Latitude 5540', category_id: 1, price: 12500000, quantity: 2, unit: 'шт' },
    { id: 2, sku: 'TECH-002', name: 'Монитор LG 27" 4K', category_id: 1, price: 4800000, quantity: 15, unit: 'шт' },
    { id: 3, sku: 'TECH-003', name: 'Клавиатура Logitech MX Keys', category_id: 1, price: 1200000, quantity: 20, unit: 'шт' },
    { id: 4, sku: 'FRN-001', name: 'Стол письменный 160x80', category_id: 2, price: 2500000, quantity: 8, unit: 'шт' },
    { id: 5, sku: 'FRN-002', name: 'Кресло офисное ErgoMax', category_id: 2, price: 3500000, quantity: 12, unit: 'шт' },
    { id: 6, sku: 'OFF-003', name: 'Бумага А4 Svetocopy (500л)', category_id: 4, price: 55000, quantity: 10, unit: 'пачка' },
    { id: 7, sku: 'OFF-004', name: 'Картридж HP 105A', category_id: 3, price: 350000, quantity: 3, unit: 'шт' },
    { id: 8, sku: 'TECH-004', name: 'МФУ HP LaserJet Pro', category_id: 1, price: 8500000, quantity: 4, unit: 'шт' },
]

const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 110, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Наименование', dataIndex: 'name', key: 'name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Категория', dataIndex: 'category_id', key: 'cat', render: (v: number) => <Tag color="blue">{categories[v]}</Tag> },
    { title: 'Цена (UZS)', dataIndex: 'price', key: 'price', render: (v: number) => v.toLocaleString('ru-RU'), sorter: (a: any, b: any) => a.price - b.price },
    { title: 'Остаток', dataIndex: 'quantity', key: 'qty', sorter: (a: any, b: any) => a.quantity - b.quantity, render: (v: number) => <span style={{ fontWeight: 600, color: v <= 5 ? '#ff4d4f' : v <= 10 ? '#faad14' : '#52c41a' }}>{v}</span> },
    { title: 'Ед.', dataIndex: 'unit', key: 'unit' },
    { title: 'Стоимость', key: 'total', render: (_: any, r: any) => <span style={{ color: '#818cf8', fontWeight: 500 }}>{(r.price * r.quantity).toLocaleString('ru-RU')}</span> },
]

export default function ProductsList() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Товары</h1><p>Каталог номенклатуры и складских остатков</p></div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск товаров..." prefix={<SearchOutlined />} style={{ width: 280 }} />
                <Button type="primary" icon={<PlusOutlined />}>Добавить товар</Button>
            </Space>
            <Table columns={columns} dataSource={products} rowKey="id" pagination={{ pageSize: 10, showTotal: (t) => `Всего: ${t}` }} />
        </div>
    )
}
