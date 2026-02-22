import { useMemo } from 'react'
import { Row, Col, Spin, Card, Statistic, Space, Button, Table, Tag, Progress } from 'antd'
import { ShoppingOutlined, InboxOutlined, SwapOutlined, ArrowRightOutlined, WarningOutlined, AuditOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useProducts, useStockMovements, useCategories, useWarehouses } from '../../api/hooks'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']
const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function WarehouseDashboard() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: products = [], isLoading: pl } = useProducts()
    const { data: movements = [], isLoading: ml } = useStockMovements()
    const { data: categories = [] } = useCategories()
    const { data: warehouses = [] } = useWarehouses()

    /* ABC analysis computed from products */
    const abcData = useMemo(() => {
        const sorted = [...products].sort((a: any, b: any) => {
            const aVal = (a.sell_price || 0) * (a.quantity || 0)
            const bVal = (b.sell_price || 0) * (b.quantity || 0)
            return bVal - aVal
        })
        const total = sorted.reduce((s: number, p: any) => s + (p.sell_price || 0) * (p.quantity || 0), 0)
        let cum = 0
        return sorted.map((p: any) => {
            const val = (p.sell_price || 0) * (p.quantity || 0)
            cum += val
            const pct = total > 0 ? (cum / total) * 100 : 0
            const abc = pct <= 80 ? 'A' : pct <= 95 ? 'B' : 'C'
            return { ...p, stock_value: val, cum_pct: pct, abc }
        })
    }, [products])

    if (pl || ml) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const totalValue = products.reduce((s: number, p: any) => s + (p.sell_price || 0) * (p.quantity || 0), 0)
    const lowStock = products.filter((p: any) => (p.quantity || 0) <= (p.min_quantity || 5)).length

    const byCategory = categories.map((c: any) => ({ name: c.name, value: products.filter((p: any) => p.category_id === c.id).length })).filter((d: any) => d.value > 0)
    const moveTypes = Object.entries(movements.reduce((acc: any, m: any) => { acc[m.movement_type] = (acc[m.movement_type] || 0) + 1; return acc }, {})).map(([name, value]) => ({ name, value }))

    const kpis = [
        { title: t('warehouse.total_products'), value: products.length, icon: <ShoppingOutlined />, color: '#6366f1', path: '/warehouse/products' },
        { title: t('warehouse.total_value'), value: `${(totalValue / 1e6).toFixed(1)}M`, icon: <InboxOutlined />, color: '#8b5cf6', path: '/warehouse/products' },
        { title: t('warehouse.movements_today'), value: movements.length, icon: <SwapOutlined />, color: '#ec4899', path: '/warehouse/movements' },
        { title: t('warehouse.low_stock'), value: lowStock, icon: <WarningOutlined />, color: lowStock > 0 ? '#f43f5e' : '#22c55e', path: '/warehouse/products' },
    ]

    const abcColors: Record<string, string> = { A: '#22c55e', B: '#f97316', C: '#f43f5e' }
    const abcCounts = { A: abcData.filter(d => d.abc === 'A').length, B: abcData.filter(d => d.abc === 'B').length, C: abcData.filter(d => d.abc === 'C').length }

    const stockColumns = [
        { title: t('warehouse.product_name'), dataIndex: 'name', key: 'name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
        { title: t('warehouse.quantity'), dataIndex: 'quantity', key: 'qty', width: 100, align: 'center' as const, render: (v: number, r: any) => <span style={{ color: v <= (r.min_quantity || 5) ? '#f43f5e' : '#e2e8f0', fontWeight: 600 }}>{v}</span> },
        { title: t('warehouse.sell_price'), dataIndex: 'sell_price', key: 'sp', width: 140, align: 'right' as const, render: (v: number) => `${fmt(v)} UZS` },
        { title: t('warehouse.stock_value'), key: 'val', width: 150, align: 'right' as const, render: (_: any, r: any) => <span style={{ fontWeight: 500 }}>{fmt(r.stock_value)}</span> },
        { title: 'ABC', key: 'abc', width: 70, align: 'center' as const, render: (_: any, r: any) => <Tag color={abcColors[r.abc]} style={{ fontWeight: 700 }}>{r.abc}</Tag> },
        { title: t('warehouse.cum_share'), key: 'cum', width: 150, render: (_: any, r: any) => <Progress percent={Math.round(r.cum_pct)} size="small" strokeColor={abcColors[r.abc]} /> },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{t('warehouse.title')}</h1><p>{t('warehouse.subtitle')}</p></div>
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
                    <Card title={t('warehouse.by_categories')} extra={<Button type="link" onClick={() => navigate('/warehouse/products')}>{t('warehouse.all_products')}</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={byCategory}><CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title={t('warehouse.movement_types_title')} extra={<Button type="link" onClick={() => navigate('/warehouse/movements')}>{t('warehouse.all_movements')}</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart><Pie data={moveTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                                {moveTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* ABC Analysis + Stock Report Table */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title={t('warehouse.abc_report')} extra={
                        <Space>
                            <Tag color="green">A: {abcCounts.A} (80%)</Tag>
                            <Tag color="orange">B: {abcCounts.B} (15%)</Tag>
                            <Tag color="red">C: {abcCounts.C} (5%)</Tag>
                        </Space>
                    }>
                        <Table scroll={{ x: 'max-content' }} columns={stockColumns} dataSource={abcData} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title={t('common.quick_actions')}>
                        <Space wrap>
                            <Button icon={<ShoppingOutlined />} onClick={() => navigate('/warehouse/products')}>{t('warehouse.products_title')}</Button>
                            <Button icon={<SwapOutlined />} onClick={() => navigate('/warehouse/movements')}>{t('warehouse.movements_title')}</Button>
                            <Button icon={<AuditOutlined />} type="primary" onClick={() => navigate('/warehouse/inventory')}>{t('warehouse.inventory_title')}</Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

