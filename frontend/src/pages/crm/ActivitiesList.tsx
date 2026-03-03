import { useState } from 'react'
import { Table, Tag, Button, Space, Input, Modal, Form, Select, DatePicker, message, Spin } from 'antd'
import { PlusOutlined, SearchOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, CommentOutlined } from '@ant-design/icons'
import { useActivities, useCreateActivity, useContacts, useDeals } from '../../api/hooks'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

const typeIcons: Record<string, React.ReactNode> = { call: <PhoneOutlined />, email: <MailOutlined />, meeting: <CalendarOutlined />, note: <CommentOutlined /> }
const typeColors: Record<string, string> = { call: 'blue', email: 'green', meeting: 'purple', note: 'default' }

export default function ActivitiesList() {
    const { t } = useTranslation()
    const { data: activities = [], isLoading } = useActivities()
    const { data: contacts = [] } = useContacts()
    const { data: deals = [] } = useDeals()
    const createActivity = useCreateActivity()
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [form] = Form.useForm()

    const filtered = activities.filter((a: any) => {
        if (!search) return true
        const s = search.toLowerCase()
        return a.subject?.toLowerCase().includes(s) || a.type?.toLowerCase().includes(s)
    })

    const handleSubmit = async (values: any) => {
        try {
            await createActivity.mutateAsync({
                ...values,
                due_date: values.due_date?.format('YYYY-MM-DD'),
            })
            message.success(t('common.created_ok'))
            setModalOpen(false)
            form.resetFields()
        } catch { message.error(t('common.error')) }
    }

    const getContactName = (id: number) => contacts.find((c: any) => c.id === id)?.name || `#${id}`
    const getDealName = (id: number) => deals.find((d: any) => d.id === id)?.name || `#${id}`

    const columns = [
        { title: t('common.date'), dataIndex: 'created_at', key: 'date', width: 110, render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '—' },
        { title: t('common.type'), dataIndex: 'type', key: 'type', width: 100, render: (v: string) => <Tag icon={typeIcons[v]} color={typeColors[v]}>{v || '—'}</Tag> },
        { title: t('crm.subject'), dataIndex: 'subject', key: 'subject', render: (v: string) => <strong>{v}</strong> },
        { title: t('crm.contact'), dataIndex: 'contact_id', key: 'contact', render: (v: number) => v ? getContactName(v) : '—' },
        { title: t('crm.deal'), dataIndex: 'deal_id', key: 'deal', render: (v: number) => v ? getDealName(v) : '—' },
        { title: t('common.status'), dataIndex: 'is_done', key: 'done', render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? t('common.done') : t('common.pending')}</Tag> },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1><CalendarOutlined /> {t('crm.activities')}</h1><p>{t('crm.activities')} — {filtered.length} {t('common.records')}</p></div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>{t('common.create')}</Button>
            </div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder={t('common.search')} prefix={<SearchOutlined />} style={{ width: 300 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 15, showTotal: total => `${t('common.total')}: ${total}` }} />

            <Modal title={t('crm.activities')} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} confirmLoading={createActivity.isPending}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="type" label={t('common.type')} rules={[{ required: true }]}>
                        <Select options={['call', 'email', 'meeting', 'note'].map(v => ({ value: v, label: v }))} />
                    </Form.Item>
                    <Form.Item name="subject" label={t('crm.subject')} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="contact_id" label={t('crm.contact')}>
                        <Select allowClear showSearch optionFilterProp="label" options={contacts.map((c: any) => ({ value: c.id, label: c.name }))} />
                    </Form.Item>
                    <Form.Item name="deal_id" label={t('crm.deal')}>
                        <Select allowClear showSearch optionFilterProp="label" options={deals.map((d: any) => ({ value: d.id, label: d.name }))} />
                    </Form.Item>
                    <Form.Item name="due_date" label={t('common.date')}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="notes" label={t('common.notes')}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
