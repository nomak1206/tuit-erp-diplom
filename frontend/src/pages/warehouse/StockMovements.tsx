import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Popconfirm, Tooltip, Spin, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined, ExportOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, SwapOutlined } from '@ant-design/icons'
import { useStockMovements, useCreateMovement, useDeleteMovement, useProducts, useWarehouses } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'
import { useTranslation } from 'react-i18next'

// removed typeLabels as we will construct dynamically or use i18n inline
const typeColors: Record<string, string> = { in: 'green', out: 'red', transfer: 'blue' }
const typeIcons: Record<string, React.ReactNode> = { in: <ArrowUpOutlined />, out: <ArrowDownOutlined />, transfer: <SwapOutlined /> }

export default function StockMovements() {
    const { t } = useTranslation()
    const { data: movements = [], isLoading } = useStockMovements()
    const { data: products = [] } = useProducts()
    const { data: warehouses = [] } = useWarehouses()
    const createMovement = useCreateMovement()
    const deleteMovement = useDeleteMovement()
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [form] = Form.useForm()

    const filtered = useMemo(() => {
        let result = movements
        if (search) { const s = search.toLowerCase(); result = result.filter((m: any) => getProductName(m.product_id).toLowerCase().includes(s) || m.reference?.toLowerCase().includes(s)) }
        if (typeFilter) result = result.filter((m: any) => m.movement_type === typeFilter)
        return result
    }, [movements, search, typeFilter])

    const getProductName = (id: number) => products.find((p: any) => p.id === id)?.name || `#${id}`
    const getWhName = (id: number) => warehouses.find((w: any) => w.id === id)?.name || `#${id}`

    const handleSubmit = async (values: any) => {
        try {
            const total = (values.quantity || 0) * (values.unit_price || 0)
            await createMovement.mutateAsync({ ...values, total_amount: total })
            message.success(t('common.created_ok')); setModalOpen(false); form.resetFields()
        } catch { message.error(t('common.error')) }
    }

    const handleDelete = async (id: number) => {
        try { await deleteMovement.mutateAsync(id); message.success(t('common.deleted_ok')) }
        catch { message.error(t('common.error')) }
    }

    const handleExport = () => {
        exportToCSV(filtered.map((m: any) => ({ ...m, product: getProductName(m.product_id), warehouse: getWhName(m.warehouse_id) })), 'stock_movements', [
            { key: 'reference', title: t('warehouse.reference', 'Номер') }, { key: 'movement_type', title: t('common.type') },
            { key: 'product', title: t('warehouse.product_name') }, { key: 'quantity', title: t('warehouse.quantity') },
            { key: 'unit_price', title: t('warehouse.price') }, { key: 'total_amount', title: t('common.amount') },
            { key: 'warehouse', title: t('warehouse.warehouse') },
        ])
        message.success(`${t('common.export')}: ${filtered.length}`)
    }

    const columns = [
        { title: t('common.date'), dataIndex: 'created_at', key: 'date', render: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—' },
        { title: t('common.type'), dataIndex: 'movement_type', key: 'type', render: (v: string) => <Tag icon={typeIcons[v]} color={typeColors[v]}>{t(`warehouse.movement_${v}`)}</Tag> },
        { title: t('warehouse.product_name'), dataIndex: 'product_id', key: 'product', render: (v: number) => <span style={{ fontWeight: 600 }}>{getProductName(v)}</span> },
        { title: t('warehouse.quantity'), dataIndex: 'quantity', key: 'quantity', render: (v: number, r: any) => <span style={{ fontWeight: 600, color: r.movement_type === 'in' ? '#52c41a' : r.movement_type === 'out' ? '#ff4d4f' : '#1890ff' }}>{r.movement_type === 'in' ? '+' : r.movement_type === 'out' ? '−' : '↔'}{v}</span> },
        { title: t('warehouse.price'), dataIndex: 'unit_price', key: 'price', render: (v: number) => v ? `${v.toLocaleString('ru-RU')} UZS` : '—' },
        { title: t('common.amount'), dataIndex: 'total_amount', key: 'total', render: (v: number) => v ? <span style={{ fontWeight: 600, color: '#818cf8' }}>{v.toLocaleString('ru-RU')} UZS</span> : '—', sorter: (a: any, b: any) => (a.total_amount || 0) - (b.total_amount || 0) },
        { title: t('warehouse.warehouse'), dataIndex: 'warehouse_id', key: 'warehouse', render: (v: number) => v ? getWhName(v) : '—' },
        { title: t('warehouse.reference'), dataIndex: 'reference', key: 'ref', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
        {
            title: '', key: 'actions', width: 60,
            render: (_: any, r: any) => (
                <Popconfirm title={t('common.confirm_delete')} onConfirm={() => handleDelete(r.id)}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('warehouse.movements_title', 'Движения товаров')}</h1><p>{t('warehouse.operations', 'Складские операции')} — {filtered.length} {t('common.records', 'записей')}</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>{t('warehouse.new_movement')}</Button></Space>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder={t('common.search')} prefix={<SearchOutlined />} style={{ width: 300 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder={t('common.type')} style={{ width: 160 }} allowClear value={typeFilter} onChange={setTypeFilter} options={['in', 'out', 'transfer'].map(v => ({ value: v, label: t(`warehouse.movement_${v}`) }))} />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10, showTotal: total => `${t('common.total')}: ${total}` }} />

            <Modal title={t('warehouse.new_movement')} open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }}
                onOk={() => form.submit()} confirmLoading={createMovement.isPending}
                okText={t('common.create')} cancelText={t('common.cancel')} width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ movement_type: 'in' }}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="movement_type" label={t('common.type')} rules={[{ required: true }]}><Select options={['in', 'out', 'transfer'].map(v => ({ value: v, label: t(`warehouse.movement_${v}`) }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="reference" label={t('warehouse.reference')}><Input placeholder="DOC-001" /></Form.Item></Col>
                        <Col span={24}><Form.Item name="product_id" label={t('warehouse.product_name')} rules={[{ required: true }]}><Select showSearch optionFilterProp="label" options={products.map((p: any) => ({ value: p.id, label: `${p.sku || ''} — ${p.name}` }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="quantity" label={t('warehouse.quantity')} rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="unit_price" label={t('warehouse.unit_price')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="warehouse_id" label={t('warehouse.warehouse')}><Select allowClear options={warehouses.map((w: any) => ({ value: w.id, label: w.name }))} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    )
}
