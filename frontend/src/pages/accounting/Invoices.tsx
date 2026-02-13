import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Drawer, Descriptions, Steps, Popconfirm, Tooltip, Spin, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined, ExportOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'

const statusLabels: Record<string, string> = { draft: 'Черновик', sent: 'Отправлен', paid: 'Оплачен', overdue: 'Просрочен', cancelled: 'Отменён' }
const statusColors: Record<string, string> = { draft: 'default', sent: 'blue', paid: 'green', overdue: 'red', cancelled: 'default' }
const statusStep: Record<string, number> = { draft: 0, sent: 1, paid: 2 }

export default function Invoices() {
    const { data: invoices = [], isLoading } = useInvoices()
    const createInvoice = useCreateInvoice()
    const updateInvoice = useUpdateInvoice()
    const deleteInvoice = useDeleteInvoice()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [form] = Form.useForm()

    const filtered = useMemo(() => {
        let result = invoices
        if (search) { const s = search.toLowerCase(); result = result.filter((i: any) => i.number?.toLowerCase().includes(s) || i.client_name?.toLowerCase().includes(s)) }
        if (statusFilter) result = result.filter((i: any) => i.status === statusFilter)
        return result
    }, [invoices, search, statusFilter])

    const openCreate = () => { setEditRecord(null); form.resetFields(); setModalOpen(true) }
    const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true) }
    const openDetail = (r: any) => { setSelected(r); setDrawerOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            const total = (values.subtotal || 0) + (values.tax_amount || 0)
            const payload = { ...values, total_amount: total }
            if (editRecord) { await updateInvoice.mutateAsync({ id: editRecord.id, ...payload }); message.success('Счёт обновлён') }
            else { await createInvoice.mutateAsync(payload); message.success('Счёт создан') }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Ошибка') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteInvoice.mutateAsync(id); message.success('Счёт удалён'); setDrawerOpen(false) }
        catch { message.error('Ошибка') }
    }

    const handleStatusChange = async (id: number, status: string) => {
        try { await updateInvoice.mutateAsync({ id, status }); message.success(`Статус изменён на "${statusLabels[status]}"`) }
        catch { message.error('Ошибка') }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'invoices', [
            { key: 'number', title: 'Номер' }, { key: 'client_name', title: 'Клиент' },
            { key: 'total_amount', title: 'Сумма' }, { key: 'status', title: 'Статус' },
        ])
        message.success(`Экспортировано ${filtered.length} записей`)
    }

    const totalAmount = filtered.reduce((s: number, i: any) => s + (i.total_amount || 0), 0)
    const paidAmount = filtered.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + (i.total_amount || 0), 0)

    const columns = [
        { title: 'Номер', dataIndex: 'number', key: 'number', width: 120, render: (v: string, r: any) => <span style={{ fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }} onClick={() => openDetail(r)}>{v}</span> },
        { title: 'Клиент', dataIndex: 'client_name', key: 'client_name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v || '—'}</span> },
        { title: 'Сумма', dataIndex: 'total_amount', key: 'total_amount', render: (v: number) => <span style={{ fontWeight: 700, color: '#818cf8' }}>{(v || 0).toLocaleString('ru-RU')} UZS</span>, sorter: (a: any, b: any) => (a.total_amount || 0) - (b.total_amount || 0) },
        { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] || s}</Tag> },
        { title: 'Дата', dataIndex: 'issue_date', key: 'issue_date', render: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—' },
        {
            title: '', key: 'actions', width: 180,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Просмотр"><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title="Редактировать"><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    {r.status === 'draft' && <Tooltip title="Отправить"><Button type="text" icon={<SendOutlined />} style={{ color: '#1890ff' }} onClick={() => handleStatusChange(r.id, 'sent')} /></Tooltip>}
                    {r.status === 'sent' && <Tooltip title="Оплачен"><Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }} onClick={() => handleStatusChange(r.id, 'paid')} /></Tooltip>}
                    <Popconfirm title="Удалить счёт?" onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>Счета-фактуры</h1><p>Всего: <strong>{totalAmount.toLocaleString('ru-RU')} UZS</strong> | Оплачено: <strong style={{ color: '#52c41a' }}>{paidAmount.toLocaleString('ru-RU')} UZS</strong></p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>Экспорт</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Новый счёт</Button></Space>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder="Поиск по номеру или клиенту..." prefix={<SearchOutlined />} style={{ width: 300 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder="Статус" style={{ width: 160 }} allowClear value={statusFilter} onChange={setStatusFilter} options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10, showTotal: t => `Всего: ${t}` }}
                onRow={(r) => ({ onClick: () => openDetail(r), style: { cursor: 'pointer' } })} />

            <Modal title={editRecord ? 'Редактировать счёт' : 'Новый счёт'} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createInvoice.isPending || updateInvoice.isPending}
                okText={editRecord ? 'Сохранить' : 'Создать'} cancelText="Отмена" width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'draft' }}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="number" label="Номер" rules={[{ required: true }]}><Input placeholder="INV-2026-001" /></Form.Item></Col>
                        <Col span={16}><Form.Item name="client_name" label="Клиент" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="subtotal" label="Подытог"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="tax_amount" label="Налог"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="status" label="Статус"><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="issue_date" label="Дата выставления"><Input type="date" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="due_date" label="Срок оплаты"><Input type="date" /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.number || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>Редактировать</Button>
                    {selected?.status === 'draft' && <Button type="primary" icon={<SendOutlined />} onClick={() => { handleStatusChange(selected.id, 'sent'); setSelected({ ...selected, status: 'sent' }) }}>Отправить</Button>}
                    {selected?.status === 'sent' && <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a' }} onClick={() => { handleStatusChange(selected.id, 'paid'); setSelected({ ...selected, status: 'paid' }) }}>Оплачен</Button>}
                </Space>}>
                {selected && (
                    <div>
                        <Steps current={statusStep[selected.status] ?? 0} size="small" style={{ marginBottom: 24 }} items={[{ title: 'Черновик' }, { title: 'Отправлен' }, { title: 'Оплачен' }]} />
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Номер">{selected.number}</Descriptions.Item>
                            <Descriptions.Item label="Клиент">{selected.client_name || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Подытог">{(selected.subtotal || 0).toLocaleString('ru-RU')} UZS</Descriptions.Item>
                            <Descriptions.Item label="Налог">{(selected.tax_amount || 0).toLocaleString('ru-RU')} UZS</Descriptions.Item>
                            <Descriptions.Item label="Итого"><span style={{ fontWeight: 700, color: '#818cf8', fontSize: 16 }}>{(selected.total_amount || 0).toLocaleString('ru-RU')} UZS</span></Descriptions.Item>
                            <Descriptions.Item label="Статус"><Tag color={statusColors[selected.status]}>{statusLabels[selected.status]}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Дата">{selected.issue_date ? new Date(selected.issue_date).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                            <Descriptions.Item label="Срок">{selected.due_date ? new Date(selected.due_date).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    )
}
