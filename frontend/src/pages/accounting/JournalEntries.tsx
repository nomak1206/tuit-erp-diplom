import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Modal, Form, Select, Row, Col, message, Spin, InputNumber, Popconfirm, Tooltip } from 'antd'
import { PlusOutlined, SearchOutlined, ExportOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { useJournalEntries, useCreateJournalEntry, useDeleteJournalEntry, useChartOfAccounts } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'
import { useTranslation } from 'react-i18next'

export default function JournalEntries() {
    const { t } = useTranslation()
    const { data: entries = [], isLoading } = useJournalEntries()
    const { data: accounts = [] } = useChartOfAccounts()
    const createEntry = useCreateJournalEntry()
    const deleteEntry = useDeleteJournalEntry()
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [form] = Form.useForm()

    const filtered = useMemo(() => {
        if (!search) return entries
        const s = search.toLowerCase()
        return entries.filter((e: any) => e.description?.toLowerCase().includes(s) || e.reference?.toLowerCase().includes(s))
    }, [entries, search])

    const handleCreate = async (values: any) => {
        try {
            const payload = { ...values, date: values.date?.format?.('YYYY-MM-DD') || values.date }
            await createEntry.mutateAsync(payload)
            message.success(t('common.created_ok'))
            setModalOpen(false); form.resetFields()
        } catch { message.error(t('common.error')) }
    }

    const handleDelete = async (id: number) => {
        try { await deleteEntry.mutateAsync(id); message.success(t('common.deleted_ok')) }
        catch { message.error(t('common.error')) }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'journal_entries', [
            { key: 'id', title: 'ID' }, { key: 'date', title: t('common.date') },
            { key: 'description', title: t('common.description') }, { key: 'reference', title: t('warehouse.reference') },
            { key: 'is_posted', title: t('common.status') },
        ])
        message.success(`${t('common.export')}: ${filtered.length}`)
    }

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: t('common.date'), dataIndex: 'date', key: 'date', width: 110, render: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—' },
        { title: t('common.description'), dataIndex: 'description', key: 'description', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
        { title: t('warehouse.reference'), dataIndex: 'reference', key: 'reference', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
        { title: t('common.status'), dataIndex: 'is_posted', key: 'is_posted', render: (v: boolean) => <Tag color={v ? 'green' : 'orange'} icon={v ? <CheckCircleOutlined /> : undefined}>{v ? t('warehouse.completed') : t('warehouse.draft')}</Tag> },
        { title: t('common.date'), dataIndex: 'created_at', key: 'created_at', render: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—' },
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
                <div><h1>{t('accounting.journal_title')}</h1><p>{t('accounting.journal_title')} — {filtered.length}</p></div>
                <Space>
                    <Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>{t('accounting.new_entry')}</Button>
                </Space>
            </div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder={t('accounting.search_desc')} prefix={<SearchOutlined />} style={{ width: 300 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" loading={isLoading} pagination={{ pageSize: 10, showTotal: total => `${t('common.total')}: ${total}` }} />

            <Modal title={t('accounting.new_entry')} open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }} onOk={() => form.submit()} confirmLoading={createEntry.isPending} okText={t('common.create')} cancelText={t('common.cancel')} width={600}>
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="date" label={t('common.date')} rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="reference" label={t('accounting.reference_label')}><Input placeholder="INV-2026-001" /></Form.Item></Col>
                        <Col span={24}><Form.Item name="description" label={t('common.description')} rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item></Col>
                    </Row>
                    <h4 style={{ marginBottom: 12, color: '#94a3b8' }}>{t('accounting.journal_title')}</h4>
                    <Form.List name="lines" initialValue={[{ debit: 0, credit: 0 }, { debit: 0, credit: 0 }]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field, idx) => (
                                    <Row gutter={8} key={field.key} style={{ marginBottom: 8 }}>
                                        <Col span={10}>
                                            <Form.Item {...field} name={[field.name, 'account_id']} rules={[{ required: true, message: 'Выберите счёт' }]} style={{ marginBottom: 0 }}>
                                                <Select placeholder={t('accounting.account')} options={accounts.map((a: any) => ({ value: a.id, label: `${a.code} ${a.name}` }))} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={5}><Form.Item {...field} name={[field.name, 'debit']} style={{ marginBottom: 0 }}><InputNumber placeholder={t('accounting.debit')} style={{ width: '100%' }} min={0} /></Form.Item></Col>
                                        <Col span={5}><Form.Item {...field} name={[field.name, 'credit']} style={{ marginBottom: 0 }}><InputNumber placeholder={t('accounting.credit')} style={{ width: '100%' }} min={0} /></Form.Item></Col>
                                        <Col span={4}>{fields.length > 2 && <Button danger type="text" onClick={() => remove(field.name)}>✕</Button>}</Col>
                                    </Row>
                                ))}
                                <Button type="dashed" onClick={() => add({ debit: 0, credit: 0 })} block icon={<PlusOutlined />} style={{ marginTop: 8 }}>+</Button>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    )
}
