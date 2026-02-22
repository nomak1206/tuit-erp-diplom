import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Drawer, Descriptions, Steps, Popconfirm, Tooltip, Spin, Tabs, Card, List, Badge } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExportOutlined, CheckCircleOutlined, SendOutlined, FileTextOutlined, CopyOutlined } from '@ant-design/icons'
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument, useDocTemplates } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'
import { useTranslation } from 'react-i18next'

const statusColors: Record<string, string> = { draft: 'default', review: 'blue', approved: 'green', rejected: 'red', archived: 'default', pending: 'orange' }
const statusStep: Record<string, number> = { draft: 0, review: 1, approved: 2 }

const categoryColors: Record<string, string> = { hr: 'purple', accounting: 'blue', legal: 'cyan', internal: 'default' }

export default function DocumentsList() {
    const { t } = useTranslation()
    const typeLabels: Record<string, string> = { contract: t('documents.doc_types.contract'), invoice: t('documents.doc_types.invoice'), act: t('documents.doc_types.act'), order: t('documents.doc_types.order'), memo: t('documents.doc_types.memo'), report: t('documents.doc_types.report'), payslip: t('documents.doc_types.payslip'), vacation_order: t('documents.doc_types.vacation_order'), timesheet: t('documents.doc_types.timesheet'), power_of_attorney: t('documents.doc_types.power_of_attorney'), other: t('documents.doc_types.other') }
    const statusLabels: Record<string, string> = { draft: t('warehouse.draft'), review: t('projects.statuses.review'), approved: t('common.approved'), rejected: t('common.rejected'), archived: t('common.archived'), pending: t('common.pending') }
    const categoryLabels: Record<string, string> = {
        hr: t('documents.categories.hr'),
        accounting: t('documents.categories.accounting'),
        legal: t('documents.categories.legal'),
        internal: t('common.internal'),
    }
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
            if (editRecord) { await updateDocument.mutateAsync({ id: editRecord.id, ...values }); message.success(t('common.saved')) }
            else { await createDocument.mutateAsync(values); message.success(t('common.created_ok')) }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error(t('common.error')) }
    }

    const handleDelete = async (id: number) => {
        try { await deleteDocument.mutateAsync(id); message.success(t('common.deleted_ok')); setDrawerOpen(false) }
        catch { message.error(t('common.error')) }
    }

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await updateDocument.mutateAsync({ id, status }); message.success(`Статус → "${statusLabels[status]}"`)
            if (selected?.id === id) setSelected({ ...selected, status })
        } catch { message.error(t('common.error')) }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'documents', [
            { key: 'number', title: t('documents.doc_number') }, { key: 'title', title: t('common.name') },
            { key: 'doc_type', title: t('common.type') }, { key: 'status', title: t('common.status') },
        ])
        message.success(`${t('common.export')}: ${filtered.length}`)
    }

    const columns = [
        { title: t('documents.doc_number'), dataIndex: 'number', key: 'number', width: 130, render: (v: string, r: any) => <span style={{ fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }} onClick={() => openDetail(r)}>{v || '—'}</span> },
        { title: t('common.name'), dataIndex: 'title', key: 'title', render: (v: string, r: any) => <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => openDetail(r)}>{v}</span> },
        { title: t('common.type'), dataIndex: 'doc_type', key: 'doc_type', render: (v: string) => <Tag color="blue">{typeLabels[v] || v}</Tag> },
        { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] || s}</Tag> },
        { title: t('common.date'), dataIndex: 'created_at', key: 'date', render: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—' },
        {
            title: '', key: 'actions', width: 200,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('common.details')}><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title={t('common.edit')}><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    {r.status === 'draft' && <Tooltip title={t('documents.review_action')}><Button type="text" icon={<SendOutlined />} style={{ color: '#1890ff' }} onClick={() => handleStatusChange(r.id, 'review')} /></Tooltip>}
                    {r.status === 'review' && <Tooltip title={t('documents.approve_action')}><Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }} onClick={() => handleStatusChange(r.id, 'approved')} /></Tooltip>}
                    <Popconfirm title={t('documents.delete_doc')} onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const DocumentsTab = (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Space wrap>
                    <Input placeholder={t('documents.search_docs')} prefix={<SearchOutlined />} style={{ width: 300 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                    <Select placeholder={t('common.type')} style={{ width: 180 }} allowClear value={typeFilter} onChange={setTypeFilter} options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
                    <Select placeholder={t('common.status')} style={{ width: 160 }} allowClear value={statusFilter} onChange={setStatusFilter} options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
                </Space>
                <Space>
                    <Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>{t('documents.new_document')}</Button>
                </Space>
            </div>
            <Table scroll={{ x: 'max-content' }} columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10, showTotal: total => `${t('common.total')}: ${total}`, showSizeChanger: true }}
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
                            <Tooltip title={t('documents.create_doc')} key="create">
                                <Button type="link" icon={<CopyOutlined />} onClick={() => openCreate(tpl)}>{t('common.create', 'Использовать')}</Button>
                            </Tooltip>,
                        ]}
                    >
                        <p style={{ color: '#94a3b8', fontSize: 13, minHeight: 40 }}>{tpl.description || t('common.no_data', 'Нет описания')}</p>
                        <div style={{ marginTop: 8 }}>
                            <Tag>{typeLabels[tpl.doc_type] || tpl.doc_type}</Tag>
                            {tpl.fields && <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>{tpl.fields.length} {t('common.fields', 'полей')}</span>}
                        </div>
                    </Card>
                </Col>
            ))}
            {(templates as any[]).length === 0 && (
                <Col span={24}><div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>{t('documents.no_templates', 'Нет шаблонов')}</div></Col>
            )}
        </Row>
    )

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{t('documents.title')}</h1><p>{t('documents.subtitle')}</p>
            </div>

            <Tabs defaultActiveKey="documents" items={[
                { key: 'documents', label: <Badge count={documents.filter((d: any) => d.status === 'review').length} size="small" offset={[8, 0]}>{t('documents.title')}</Badge>, children: DocumentsTab },
                { key: 'templates', label: `${t('documents.templates', 'Andozalar')} (${(templates as any[]).length})`, children: TemplatesTab },
            ]} />

            <Modal title={editRecord ? t('documents.edit_document', 'Редактировать документ') : t('documents.new_document')} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createDocument.isPending || updateDocument.isPending}
                okText={editRecord ? t('common.save') : t('common.create')} cancelText={t('common.cancel')} width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ doc_type: 'contract', status: 'draft' }}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="number" label={t('documents.doc_number')} rules={[{ required: true }]}><Input placeholder="DOC-2026-001" /></Form.Item></Col>
                        <Col span={16}><Form.Item name="title" label={t('common.name')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="doc_type" label={t('common.type')}><Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="status" label={t('common.status')}><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={24}><Form.Item name="content" label={t('documents.content')}><Input.TextArea rows={4} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.title || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>{t('common.edit')}</Button>
                    {selected?.status === 'draft' && <Button type="primary" icon={<SendOutlined />} onClick={() => handleStatusChange(selected.id, 'review')}>{t('documents.review_action')}</Button>}
                    {selected?.status === 'review' && <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a' }} onClick={() => handleStatusChange(selected.id, 'approved')}>{t('documents.approve_action')}</Button>}
                </Space>}>
                {selected && (
                    <div>
                        <Steps current={statusStep[selected.status] ?? 0} size="small" style={{ marginBottom: 24 }} items={[{ title: t('warehouse.draft') }, { title: t('documents.review_action') }, { title: t('common.approved') }]} />
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label={t('documents.doc_number')}>{selected.number || '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('common.type')}><Tag color="blue">{typeLabels[selected.doc_type] || selected.doc_type}</Tag></Descriptions.Item>
                            <Descriptions.Item label={t('common.status')}><Tag color={statusColors[selected.status]}>{statusLabels[selected.status]}</Tag></Descriptions.Item>
                            <Descriptions.Item label={t('documents.content')}>{selected.content || '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('common.date')}>{selected.created_at ? new Date(selected.created_at).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    )
}
