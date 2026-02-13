import { useState, useMemo } from 'react'
import { Table, Button, Space, Input, Tag, Modal, Form, message, Drawer, Descriptions, Popconfirm, Tooltip, Row, Col } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExportOutlined } from '@ant-design/icons'
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'

export default function ContactsList() {
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
                message.success('Контакт обновлён')
            } else {
                await createContact.mutateAsync(values)
                message.success('Контакт создан')
            }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Ошибка при сохранении') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteContact.mutateAsync(id); message.success('Контакт удалён') }
        catch { message.error('Ошибка при удалении') }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'contacts', [
            { key: 'first_name', title: 'Имя' }, { key: 'last_name', title: 'Фамилия' },
            { key: 'email', title: 'Email' }, { key: 'phone', title: 'Телефон' },
            { key: 'company', title: 'Компания' }, { key: 'position', title: 'Должность' },
        ])
        message.success(`Экспортировано ${filtered.length} записей`)
    }

    const columns = [
        {
            title: 'Контакт', key: 'name',
            render: (_: any, r: any) => (
                <Space><UserOutlined style={{ color: '#6366f1' }} />
                    <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => openDetail(r)}>{r.first_name} {r.last_name}</span>
                </Space>
            ), sorter: (a: any, b: any) => (a.first_name || '').localeCompare(b.first_name || ''),
        },
        { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v ? <Space><MailOutlined />{v}</Space> : '—' },
        { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: (v: string) => v ? <Space><PhoneOutlined />{v}</Space> : '—' },
        { title: 'Компания', dataIndex: 'company', key: 'company', render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '—' },
        { title: 'Должность', dataIndex: 'position', key: 'position' },
        {
            title: '', key: 'actions', width: 120,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Просмотр"><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title="Редактировать"><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    <Popconfirm title="Удалить контакт?" description="Это действие нельзя отменить" onConfirm={() => handleDelete(r.id)} okText="Удалить" cancelText="Отмена">
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>Контакты</h1><p>База контактов — {filtered.length} записей</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>Экспорт</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Новый контакт</Button></Space>
            </div>
            <Input placeholder="Поиск по имени, email, телефону, компании..." prefix={<SearchOutlined />} style={{ marginBottom: 16, width: 400 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
            <Table columns={columns} dataSource={filtered} rowKey="id" loading={isLoading}
                pagination={{ pageSize: 10, showTotal: t => `Всего: ${t}`, showSizeChanger: true }}
                onRow={(record) => ({ onClick: () => openDetail(record), style: { cursor: 'pointer' } })} />

            <Modal title={editRecord ? 'Редактировать контакт' : 'Новый контакт'} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createContact.isPending || updateContact.isPending}
                okText={editRecord ? 'Сохранить' : 'Создать'} cancelText="Отмена" width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="first_name" label="Имя" rules={[{ required: true, message: 'Введите имя' }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="last_name" label="Фамилия" rules={[{ required: true, message: 'Введите фамилию' }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Некорректный email' }]}><Input prefix={<MailOutlined />} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="phone" label="Телефон"><Input prefix={<PhoneOutlined />} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="company" label="Компания"><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="position" label="Должность"><Input /></Form.Item></Col>
                        <Col span={24}><Form.Item name="address" label="Адрес"><Input /></Form.Item></Col>
                        <Col span={24}><Form.Item name="notes" label="Заметки"><Input.TextArea rows={2} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected ? `${selected.first_name} ${selected.last_name}` : ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={450}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>Редактировать</Button>
                    <Popconfirm title="Удалить?" onConfirm={() => { handleDelete(selected?.id); setDrawerOpen(false) }}>
                        <Button danger icon={<DeleteOutlined />}>Удалить</Button>
                    </Popconfirm>
                </Space>}>
                {selected && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Имя">{selected.first_name} {selected.last_name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selected.email || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Телефон">{selected.phone || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Компания">{selected.company || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Должность">{selected.position || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Создан">{selected.created_at ? new Date(selected.created_at).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    )
}
