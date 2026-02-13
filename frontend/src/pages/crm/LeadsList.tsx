import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, InputNumber, Row, Col, message, Drawer, Descriptions, Progress, Popconfirm, Tooltip } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExportOutlined, SwapOutlined } from '@ant-design/icons'
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, useCreateDeal } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'

const statusLabels: Record<string, string> = { new: 'Новый', contacted: 'Контакт', qualified: 'Квалифицирован', proposal: 'Предложение', converted: 'Конвертирован', lost: 'Потерян' }
const statusColors: Record<string, string> = { new: 'blue', contacted: 'cyan', qualified: 'green', proposal: 'orange', converted: 'purple', lost: 'red' }
const sourceLabels: Record<string, string> = { website: 'Сайт', referral: 'Рекомендация', social: 'Соц. сети', cold_call: 'Холодный звонок', advertisement: 'Реклама', other: 'Другое' }

export default function LeadsList() {
    const { data: leads = [], isLoading } = useLeads()
    const createLead = useCreateLead()
    const updateLead = useUpdateLead()
    const deleteLead = useDeleteLead()
    const createDeal = useCreateDeal()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string | undefined>()
    const [sourceFilter, setSourceFilter] = useState<string | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [form] = Form.useForm()

    const filtered = useMemo(() => {
        let result = leads
        if (search) { const s = search.toLowerCase(); result = result.filter((l: any) => l.title?.toLowerCase().includes(s) || l.company?.toLowerCase().includes(s) || l.contact_name?.toLowerCase().includes(s)) }
        if (statusFilter) result = result.filter((l: any) => l.status === statusFilter)
        if (sourceFilter) result = result.filter((l: any) => l.source === sourceFilter)
        return result
    }, [leads, search, statusFilter, sourceFilter])

    const openCreate = () => { setEditRecord(null); form.resetFields(); setModalOpen(true) }
    const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true) }
    const openDetail = (r: any) => { setSelected(r); setDrawerOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) { await updateLead.mutateAsync({ id: editRecord.id, ...values }); message.success('Лид обновлён') }
            else { await createLead.mutateAsync(values); message.success('Лид создан') }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Ошибка') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteLead.mutateAsync(id); message.success('Лид удалён') }
        catch { message.error('Ошибка') }
    }

    const handleConvert = async (lead: any) => {
        try {
            await createDeal.mutateAsync({ title: `Сделка: ${lead.title}`, amount: lead.budget || 0, stage: 'new', contact_id: lead.contact_id })
            await updateLead.mutateAsync({ id: lead.id, status: 'converted' })
            message.success(`Лид "${lead.title}" конвертирован в сделку`)
        } catch { message.error('Ошибка конвертации') }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'leads', [
            { key: 'title', title: 'Название' }, { key: 'company', title: 'Компания' },
            { key: 'status', title: 'Статус' }, { key: 'source', title: 'Источник' },
            { key: 'budget', title: 'Бюджет' }, { key: 'score', title: 'Скоринг' },
        ])
        message.success(`Экспортировано ${filtered.length} записей`)
    }

    const columns = [
        { title: 'Лид', dataIndex: 'title', key: 'title', render: (v: string, r: any) => <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => openDetail(r)}>{v}</span> },
        { title: 'Компания', dataIndex: 'company', key: 'company', render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '—' },
        { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] || s}</Tag> },
        { title: 'Источник', dataIndex: 'source', key: 'source', render: (s: string) => sourceLabels[s] || s },
        { title: 'Бюджет', dataIndex: 'budget', key: 'budget', render: (v: number) => v ? `${v.toLocaleString('ru-RU')} UZS` : '—', sorter: (a: any, b: any) => (a.budget || 0) - (b.budget || 0) },
        { title: 'Скоринг', dataIndex: 'score', key: 'score', render: (v: number) => <Progress percent={v || 0} size="small" strokeColor={v > 70 ? '#52c41a' : v > 40 ? '#fa8c16' : '#ff4d4f'} /> },
        {
            title: '', key: 'actions', width: 160,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Просмотр"><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title="Редактировать"><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    {r.status !== 'converted' && <Tooltip title="Конвертировать"><Popconfirm title="Конвертировать в сделку?" onConfirm={() => handleConvert(r)} okText="Да" cancelText="Нет"><Button type="text" icon={<SwapOutlined />} style={{ color: '#8b5cf6' }} /></Popconfirm></Tooltip>}
                    <Popconfirm title="Удалить лид?" onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>Лиды</h1><p>Управление потенциальными клиентами — {filtered.length} записей</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>Экспорт</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Новый лид</Button></Space>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder="Поиск..." prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder="Статус" style={{ width: 180 }} allowClear value={statusFilter} onChange={setStatusFilter} options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
                <Select placeholder="Источник" style={{ width: 180 }} allowClear value={sourceFilter} onChange={setSourceFilter} options={Object.entries(sourceLabels).map(([v, l]) => ({ value: v, label: l }))} />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" loading={isLoading}
                pagination={{ pageSize: 10, showTotal: t => `Всего: ${t}`, showSizeChanger: true }}
                onRow={(r) => ({ onClick: () => openDetail(r), style: { cursor: 'pointer' } })} />

            <Modal title={editRecord ? 'Редактировать лид' : 'Новый лид'} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createLead.isPending || updateLead.isPending}
                okText={editRecord ? 'Сохранить' : 'Создать'} cancelText="Отмена" width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'new', source: 'website', score: 50 }}>
                    <Row gutter={16}>
                        <Col span={24}><Form.Item name="title" label="Название" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="company" label="Компания"><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="contact_name" label="Контактное лицо"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="status" label="Статус"><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="source" label="Источник"><Select options={Object.entries(sourceLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="budget" label="Бюджет"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="score" label="Скоринг (0-100)"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.title || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={460}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>Редактировать</Button>
                    {selected?.status !== 'converted' && <Popconfirm title="Конвертировать?" onConfirm={() => { handleConvert(selected); setDrawerOpen(false) }}><Button type="primary" icon={<SwapOutlined />}>В сделку</Button></Popconfirm>}
                </Space>}>
                {selected && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Компания">{selected.company || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Контакт">{selected.contact_name || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Статус"><Tag color={statusColors[selected.status]}>{statusLabels[selected.status]}</Tag></Descriptions.Item>
                        <Descriptions.Item label="Источник">{sourceLabels[selected.source] || selected.source}</Descriptions.Item>
                        <Descriptions.Item label="Бюджет">{selected.budget ? `${selected.budget.toLocaleString('ru-RU')} UZS` : '—'}</Descriptions.Item>
                        <Descriptions.Item label="Скоринг"><Progress percent={selected.score || 0} size="small" /></Descriptions.Item>
                        <Descriptions.Item label="Email">{selected.email || '—'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    )
}
