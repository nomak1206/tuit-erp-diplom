import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, InputNumber, Input, Select, Row, Col, message, Spin, Space, Statistic, DatePicker, Descriptions, Divider, Alert } from 'antd'
import { PlusOutlined, AuditOutlined, CheckCircleOutlined, WarningOutlined, FileTextOutlined } from '@ant-design/icons'
import { useProducts, useWarehouses, useInventories, useCreateInventory } from '../../api/hooks'
import { useTranslation } from 'react-i18next'

const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function InventoryCheck() {
    const { t } = useTranslation()
    const { data: products = [], isLoading: pl } = useProducts()
    const { data: warehouses = [] } = useWarehouses()
    const { data: inventories = [], isLoading: il } = useInventories()
    const createInventory = useCreateInventory()
    const [modalOpen, setModalOpen] = useState(false)
    const [viewDoc, setViewDoc] = useState<any>(null)
    const [form] = Form.useForm()
    const [items, setItems] = useState<any[]>([])

    const initItems = () => {
        const rows = products.map((p: any) => ({
            product_id: p.id,
            product_name: p.name,
            book_qty: Math.floor(Math.random() * 30) + 5,
            actual_qty: 0,
            diff: 0,
            comment: '',
        }))
        setItems(rows)
    }

    const openCreate = () => {
        form.resetFields()
        initItems()
        setModalOpen(true)
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        newItems[index].diff = (newItems[index].actual_qty || 0) - (newItems[index].book_qty || 0)
        setItems(newItems)
    }

    const handleSubmit = async () => {
        try {
            const values = form.getFieldsValue()
            await createInventory.mutateAsync({
                date: values.date?.format?.('YYYY-MM-DD') || new Date().toISOString().slice(0, 10),
                warehouse_id: values.warehouse_id || 1,
                commission: values.commission || '',
                items: items.map(i => ({ product_id: i.product_id, book_qty: i.book_qty, actual_qty: i.actual_qty, comment: i.comment })),
            })
            message.success(t('common.saved'))
            setModalOpen(false)
        } catch { message.error(t('common.error')) }
    }

    if (pl || il) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const totalDiscrepancies = inventories.reduce((s: number, inv: any) => s + (inv.items?.filter((i: any) => i.diff !== 0).length || 0), 0)

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('warehouse.inventory_title')}</h1><p>{t('warehouse.inventory_desc')}</p></div>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('warehouse.new_inventory')}</Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={8}><Card><Statistic title={t('warehouse.inventories_count')} value={inventories.length} prefix={<AuditOutlined style={{ color: '#6366f1' }} />} /></Card></Col>
                <Col xs={8}><Card><Statistic title={t('warehouse.discrepancies')} value={totalDiscrepancies} prefix={<WarningOutlined style={{ color: totalDiscrepancies > 0 ? '#f97316' : '#22c55e' }} />} valueStyle={{ color: totalDiscrepancies > 0 ? '#f97316' : '#22c55e' }} /></Card></Col>
                <Col xs={8}><Card><Statistic title={t('warehouse.products_on_record')} value={products.length} prefix={<FileTextOutlined style={{ color: '#8b5cf6' }} />} /></Card></Col>
            </Row>

            <Card title={t('warehouse.inventory_documents')}>
                <Table scroll={{ x: 'max-content' }}
                    dataSource={inventories}
                    rowKey="id"
                    columns={[
                        { title: t('common.number'), dataIndex: 'id', width: 60, render: (v: number) => `INV-${String(v).padStart(3, '0')}` },
                        { title: t('common.date'), dataIndex: 'date', render: (v: string) => new Date(v).toLocaleDateString('ru-RU') },
                        { title: t('warehouse.warehouse'), dataIndex: 'warehouse_id', render: (v: number) => warehouses.find((w: any) => w.id === v)?.name || `Ombor ${v}` },
                        { title: t('common.status'), dataIndex: 'status', render: (v: string) => <Tag color={v === 'completed' ? 'green' : 'orange'} icon={v === 'completed' ? <CheckCircleOutlined /> : undefined}>{v === 'completed' ? t('warehouse.completed') : t('warehouse.draft')}</Tag> },
                        { title: t('warehouse.items_count'), key: 'items', render: (_: any, r: any) => r.items?.length || 0 },
                        { title: t('warehouse.discrepancies'), key: 'disc', render: (_: any, r: any) => { const d = r.items?.filter((i: any) => i.diff !== 0).length || 0; return d > 0 ? <Tag color="orange">{d}</Tag> : <Tag color="green">0</Tag> } },
                        { title: t('warehouse.commission'), dataIndex: 'commission', ellipsis: true },
                        { title: '', key: 'view', width: 100, render: (_: any, r: any) => <Button type="link" onClick={() => setViewDoc(r)}>{t('common.details')}</Button> },
                    ]}
                    pagination={false}
                />
            </Card>

            {/* Create inventory modal */}
            <Modal title={t('warehouse.new_inventory')} open={modalOpen} onCancel={() => setModalOpen(false)}
                onOk={handleSubmit} confirmLoading={createInventory.isPending}
                okText={t('common.save')} cancelText={t('common.cancel')} width={900}>
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="warehouse_id" label={t('warehouse.warehouse')} initialValue={1}><Select options={warehouses.map((w: any) => ({ value: w.id, label: w.name }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="date" label={t('common.date')}><Input type="date" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="commission" label={t('warehouse.commission')}><Input placeholder={t('warehouse.commission_members')} /></Form.Item></Col>
                    </Row>
                </Form>
                <Divider />
                <Alert type="info" message={t('warehouse.inventory_hint')} showIcon style={{ marginBottom: 16 }} />
                <Table scroll={{ x: 'max-content' }}
                    dataSource={items}
                    rowKey="product_id"
                    size="small"
                    pagination={false}
                    columns={[
                        { title: t('warehouse.product_name'), dataIndex: 'product_name', width: 200 },
                        { title: t('warehouse.book_qty'), dataIndex: 'book_qty', width: 80, align: 'center' as const },
                        { title: t('warehouse.actual_qty'), key: 'actual', width: 100, render: (_: any, r: any, i: number) => <InputNumber min={0} value={r.actual_qty} onChange={v => updateItem(i, 'actual_qty', v || 0)} size="small" style={{ width: 80 }} /> },
                        { title: t('warehouse.discrepancy'), dataIndex: 'diff', width: 120, render: (v: number) => <span style={{ color: v > 0 ? '#22c55e' : v < 0 ? '#f43f5e' : '#94a3b8', fontWeight: 600 }}>{v > 0 ? '+' : ''}{v}</span> },
                        { title: t('warehouse.comment'), key: 'comment', render: (_: any, r: any, i: number) => <Input value={r.comment} onChange={e => updateItem(i, 'comment', e.target.value)} size="small" placeholder={t('warehouse.reason')} /> },
                    ]}
                />
            </Modal>

            {/* View document drawer */}
            <Modal title={`${t('warehouse.inventory_title')} INV-${String(viewDoc?.id).padStart(3, '0')}`} open={!!viewDoc} onCancel={() => setViewDoc(null)} footer={null} width={700}>
                {viewDoc && (
                    <>
                        <Descriptions column={3} bordered size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label={t('common.date')}>{new Date(viewDoc.date).toLocaleDateString('ru-RU')}</Descriptions.Item>
                            <Descriptions.Item label={t('warehouse.warehouse')}>{warehouses.find((w: any) => w.id === viewDoc.warehouse_id)?.name}</Descriptions.Item>
                            <Descriptions.Item label={t('common.status')}><Tag color="green">{viewDoc.status === 'completed' ? t('warehouse.completed') : viewDoc.status}</Tag></Descriptions.Item>
                            <Descriptions.Item label={t('warehouse.commission')} span={3}>{viewDoc.commission}</Descriptions.Item>
                        </Descriptions>
                        <Table scroll={{ x: 'max-content' }}
                            dataSource={viewDoc.items || []}
                            rowKey="product_id"
                            size="small"
                            pagination={false}
                            columns={[
                                { title: t('warehouse.product_name'), dataIndex: 'product_name' },
                                { title: t('warehouse.book_qty'), dataIndex: 'book_qty', align: 'center' as const },
                                { title: t('warehouse.actual_qty'), dataIndex: 'actual_qty', align: 'center' as const },
                                { title: t('warehouse.discrepancy'), dataIndex: 'diff', render: (v: number) => <span style={{ color: v > 0 ? '#22c55e' : v < 0 ? '#f43f5e' : '#94a3b8', fontWeight: 700 }}>{v > 0 ? `+${v}` : v}</span> },
                                { title: t('warehouse.comment'), dataIndex: 'comment' },
                            ]}
                        />
                    </>
                )}
            </Modal>
        </div>
    )
}
