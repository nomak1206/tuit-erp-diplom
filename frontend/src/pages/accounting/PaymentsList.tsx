import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Card, Row, Col, Statistic, Spin, Modal, Form, InputNumber, Select, DatePicker, message } from 'antd'
import { DollarOutlined, PlusOutlined, SearchOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { usePayments, useCreatePayment, useInvoices } from '../../api/hooks'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

const fmt = (v: number) => v?.toLocaleString('ru-RU') + ' UZS'

export default function PaymentsList() {
    const { t } = useTranslation()
    const { data: payments = [], isLoading } = usePayments()
    const { data: invoices = [] } = useInvoices()
    const createPayment = useCreatePayment()
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [form] = Form.useForm()

    const filtered = useMemo(() => {
        if (!search) return payments
        const s = search.toLowerCase()
        return payments.filter((p: any) => p.reference?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s))
    }, [payments, search])

    const totalPaid = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0)
    const count = payments.length

    const handleSubmit = async (values: any) => {
        try {
            await createPayment.mutateAsync({
                ...values,
                date: values.date?.format('YYYY-MM-DD'),
            })
            message.success(t('common.created_ok'))
            setModalOpen(false)
            form.resetFields()
        } catch { message.error(t('common.error')) }
    }

    const columns = [
        { title: t('common.date'), dataIndex: 'date', key: 'date', width: 110, render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '—' },
        { title: t('accounting.invoice'), dataIndex: 'invoice_id', key: 'inv', render: (v: number) => { const inv = invoices.find((i: any) => i.id === v); return inv ? `Счёт #${inv.number || v}` : `#${v}` } },
        { title: t('common.amount'), dataIndex: 'amount', key: 'amount', render: (v: number) => <strong style={{ color: '#22c55e' }}>{fmt(v)}</strong>, sorter: (a: any, b: any) => (a.amount || 0) - (b.amount || 0) },
        { title: t('accounting.payment_method'), dataIndex: 'method', key: 'method', render: (v: string) => <Tag>{v || 'bank_transfer'}</Tag> },
        { title: t('warehouse.reference'), dataIndex: 'reference', key: 'ref', render: (v: string) => v || '—' },
        { title: t('common.notes'), dataIndex: 'description', key: 'desc', ellipsis: true },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1><DollarOutlined /> {t('accounting.payments')}</h1><p>{t('accounting.payments')} — {count} {t('common.records')}</p></div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>{t('common.create')}</Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} md={6}><Card><Statistic title={t('accounting.payments')} value={count} prefix={<CheckCircleOutlined />} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title={t('common.amount')} value={totalPaid} suffix="UZS" valueStyle={{ color: '#22c55e' }} formatter={v => Number(v).toLocaleString('ru-RU')} /></Card></Col>
            </Row>

            <Space style={{ marginBottom: 16 }}>
                <Input placeholder={t('common.search')} prefix={<SearchOutlined />} style={{ width: 300 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 15, showTotal: total => `${t('common.total')}: ${total}` }} />

            <Modal title={t('accounting.payments')} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} confirmLoading={createPayment.isPending}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="invoice_id" label={t('accounting.invoice')} rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="label" options={invoices.map((i: any) => ({ value: i.id, label: `#${i.number || i.id} — ${i.client_name || ''} (${fmt(i.total || i.amount || 0)})` }))} />
                    </Form.Item>
                    <Form.Item name="amount" label={t('common.amount')} rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="method" label={t('accounting.payment_method')} initialValue="bank_transfer">
                        <Select options={[
                            { value: 'bank_transfer', label: t('accounting.payment_methods.bank_transfer', 'Банковский перевод') },
                            { value: 'cash', label: t('accounting.payment_methods.cash', 'Наличные') },
                            { value: 'card', label: t('accounting.payment_methods.card', 'Карта') },
                        ]} />
                    </Form.Item>
                    <Form.Item name="date" label={t('common.date')} initialValue={dayjs()}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="reference" label={t('warehouse.reference')}>
                        <Input placeholder="PAY-001" />
                    </Form.Item>
                    <Form.Item name="description" label={t('common.notes')}>
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
