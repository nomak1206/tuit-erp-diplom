import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, InputNumber, Row, Col, message, Drawer, Descriptions, Progress, Popconfirm, Tooltip } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExportOutlined, SwapOutlined } from '@ant-design/icons'
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, useCreateDeal } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'
import { useTranslation } from 'react-i18next'

const statusColors: Record<string, string> = { new: 'blue', contacted: 'cyan', qualified: 'green', proposal: 'orange', converted: 'purple', lost: 'red' }

export default function LeadsList() {
    const { t } = useTranslation()

    const statusLabels: Record<string, string> = { new: t('crm.lead_statuses.new'), contacted: t('crm.lead_statuses.contacted'), qualified: t('crm.lead_statuses.qualified'), proposal: t('crm.lead_statuses.proposal'), converted: t('crm.lead_statuses.converted'), lost: t('crm.lead_statuses.lost') }
    const sourceLabels: Record<string, string> = { website: t('leads.sources.website'), referral: t('leads.sources.referral'), social: t('leads.sources.social'), cold_call: t('leads.sources.cold_call'), advertisement: t('leads.sources.ads'), other: t('leads.sources.other') }

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
            if (editRecord) { await updateLead.mutateAsync({ id: editRecord.id, ...values }); message.success(t('common.saved')) }
            else { await createLead.mutateAsync(values); message.success(t('common.created_ok')) }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error(t('common.error')) }
    }

    const handleDelete = async (id: number) => {
        try { await deleteLead.mutateAsync(id); message.success(t('common.deleted_ok')) }
        catch { message.error(t('common.error')) }
    }

    const handleConvert = async (lead: any) => {
        try {
            await createDeal.mutateAsync({ title: `${t('deals.deal_prefix')}: ${lead.title}`, amount: lead.budget || 0, stage: 'new', contact_id: lead.contact_id })
            await updateLead.mutateAsync({ id: lead.id, status: 'converted' })
            message.success(t('common.saved'))
        } catch { message.error(t('common.error')) }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'leads', [
            { key: 'title', title: t('common.name') }, { key: 'company', title: t('contacts.company') },
            { key: 'status', title: t('common.status') }, { key: 'source', title: t('leads.source') },
            { key: 'budget', title: t('projects.budget') }, { key: 'score', title: t('leads.score') },
        ])
        message.success(`${t('common.export')}: ${filtered.length}`)
    }

    const columns = [
        { title: t('crm.crm_leads'), dataIndex: 'title', key: 'title', render: (v: string, r: any) => <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => openDetail(r)}>{v}</span> },
        { title: t('contacts.company'), dataIndex: 'company', key: 'company', render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '—' },
        { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] || s}</Tag> },
        { title: t('leads.source'), dataIndex: 'source', key: 'source', render: (s: string) => sourceLabels[s] || s },
        { title: t('projects.budget'), dataIndex: 'budget', key: 'budget', render: (v: number) => v ? `${v.toLocaleString('ru-RU')} UZS` : '—', sorter: (a: any, b: any) => (a.budget || 0) - (b.budget || 0) },
        { title: t('leads.score'), dataIndex: 'score', key: 'score', render: (v: number) => <Progress percent={v || 0} size="small" strokeColor={v > 70 ? '#52c41a' : v > 40 ? '#fa8c16' : '#ff4d4f'} /> },
        {
            title: '', key: 'actions', width: 160,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('common.details')}><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title={t('common.edit')}><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    {r.status !== 'converted' && <Tooltip title={t('common.convert')}><Popconfirm title={t('common.confirm_convert')} onConfirm={() => handleConvert(r)} okText={t('common.yes')} cancelText={t('common.no')}><Button type="text" icon={<SwapOutlined />} style={{ color: '#8b5cf6' }} /></Popconfirm></Tooltip>}
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('leads.title')}</h1><p>{t('leads.subtitle')} — {filtered.length} {t('common.records')}</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('leads.new_lead')}</Button></Space>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder={t('common.search')} prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder={t('common.status')} style={{ width: 180 }} allowClear value={statusFilter} onChange={setStatusFilter} options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
                <Select placeholder={t('leads.source')} style={{ width: 180 }} allowClear value={sourceFilter} onChange={setSourceFilter} options={Object.entries(sourceLabels).map(([v, l]) => ({ value: v, label: l }))} />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" loading={isLoading} scroll={{ x: 'max-content' }}
                pagination={{ pageSize: 10, showTotal: total => `${t('common.total')}: ${total}`, showSizeChanger: true }}
                onRow={(r) => ({ onClick: () => openDetail(r), style: { cursor: 'pointer' } })} />

            <Modal title={editRecord ? t('leads.edit_lead') : t('leads.new_lead')} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createLead.isPending || updateLead.isPending}
                okText={editRecord ? t('common.save') : t('common.create')} cancelText={t('common.cancel')} width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'new', source: 'website', score: 50 }}>
                    <Row gutter={16}>
                        <Col span={24}><Form.Item name="title" label={t('common.name')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="company" label={t('contacts.company')}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="contact_name" label={t('contacts.title')}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="status" label={t('common.status')}><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="source" label={t('leads.source')}><Select options={Object.entries(sourceLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="budget" label={t('projects.budget')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="score" label={t('leads.score')}><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.title || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={460}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>{t('common.edit')}</Button>
                    {selected?.status !== 'converted' && <Popconfirm title={t('common.confirm_convert')} onConfirm={() => { handleConvert(selected); setDrawerOpen(false) }}><Button type="primary" icon={<SwapOutlined />}>{t('leads.to_deal')}</Button></Popconfirm>}
                </Space>}>
                {selected && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label={t('contacts.company')}>{selected.company || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('contacts.title')}>{selected.contact_name || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('common.status')}><Tag color={statusColors[selected.status]}>{statusLabels[selected.status]}</Tag></Descriptions.Item>
                        <Descriptions.Item label={t('leads.source')}>{sourceLabels[selected.source] || selected.source}</Descriptions.Item>
                        <Descriptions.Item label={t('projects.budget')}>{selected.budget ? `${selected.budget.toLocaleString('ru-RU')} UZS` : '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('leads.score')}><Progress percent={selected.score || 0} size="small" /></Descriptions.Item>
                        <Descriptions.Item label="Email">{selected.email || '—'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    )
}
