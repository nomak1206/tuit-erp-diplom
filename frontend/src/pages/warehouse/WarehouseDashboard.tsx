import { Row, Col, Spin, Card, Statistic, Space, Button } from 'antd'
import { ShoppingOutlined, InboxOutlined, SwapOutlined, ArrowRightOutlined, WarningOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useProducts, useStockMovements, useCategories, useWarehouses } from '../../api/hooks'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']

export default function WarehouseDashboard() {
    const navigate = useNavigate()
    const { data: products = [], isLoading: pl } = useProducts()
    const { data: movements = [], isLoading: ml } = useStockMovements()
    const { data: categories = [] } = useCategories()
    const { data: warehouses = [] } = useWarehouses()

    if (pl || ml) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const totalValue = products.reduce((s: number, p: any) => s + (p.sell_price || 0) * (p.quantity || 0), 0)
    const lowStock = products.filter((p: any) => (p.quantity || 0) <= (p.min_quantity || 5)).length

    const byCategory = categories.map((c: any) => ({ name: c.name, value: products.filter((p: any) => p.category_id === c.id).length })).filter((d: any) => d.value > 0)
    const moveTypes = Object.entries(movements.reduce((acc: any, m: any) => { acc[m.movement_type] = (acc[m.movement_type] || 0) + 1; return acc }, {})).map(([name, value]) => ({ name, value }))

    const kpis = [
        { title: 'Товаров', value: products.length, icon: <ShoppingOutlined />, color: '#6366f1', path: '/warehouse/products' },
        { title: 'Стоимость склада', value: `${(totalValue / 1e6).toFixed(1)}M`, icon: <InboxOutlined />, color: '#8b5cf6', path: '/warehouse/products' },
        { title: 'Движений', value: movements.length, icon: <SwapOutlined />, color: '#ec4899', path: '/warehouse/movements' },
        { title: 'Низкий остаток', value: lowStock, icon: <WarningOutlined />, color: lowStock > 0 ? '#f43f5e' : '#22c55e', path: '/warehouse/products' },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1>Склад — Обзор</h1><p>Управление товарными запасами</p></div>
            <Row gutter={[16, 16]}>
                {kpis.map(k => (
                    <Col xs={12} lg={6} key={k.title}>
                        <Card hoverable onClick={() => navigate(k.path)} style={{ cursor: 'pointer', borderLeft: `3px solid ${k.color}` }}>
                            <Statistic title={k.title} value={k.value} prefix={<span style={{ color: k.color }}>{k.icon}</span>} />
                            <div style={{ textAlign: 'right', marginTop: 8 }}><ArrowRightOutlined style={{ color: k.color }} /></div>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Товары по категориям" extra={<Button type="link" onClick={() => navigate('/warehouse/products')}>Все товары →</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={byCategory}><CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Типы движений" extra={<Button type="link" onClick={() => navigate('/warehouse/movements')}>Все движения →</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart><Pie data={moveTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                                {moveTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="Быстрые действия">
                        <Space wrap>
                            <Button icon={<ShoppingOutlined />} onClick={() => navigate('/warehouse/products')}>Товары</Button>
                            <Button icon={<SwapOutlined />} onClick={() => navigate('/warehouse/movements')}>Движения</Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
