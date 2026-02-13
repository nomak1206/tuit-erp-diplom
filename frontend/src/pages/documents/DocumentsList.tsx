import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Drawer, Descriptions, Steps, Popconfirm, Tooltip, Spin, Tabs, Card, List, Badge } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExportOutlined, CheckCircleOutlined, SendOutlined, FileTextOutlined, CopyOutlined } from '@ant-design/icons'
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument, useDocTemplates } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'

const typeLabels: Record<string, string> = {
    contract: 'Договор', invoice: 'Счёт', act: 'Акт', order: 'Приказ', memo: 'Служебная записка', report: 'Отчёт', other: 'Прочее',
    payslip: 'Расчётный лист', vacation_order: 'Приказ на отпуск', timesheet: 'Табель', power_of_attorney: 'Доверенность',
}
const statusLabels: Record<string, string> = { draft: 'Черновик', review: 'На проверке', approved: 'Утверждён', rejected: 'Отклонён', archived: 'Архив', pending: 'Ожидание' }
const statusColors: Record<string, string> = { draft: 'default', review: 'blue', approved: 'green', rejected: 'red', archived: 'default', pending: 'orange' }
const statusStep: Record<string, number> = { draft: 0, review: 1, approved: 2 }

const categoryLabels: Record<string, string> = { hr: 'Кадры', accounting: 'Бухгалтерия', legal: 'Юридический', internal: 'Внутренний' }
const categoryColors: Record<string, string> = { hr: 'purple', accounting: 'blue', legal: 'cyan', internal: 'default' }

export default function DocumentsList() {
    const { data: documents = [], isLoading } = useDocuments()
    const { data: templates = [] } = useDocTemplates()
    const createDocument = useCreateDocument()
    const updateDocument = useUpdateDocument()
    const deleteDocument = useDeleteDocument()
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string | undefined>()
    const [statusFilter, setStatusFilter] = useState<string | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [form] = Form.useForm()

    const filtered = useMemo(() => {
        let result = documents
        if (search) { const s = search.toLowerCase(); result = result.filter((d: any) => d.title?.toLowerCase().includes(s) || d.number?.toLowerCase().includes(s)) }
        if (typeFilter) result = result.filter((d: any) => d.doc_type === typeFilter)
        if (statusFilter) result = result.filter((d: any) => d.status === statusFilter)
        return result
    }, [documents, search, typeFilter, statusFilter])

    const openCreate = (tpl?: any) => {
        setEditRecord(null)
        if (tpl) {
            form.setFieldsValue({ title: tpl.name, doc_type: tpl.doc_type, status: 'draft', content: tpl.description || '' })
        } else {
            form.resetFields()
        }
        setModalOpen(true)
    }
    const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true) }
    const openDetail = (r: any) => { setSelected(r); setDrawerOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) { await updateDocument.mutateAsync({ id: editRecord.id, ...values }); message.success('Документ обновлён') }
            else { await createDocument.mutateAsync(values); message.success('Документ создан') }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Ошибка') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteDocument.mutateAsync(id); message.success('Документ удалён'); setDrawerOpen(false) }
        catch { message.error('Ошибка') }
    }

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await updateDocument.mutateAsync({ id, status }); message.success(`Статус → "${statusLabels[status]}"`)
            if (selected?.id === id) setSelected({ ...selected, status })
        } catch { message.error('Ошибка') }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'documents', [
            { key: 'number', title: 'Номер' }, { key: 'title', title: 'Название' },
            { key: 'doc_type', title: 'Тип' }, { key: 'status', title: 'Статус' },
        ])
        message.success(`Экспортировано ${filtered.length} записей`)
    }

    const columns = [
        { title: 'Номер', dataIndex: 'number', key: 'number', width: 130, render: (v: string, r: any) => <span style={{ fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }} onClick={() => openDetail(r)}>{v || '—'}</span> },
        { title: 'Название', dataIndex: 'title', key: 'title', render: (v: string, r: any) => <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => openDetail(r)}>{v}</span> },
        { title: 'Тип', dataIndex: 'doc_type', key: 'doc_type', render: (v: string) => <Tag color="blue">{typeLabels[v] || v}</Tag> },
        { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] || s}</Tag> },
        { title: 'Дата', dataIndex: 'created_at', key: 'date', render: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—' },
        {
            title: '', key: 'actions', width: 200,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Просмотр"><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title="Редактировать"><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    {r.status === 'draft' && <Tooltip title="На проверку"><Button type="text" icon={<SendOutlined />} style={{ color: '#1890ff' }} onClick={() => handleStatusChange(r.id, 'review')} /></Tooltip>}
                    {r.status === 'review' && <Tooltip title="Утвердить"><Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }} onClick={() => handleStatusChange(r.id, 'approved')} /></Tooltip>}
                    <Popconfirm title="Удалить документ?" onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const DocumentsTab = (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Space wrap>
                    <Input placeholder="Поиск по номеру или названию..." prefix={<SearchOutlined />} style={{ width: 300 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                    <Select placeholder="Тип" style={{ width: 180 }} allowClear value={typeFilter} onChange={setTypeFilter} options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
                    <Select placeholder="Статус" style={{ width: 160 }} allowClear value={statusFilter} onChange={setStatusFilter} options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
                </Space>
                <Space>
                    <Button icon={<ExportOutlined />} onClick={handleExport}>Экспорт</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>Новый документ</Button>
                </Space>
            </div>
            <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10, showTotal: t => `Всего: ${t}`, showSizeChanger: true }}
                onRow={(r) => ({ onClick: () => openDetail(r), style: { cursor: 'pointer' } })} />
        </div>
    )

    const TemplatesTab = (
        <Row gutter={[16, 16]}>
            {(templates as any[]).map((tpl: any) => (
                <Col xs={24} sm={12} lg={8} key={tpl.id}>
                    <Card
                        hoverable
                        title={<><FileTextOutlined /> {tpl.name}</>}
                        extra={<Tag color={categoryColors[tpl.category] || 'default'}>{categoryLabels[tpl.category] || tpl.category}</Tag>}
                        actions={[
                            <Tooltip title="Создать документ" key="create">
                                <Button type="link" icon={<CopyOutlined />} onClick={() => openCreate(tpl)}>Использовать</Button>
                            </Tooltip>,
                        ]}
                    >
                        <p style={{ color: '#94a3b8', fontSize: 13, minHeight: 40 }}>{tpl.description || 'Нет описания'}</p>
                        <div style={{ marginTop: 8 }}>
                            <Tag>{typeLabels[tpl.doc_type] || tpl.doc_type}</Tag>
                            {tpl.fields && <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>{tpl.fields.length} полей</span>}
                        </div>
                    </Card>
                </Col>
            ))}
            {(templates as any[]).length === 0 && (
                <Col span={24}><div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Нет шаблонов</div></Col>
            )}
        </Row>
    )

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Документы</h1><p>Электронный документооборот — {documents.length} документов, {(templates as any[]).length} шаблонов</p>
            </div>

            <Tabs defaultActiveKey="documents" items={[
                { key: 'documents', label: <Badge count={documents.filter((d: any) => d.status === 'review').length} size="small" offset={[8, 0]}>Документы</Badge>, children: DocumentsTab },
                { key: 'templates', label: `Шаблоны (${(templates as any[]).length})`, children: TemplatesTab },
            ]} />

            <Modal title={editRecord ? 'Редактировать документ' : 'Новый документ'} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createDocument.isPending || updateDocument.isPending}
                okText={editRecord ? 'Сохранить' : 'Создать'} cancelText="Отмена" width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ doc_type: 'contract', status: 'draft' }}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="number" label="Номер" rules={[{ required: true }]}><Input placeholder="DOC-2026-001" /></Form.Item></Col>
                        <Col span={16}><Form.Item name="title" label="Название" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="doc_type" label="Тип"><Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="status" label="Статус"><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={24}><Form.Item name="content" label="Содержание"><Input.TextArea rows={4} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.title || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>Редактировать</Button>
                    {selected?.status === 'draft' && <Button type="primary" icon={<SendOutlined />} onClick={() => handleStatusChange(selected.id, 'review')}>На проверку</Button>}
                    {selected?.status === 'review' && <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a' }} onClick={() => handleStatusChange(selected.id, 'approved')}>Утвердить</Button>}
                </Space>}>
                {selected && (
                    <div>
                        <Steps current={statusStep[selected.status] ?? 0} size="small" style={{ marginBottom: 24 }} items={[{ title: 'Черновик' }, { title: 'Проверка' }, { title: 'Утверждён' }]} />
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Номер">{selected.number || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Тип"><Tag color="blue">{typeLabels[selected.doc_type] || selected.doc_type}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Статус"><Tag color={statusColors[selected.status]}>{statusLabels[selected.status]}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Содержание">{selected.content || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Создан">{selected.created_at ? new Date(selected.created_at).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    )
}
