import { useState, useMemo } from 'react'
import { Table, Button, Space, Input, Tag, Modal, Form, message, Drawer, Descriptions, Popconfirm, Tooltip, Row, Col } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExportOutlined, BankOutlined, IdcardOutlined } from '@ant-design/icons'
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'
import { useTranslation } from 'react-i18next'

export default function ContactsList() {
    const { t } = useTranslation()
    const { data: contacts = [], isLoading } = useContacts()
    const createContact = useCreateContact()
    const updateContact = useUpdateContact()
    const deleteContact = useDeleteContact()
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [form] = Form.useForm()

    const filtered = useMemo(() => {
        if (!search) return contacts
        const s = search.toLowerCase()
        return contacts.filter((c: any) =>
            c.first_name?.toLowerCase().includes(s) || c.last_name?.toLowerCase().includes(s) ||
            c.email?.toLowerCase().includes(s) || c.phone?.includes(s) || c.company?.toLowerCase().includes(s)
        )
    }, [contacts, search])

    const openCreate = () => { setEditRecord(null); form.resetFields(); setModalOpen(true) }
    const openEdit = (record: any) => {
        setEditRecord(record)
        form.setFieldsValue(record)
        setModalOpen(true)
    }
    const openDetail = (record: any) => { setSelected(record); setDrawerOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) {
                await updateContact.mutateAsync({ id: editRecord.id, ...values })
                message.success(t('settings.profile_saved'))
            } else {
                await createContact.mutateAsync(values)
                message.success(t('settings.profile_saved'))
            }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Error') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteContact.mutateAsync(id); message.success(t('common.delete')) }
        catch { message.error('Error') }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'contacts', [
            { key: 'first_name', title: t('contacts.first_name') }, { key: 'last_name', title: t('contacts.last_name') },
            { key: 'email', title: 'Email' }, { key: 'phone', title: t('settings.phone') },
            { key: 'company', title: t('contacts.company') }, { key: 'position', title: t('contacts.position') },
        ])
        message.success(`${t('common.export')}: ${filtered.length}`)
    }

    const columns = [
        {
            title: t('contacts.title'), key: 'name',
            render: (_: any, r: any) => (
                <Space><UserOutlined style={{ color: '#6366f1' }} />
                    <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => openDetail(r)}>{r.first_name} {r.last_name}</span>
                </Space>
            ), sorter: (a: any, b: any) => (a.first_name || '').localeCompare(b.first_name || ''),
        },
        { title: t('common.type'), dataIndex: 'contact_type', key: 'contact_type', width: 100, render: (v: string) => v === 'legal' ? <Tag icon={<BankOutlined />} color="blue">{t('contacts.legal_short')}</Tag> : <Tag icon={<UserOutlined />} color="cyan">{t('contacts.individual_short')}</Tag>, filters: [{ text: t('contacts.legal_short'), value: 'legal' }, { text: t('contacts.individual_short'), value: 'individual' }], onFilter: (value: any, record: any) => record.contact_type === value },
        { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v ? <Space><MailOutlined />{v}</Space> : '—' },
        { title: t('contacts.phone'), dataIndex: 'phone', key: 'phone', render: (v: string) => v ? <Space><PhoneOutlined />{v}</Space> : '—' },
        { title: t('contacts.company'), dataIndex: 'company', key: 'company', render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '—' },
        { title: t('settings.inn'), dataIndex: 'inn', key: 'inn', width: 120, render: (v: string) => v ? <Tag icon={<IdcardOutlined />} color="purple">{v}</Tag> : '—' },
        { title: t('contacts.position'), dataIndex: 'position', key: 'position' },
        {
            title: '', key: 'actions', width: 120,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('common.details')}><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title={t('common.edit')}><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => handleDelete(r.id)} okText={t('common.delete')} cancelText={t('common.cancel')}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('contacts.title')}</h1><p>{t('contacts.subtitle')} — {filtered.length} {t('common.records')}</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('contacts.new_contact')}</Button></Space>
            </div>
            <Input placeholder={t('contacts.search')} prefix={<SearchOutlined />} style={{ marginBottom: 16, width: 400 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
            <Table columns={columns} dataSource={filtered} rowKey="id" loading={isLoading} scroll={{ x: 'max-content' }}
                pagination={{ pageSize: 10, showTotal: total => `${t('common.total')}: ${total}`, showSizeChanger: true }}
                onRow={(record) => ({ onClick: () => openDetail(record), style: { cursor: 'pointer' } })} />

            <Modal title={editRecord ? t('contacts.edit_contact') : t('contacts.new_contact')} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createContact.isPending || updateContact.isPending}
                okText={editRecord ? t('common.save') : t('common.create')} cancelText={t('common.cancel')} width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="contact_type" label={t('contacts.type')} initialValue="legal"><select style={{ width: '100%', padding: '6px 12px', borderRadius: 8, border: '1px solid #303030', background: 'transparent', color: '#e2e8f0' }}><option value="legal">{t('contacts.legal_entity')}</option><option value="individual">{t('contacts.individual')}</option></select></Form.Item></Col>
                        <Col span={12}><Form.Item name="inn" label={t('settings.inn')}><Input prefix={<IdcardOutlined />} placeholder={t('contacts.9_digits', '9 цифр')} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="first_name" label={t('contacts.first_name')} rules={[{ required: true, message: t('contacts.enter_name') }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="last_name" label={t('contacts.last_name')} rules={[{ required: true, message: t('contacts.enter_name') }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="email" label="Email" rules={[{ type: 'email', message: t('contacts.invalid_email') }]}><Input prefix={<MailOutlined />} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="phone" label={t('settings.phone')}><Input prefix={<PhoneOutlined />} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="company" label={t('contacts.company')}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="position" label={t('contacts.position')}><Input /></Form.Item></Col>
                        <Col span={24}><Form.Item name="company_name" label={t('contacts.full_org_name')}><Input placeholder={t('contacts.org_placeholder', 'ООО «Название»')} /></Form.Item></Col>
                        <Col span={24}><Form.Item name="legal_address" label={t('settings.legal_address')}><Input placeholder={t('contacts.address_placeholder', 'г. Ташкент, ...')} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="bank_name" label={t('contacts.bank')}><Input prefix={<BankOutlined />} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="bank_account" label={t('contacts.bank_account')}><Input placeholder="20208..." /></Form.Item></Col>
                        <Col span={24}><Form.Item name="address" label={t('contacts.actual_address')}><Input /></Form.Item></Col>
                        <Col span={24}><Form.Item name="notes" label={t('contacts.notes')}><Input.TextArea rows={2} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected ? `${selected.first_name} ${selected.last_name}` : ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={450}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>{t('common.edit')}</Button>
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => { handleDelete(selected?.id); setDrawerOpen(false) }}>
                        <Button danger icon={<DeleteOutlined />}>{t('common.delete')}</Button>
                    </Popconfirm>
                </Space>}>
                {selected && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label={t('common.type')}>{selected.contact_type === 'legal' ? <Tag icon={<BankOutlined />} color="blue">{t('contacts.legal_entity')}</Tag> : <Tag icon={<UserOutlined />} color="cyan">{t('contacts.individual')}</Tag>}</Descriptions.Item>
                        <Descriptions.Item label={t('contacts.first_name')}>{selected.first_name} {selected.last_name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selected.email || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('settings.phone')}>{selected.phone || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('contacts.company')}>{selected.company || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('settings.inn')}>{selected.inn ? <Tag color="purple">{selected.inn}</Tag> : '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('contacts.full_name')}>{selected.company_name || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('settings.legal_address')}>{selected.legal_address || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('contacts.bank')}>{selected.bank_name || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('contacts.bank_account')}>{selected.bank_account || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('contacts.position')}>{selected.position || '—'}</Descriptions.Item>
                        <Descriptions.Item label={t('common.date')}>{selected.created_at ? new Date(selected.created_at).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    )
}
