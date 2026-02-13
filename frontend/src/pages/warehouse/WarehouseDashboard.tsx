import { Row, Col, Card, Statistic, Table, Tag } from 'antd'
import { ShopOutlined, InboxOutlined, WarningOutlined, SwapOutlined } from '@ant-design/icons'

const lowStock = [
    { id: 1, name: 'Ноутбук Dell Latitude 5540', sku: 'TECH-001', stock: 2, min: 5 },
    { id: 2, name: 'Бумага А4', sku: 'OFF-003', stock: 10, min: 50 },
    { id: 3, name: 'Картридж HP 105A', sku: 'OFF-004', stock: 3, min: 10 },
]

const recentMovements = [
    { id: 1, product: 'Монитор LG 27"', type: 'receipt', quantity: 10, date: '10.02.2026', warehouse: 'Основной' },
    { id: 2, product: 'Ноутбук Dell', type: 'shipment', quantity: 3, date: '09.02.2026', warehouse: 'Основной' },
    { id: 3, product: 'Кресло офисное', type: 'transfer', quantity: 5, date: '08.02.2026', warehouse: 'Доп. склад' },
]

const typeLabels: Record<string, { color: string; label: string }> = {
    receipt: { color: 'green', label: 'Приход' },
    shipment: { color: 'red', label: 'Расход' },
    transfer: { color: 'blue', label: 'Перемещение' },
}

export default function WarehouseDashboard() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Склад</h1><p>Управление товарами и запасами</p></div>
            <div className="stats-grid">
                <div className="kpi-card blue stagger-item"><div className="kpi-value">24</div><div className="kpi-label">Товаров</div></div>
                <div className="kpi-card green stagger-item"><div className="kpi-value">5</div><div className="kpi-label">Категорий</div></div>
                <div className="kpi-card red stagger-item"><div className="kpi-value">3</div><div className="kpi-label">Низкий остаток</div></div>
                <div className="kpi-card purple stagger-item"><div className="kpi-value">85.5M</div><div className="kpi-label">Стоимость запасов</div></div>
            </div>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card title={<span><WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />Низкий остаток</span>} bordered={false}>
                        <Table dataSource={lowStock} rowKey="id" pagination={false} size="small" columns={[
                            { title: 'Товар', dataIndex: 'name', key: 'name', render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
                            { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v: string) => <Tag>{v}</Tag> },
                            { title: 'Остаток', dataIndex: 'stock', key: 'stock', render: (v: number) => <span style={{ color: '#ff4d4f', fontWeight: 700 }}>{v}</span> },
                            { title: 'Мин.', dataIndex: 'min', key: 'min' },
                        ]} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="📦 Последние движения" bordered={false}>
                        <Table dataSource={recentMovements} rowKey="id" pagination={false} size="small" columns={[
                            { title: 'Товар', dataIndex: 'product', key: 'product', render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
                            { title: 'Тип', dataIndex: 'type', key: 'type', render: (v: string) => <Tag color={typeLabels[v]?.color}>{typeLabels[v]?.label}</Tag> },
                            { title: 'Кол-во', dataIndex: 'quantity', key: 'qty' },
                            { title: 'Дата', dataIndex: 'date', key: 'date' },
                        ]} />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
