import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Drawer, Descriptions, Steps, Popconfirm, Tooltip, Spin, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined, ExportOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SendOutlined, CheckCircleOutlined, FilePdfOutlined } from '@ant-design/icons'
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from '../../api/hooks'
import { exportToCSV, exportToExcel, exportToPrint } from '../../utils/export'
import { useTranslation } from 'react-i18next'

const statusColors: Record<string, string> = { draft: 'default', sent: 'blue', paid: 'green', overdue: 'red', cancelled: 'default' }
const statusStep: Record<string, number> = { draft: 0, sent: 1, paid: 2 }

export default function Invoices() {
    const { t, i18n } = useTranslation()
    const statusLabels: Record<string, string> = { draft: t('warehouse.draft'), sent: t('accounting.invoice_statuses.sent'), paid: t('accounting.invoice_statuses.paid'), overdue: t('accounting.invoice_statuses.overdue'), cancelled: t('accounting.invoice_statuses.cancelled') }
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
            const subtotal = values.subtotal || 0
            const ndsRate = values.nds_rate ?? 12
            const ndsAmount = Math.round(subtotal * ndsRate / 100)
            const total = subtotal + ndsAmount
            const payload = { ...values, tax_amount: ndsAmount, nds_rate: ndsRate, total_amount: total, total, tax: ndsAmount }
            if (editRecord) { await updateInvoice.mutateAsync({ id: editRecord.id, ...payload }); message.success(t('common.saved')) }
            else { await createInvoice.mutateAsync(payload); message.success(t('common.created_ok')) }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error(t('common.error')) }
    }

    const handleDelete = async (id: number) => {
        try { await deleteInvoice.mutateAsync(id); message.success(t('common.deleted_ok')); setDrawerOpen(false) }
        catch { message.error(t('common.error')) }
    }

    const handleStatusChange = async (id: number, status: string) => {
        try { await updateInvoice.mutateAsync({ id, status }); message.success(t('common.saved')) }
        catch { message.error(t('common.error')) }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'invoices', [
            { key: 'number', title: t('accounting.invoice_number') }, { key: 'client_name', title: t('accounting.client_name') },
            { key: 'total_amount', title: t('common.amount') }, { key: 'status', title: t('common.status') },
        ])
        message.success(`${t('common.export')}: ${filtered.length}`)
    }

    const handleExcelExport = () => {
        exportToExcel(filtered, 'invoices', [
            { key: 'number', title: t('accounting.invoice_print_title', '№ счёта') }, { key: 'client_name', title: t('accounting.client_name') },
            { key: 'subtotal', title: t('accounting.subtotal_no_nds', 'Сумма без НДС') }, { key: 'nds_rate', title: t('accounting.nds_rate', 'Ставка НДС %') },
            { key: 'nds_amount', title: t('accounting.nds_amount', 'Сумма НДС') }, { key: 'total_amount', title: t('accounting.total_amount', 'Итого') },
            { key: 'currency', title: t('accounting.currency', 'Валюта') }, { key: 'status', title: t('common.status', 'Статус') },
            { key: 'issue_date', title: t('common.date', 'Дата') }, { key: 'buyer_inn', title: t('accounting.buyer_inn', 'ИНН покупателя') },
        ], t('accounting.invoices_title', 'Счета-фактуры'))
        message.success(`Excel: ${filtered.length}`)
    }

    const handlePrintInvoice = (inv: any) => {
        const locale = i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU'
        const html = `<h1>${t('accounting.invoice_print_title', 'СЧЁТ-ФАКТУРА №')} ${inv.number}</h1>
        <p><strong>${t('common.date', 'Дата')}:</strong> ${inv.issue_date ? new Date(inv.issue_date).toLocaleDateString(locale) : '—'}</p>
        <table>
          <tr><th>${t('accounting.supplier', 'Поставщик (ИНН)')}</th><td>${inv.supplier_inn || '—'}</td></tr>
          <tr><th>${t('accounting.buyer', 'Покупатель')}</th><td>${inv.client_name || '—'}</td></tr>
          <tr><th>${t('accounting.buyer_inn', 'ИНН покупателя')}</th><td>${inv.buyer_inn || '—'}</td></tr>
          <tr><th>${t('accounting.contract_number', 'Договор №')}</th><td>${inv.contract_number || '—'}</td></tr>
        </table>
        <h2>${t('accounting.calculation', 'Расчёт')}</h2>
        <table>
          <tr><th>${t('accounting.subtotal_no_nds', 'Сумма без НДС')}</th><td class="right">${(inv.subtotal || 0).toLocaleString(locale)} ${inv.currency || 'UZS'}</td></tr>
          <tr><th>${t('accounting.nds', 'НДС')} ${inv.nds_rate || 12}%</th><td class="right">${(inv.nds_amount || 0).toLocaleString(locale)} ${inv.currency || 'UZS'}</td></tr>
          <tr><th><strong>${t('accounting.total_amount', 'ИТОГО')}</strong></th><td class="right"><strong>${(inv.total_amount || 0).toLocaleString(locale)} ${inv.currency || 'UZS'}</strong></td></tr>
        </table>
        <div class="stamp"><div>${t('accounting.director', 'Руководитель')} ____________</div><div>${t('accounting.accountant', 'Бухгалтер')} ____________</div></div>`
        exportToPrint(`${t('accounting.invoice', 'Счёт-фактура')} ${inv.number}`, html)
    }

    const totalAmount = filtered.reduce((s: number, i: any) => s + (i.total_amount || 0), 0)
    const paidAmount = filtered.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + (i.total_amount || 0), 0)

    const columns = [
        { title: t('accounting.invoice_number'), dataIndex: 'number', key: 'number', width: 120, render: (v: string, r: any) => <span style={{ fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer' }} onClick={() => openDetail(r)}>{v}</span> },
        { title: t('accounting.client_name'), dataIndex: 'client_name', key: 'client_name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v || '—'}</span> },
        { title: t('common.amount'), dataIndex: 'total_amount', key: 'total_amount', render: (v: number) => <span style={{ fontWeight: 700, color: '#818cf8' }}>{(v || 0).toLocaleString('ru-RU')} UZS</span>, sorter: (a: any, b: any) => (a.total_amount || 0) - (b.total_amount || 0) },
        { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] || s}</Tag> },
        { title: t('common.date'), dataIndex: 'issue_date', key: 'issue_date', render: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—' },
        {
            title: '', key: 'actions', width: 180,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('common.details')}><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title={t('common.edit')}><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    {r.status === 'draft' && <Tooltip title={t('accounting.send')}><Button type="text" icon={<SendOutlined />} style={{ color: '#1890ff' }} onClick={() => handleStatusChange(r.id, 'sent')} /></Tooltip>}
                    {r.status === 'sent' && <Tooltip title={t('accounting.paid_action')}><Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }} onClick={() => handleStatusChange(r.id, 'paid')} /></Tooltip>}
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('accounting.invoices_title')}</h1><p>{t('common.total')}: <strong>{totalAmount.toLocaleString('ru-RU')} UZS</strong> | {t('accounting.invoice_statuses.paid')}: <strong style={{ color: '#52c41a' }}>{paidAmount.toLocaleString('ru-RU')} UZS</strong></p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button><Button icon={<ExportOutlined />} onClick={handleExcelExport}>Excel</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('accounting.new_invoice')}</Button></Space>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder={t('accounting.search_number')} prefix={<SearchOutlined />} style={{ width: 300 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder={t('common.status')} style={{ width: 160 }} allowClear value={statusFilter} onChange={setStatusFilter} options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
            </Space>
            <Table scroll={{ x: 'max-content' }} columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10, showTotal: total => `${t('common.total')}: ${total}` }}
                onRow={(r) => ({ onClick: () => openDetail(r), style: { cursor: 'pointer' } })} />

            <Modal title={editRecord ? t('common.edit') : t('accounting.new_invoice')} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createInvoice.isPending || updateInvoice.isPending}
                okText={editRecord ? t('common.save') : t('common.create')} cancelText={t('common.cancel')} width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'draft', nds_rate: 12, currency: 'UZS' }}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="number" label={t('accounting.invoice_number')} rules={[{ required: true }]}><Input placeholder="INV-2026-001" /></Form.Item></Col>
                        <Col span={16}><Form.Item name="client_name" label={t('accounting.client_name')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="subtotal" label={t('accounting.subtotal_no_nds', 'Сумма без НДС')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="nds_rate" label={t('accounting.nds_rate', 'Ставка НДС %')}><Select options={[{ value: 12, label: '12%' }, { value: 0, label: t('accounting.without_nds', 'Без НДС') }]} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="currency" label={t('accounting.currency', 'Валюта')}><Select options={[{ value: 'UZS', label: 'UZS' }, { value: 'USD', label: 'USD' }]} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="status" label={t('common.status')}><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="issue_date" label={t('accounting.issue_date')}><Input type="date" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="due_date" label={t('accounting.due_date')}><Input type="date" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="supplier_inn" label={t('accounting.supplier_inn', 'ИНН поставщика')}><Input placeholder="123456789" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="buyer_inn" label={t('accounting.buyer_inn', 'ИНН покупателя')}><Input placeholder="987654321" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="contract_number" label={t('accounting.contract_number', 'Номер договора')}><Input placeholder="ДГ-2026-001" /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.number || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={480}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>{t('common.edit')}</Button>
                    {selected?.status === 'draft' && <Button type="primary" icon={<SendOutlined />} onClick={() => { handleStatusChange(selected.id, 'sent'); setSelected({ ...selected, status: 'sent' }) }}>{t('accounting.invoice_statuses.sent')}</Button>}
                    {selected?.status === 'sent' && <Button type="primary" icon={<CheckCircleOutlined />} style={{ background: '#52c41a' }} onClick={() => { handleStatusChange(selected.id, 'paid'); setSelected({ ...selected, status: 'paid' }) }}>{t('accounting.invoice_statuses.paid')}</Button>}
                </Space>}>
                {selected && (
                    <div>
                        <Steps current={statusStep[selected.status] ?? 0} size="small" style={{ marginBottom: 24 }} items={[{ title: t('warehouse.draft') }, { title: t('accounting.invoice_statuses.sent') }, { title: t('accounting.invoice_statuses.paid') }]} />
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label={t('accounting.invoice_number')}>{selected.number}</Descriptions.Item>
                            <Descriptions.Item label={t('accounting.client_name')}>{selected.client_name || '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('accounting.subtotal_no_nds', 'Сумма без НДС')}>{(selected.subtotal || 0).toLocaleString(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU')} {selected.currency || 'UZS'}</Descriptions.Item>
                            <Descriptions.Item label={`${t('accounting.nds', 'НДС')} ${selected.nds_rate || 12}%`}>{(selected.nds_amount || 0).toLocaleString(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU')} {selected.currency || 'UZS'}</Descriptions.Item>
                            <Descriptions.Item label={t('accounting.total_amount')}><span style={{ fontWeight: 700, color: '#818cf8', fontSize: 16 }}>{(selected.total_amount || 0).toLocaleString('ru-RU')} {selected.currency || 'UZS'}</span></Descriptions.Item>
                            <Descriptions.Item label={t('common.status')}><Tag color={statusColors[selected.status]}>{statusLabels[selected.status]}</Tag></Descriptions.Item>
                            <Descriptions.Item label={t('common.date')}>{selected.issue_date ? new Date(selected.issue_date).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('accounting.due_date')}>{selected.due_date ? new Date(selected.due_date).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                            {selected.supplier_inn && <Descriptions.Item label={t('accounting.supplier_inn', 'ИНН поставщика')}>{selected.supplier_inn}</Descriptions.Item>}
                            {selected.buyer_inn && <Descriptions.Item label={t('accounting.buyer_inn', 'ИНН покупателя')}>{selected.buyer_inn}</Descriptions.Item>}
                            {selected.contract_number && <Descriptions.Item label={t('accounting.contract_number', 'Договор №')}>{selected.contract_number}</Descriptions.Item>}
                        </Descriptions>
                        <div style={{ marginTop: 16 }}>
                            <Button icon={<FilePdfOutlined />} onClick={() => handlePrintInvoice(selected)}>{t('accounting.print_invoice', 'Печать счёт-фактуры')}</Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    )
}
