import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Drawer, Descriptions, Popconfirm, Tooltip, Spin, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExportOutlined, BarcodeOutlined } from '@ant-design/icons'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'
import { useTranslation } from 'react-i18next'

export default function ProductsList() {
    const { t } = useTranslation()
    const { data: products = [], isLoading } = useProducts()
    const { data: categories = [] } = useCategories()
    const createProduct = useCreateProduct()
    const updateProduct = useUpdateProduct()
    const deleteProduct = useDeleteProduct()
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState<number | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [form] = Form.useForm()

    const filtered = useMemo(() => {
        let result = products
        if (search) { const s = search.toLowerCase(); result = result.filter((p: any) => p.name?.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s) || p.barcode?.includes(s)) }
        if (catFilter) result = result.filter((p: any) => p.category_id === catFilter)
        return result
    }, [products, search, catFilter])

    const getCatName = (id: number) => categories.find((c: any) => c.id === id)?.name || '—'

    const openCreate = () => { setEditRecord(null); form.resetFields(); setModalOpen(true) }
    const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true) }
    const openDetail = (r: any) => { setSelected(r); setDrawerOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) { await updateProduct.mutateAsync({ id: editRecord.id, ...values }); message.success(t('common.saved')) }
            else { await createProduct.mutateAsync(values); message.success(t('common.created_ok')) }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error(t('common.error')) }
    }

    const handleDelete = async (id: number) => {
        try { await deleteProduct.mutateAsync(id); message.success(t('common.deleted_ok')); setDrawerOpen(false) }
        catch { message.error(t('common.error')) }
    }

    const handleExport = () => {
        exportToCSV(filtered.map((p: any) => ({ ...p, category: getCatName(p.category_id), margin: p.sell_price && p.cost_price ? ((p.sell_price - p.cost_price) / p.sell_price * 100).toFixed(1) + '%' : '—' })), 'products', [
            { key: 'sku', title: t('warehouse.sku') }, { key: 'name', title: t('common.name') },
            { key: 'category', title: t('warehouse.category') }, { key: 'cost_price', title: t('warehouse.cost_price') },
            { key: 'sell_price', title: t('warehouse.sell_price') }, { key: 'quantity', title: t('warehouse.quantity') },
            { key: 'margin', title: t('warehouse.margin') },
        ])
        message.success(`${t('common.export')}: ${filtered.length}`)
    }

    const columns = [
        { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 100, render: (v: string) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v || '—'}</span> },
        { title: t('warehouse.product_name'), dataIndex: 'name', key: 'name', render: (v: string, r: any) => <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => openDetail(r)}>{v}</span> },
        { title: t('warehouse.category'), dataIndex: 'category_id', key: 'category_id', render: (v: number) => v ? <Tag color="blue">{getCatName(v)}</Tag> : '—' },
        { title: t('warehouse.cost_price'), dataIndex: 'cost_price', key: 'cost_price', render: (v: number) => v ? `${v.toLocaleString('ru-RU')} UZS` : '—' },
        { title: t('warehouse.sell_price'), dataIndex: 'sell_price', key: 'sell_price', render: (v: number) => v ? <span style={{ fontWeight: 600, color: '#818cf8' }}>{v.toLocaleString('ru-RU')} UZS</span> : '—', sorter: (a: any, b: any) => (a.sell_price || 0) - (b.sell_price || 0) },
        { title: t('warehouse.margin'), key: 'margin', render: (_: any, r: any) => { const m = r.sell_price && r.cost_price ? ((r.sell_price - r.cost_price) / r.sell_price * 100) : 0; return <Tag color={m > 30 ? 'green' : m > 15 ? 'orange' : 'red'}>{m.toFixed(1)}%</Tag> } },
        { title: t('warehouse.quantity'), dataIndex: 'quantity', key: 'quantity', render: (v: number) => <Tag color={(v || 0) <= 5 ? 'red' : (v || 0) <= 20 ? 'orange' : 'green'}>{v || 0}</Tag>, sorter: (a: any, b: any) => (a.quantity || 0) - (b.quantity || 0) },
        {
            title: '', key: 'actions', width: 120,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('common.details')}><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title={t('common.edit')}><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('warehouse.products_title')}</h1><p>{t('warehouse.nomenclature')} — {filtered.length} {t('common.items')}</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('warehouse.new_product')}</Button></Space>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder={t('common.search')} prefix={<SearchOutlined />} style={{ width: 320 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder={t('warehouse.category')} style={{ width: 200 }} allowClear value={catFilter} onChange={setCatFilter} options={categories.map((c: any) => ({ value: c.id, label: c.name }))} />
            </Space>
            <Table scroll={{ x: 'max-content' }} columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10, showTotal: total => `${t('common.total')}: ${total}`, showSizeChanger: true }}
                onRow={(r) => ({ onClick: () => openDetail(r), style: { cursor: 'pointer' } })} />

            <Modal title={editRecord ? t('warehouse.edit_product') : t('warehouse.new_product')} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createProduct.isPending || updateProduct.isPending}
                okText={editRecord ? t('common.save') : t('common.create')} cancelText={t('common.cancel')} width={600}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="sku" label={t('warehouse.sku')}><Input placeholder="PRD-001" /></Form.Item></Col>
                        <Col span={16}><Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="category_id" label={t('warehouse.category')}><Select allowClear options={categories.map((c: any) => ({ value: c.id, label: c.name }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="barcode" label={t('warehouse.barcode')}><Input prefix={<BarcodeOutlined />} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="cost_price" label={t('warehouse.cost_price')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="sell_price" label={t('warehouse.sell_price')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="quantity" label={t('warehouse.quantity')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="unit" label={t('warehouse.unit')}><Select options={[{ value: 'шт', label: t('warehouse.units.piece') }, { value: 'кг', label: t('warehouse.units.kg') }, { value: 'л', label: t('warehouse.units.liter') }, { value: 'м', label: t('warehouse.units.meter') }]} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="min_quantity" label={t('warehouse.min_stock')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.name || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={460}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>{t('common.edit')}</Button>
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => selected && handleDelete(selected.id)}>
                        <Button danger icon={<DeleteOutlined />}>{t('common.delete')}</Button>
                    </Popconfirm>
                </Space>}>
                {selected && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="SKU">{selected.sku || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('common.name')}>{selected.name}</Descriptions.Item>
                        <Descriptions.Item label={t('warehouse.category')}>{getCatName(selected.category_id)}</Descriptions.Item>
                        <Descriptions.Item label={t('warehouse.barcode')}>{selected.barcode || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('warehouse.cost_price')}>{selected.cost_price ? `${selected.cost_price.toLocaleString('ru-RU')} UZS` : '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('warehouse.sell_price')}><span style={{ fontWeight: 700, color: '#818cf8' }}>{selected.sell_price ? `${selected.sell_price.toLocaleString('ru-RU')} UZS` : '—'}</span></Descriptions.Item>
                        <Descriptions.Item label={t('warehouse.margin')}>{selected.sell_price && selected.cost_price ? `${((selected.sell_price - selected.cost_price) / selected.sell_price * 100).toFixed(1)}%` : '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('warehouse.quantity')}><Tag color={(selected.quantity || 0) <= 5 ? 'red' : 'green'}>{selected.quantity || 0} {selected.unit || 'шт'}</Tag></Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    )
}
