import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Popconfirm, Tooltip, Spin, Statistic, Card } from 'antd'
import { PlusOutlined, SearchOutlined, ExportOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons'
import { useChartOfAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'
import { useTranslation } from 'react-i18next'

const typeLabels: Record<string, string> = { asset: 'Актив', liability: 'Пассив', equity: 'Капитал', revenue: 'Доход', expense: 'Расход', contra_asset: 'Контр-актив' }
const typeColors: Record<string, string> = { asset: 'blue', liability: 'red', equity: 'purple', revenue: 'green', expense: 'orange', contra_asset: 'cyan' }

export default function ChartOfAccounts() {
    const { t } = useTranslation()
    const { data: accounts = [], isLoading } = useChartOfAccounts()
    const createAccount = useCreateAccount()
    const updateAccount = useUpdateAccount()
    const deleteAccount = useDeleteAccount()
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string | undefined>()
    const [groupFilter, setGroupFilter] = useState<string | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [form] = Form.useForm()

    const groups = useMemo(() => {
        const seen = new Map<string, string>()
        accounts.forEach((a: any) => { if (a.group_code && !seen.has(a.group_code)) seen.set(a.group_code, a.group_name || a.group_code) })
        return Array.from(seen.entries()).map(([code, name]) => ({ value: code, label: `${code} — ${name}` }))
    }, [accounts])

    const filtered = useMemo(() => {
        let result = accounts
        if (search) { const s = search.toLowerCase(); result = result.filter((a: any) => a.name?.toLowerCase().includes(s) || a.code?.toLowerCase().includes(s)) }
        if (typeFilter) result = result.filter((a: any) => a.account_type === typeFilter)
        if (groupFilter) result = result.filter((a: any) => a.group_code === groupFilter)
        return result
    }, [accounts, search, typeFilter, groupFilter])

    const openCreate = () => { setEditRecord(null); form.resetFields(); setModalOpen(true) }
    const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) { await updateAccount.mutateAsync({ id: editRecord.id, ...values }); message.success(t('common.saved')) }
            else { await createAccount.mutateAsync(values); message.success(t('common.created_ok')) }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error(t('common.error')) }
    }

    const handleDelete = async (id: number) => {
        try { await deleteAccount.mutateAsync(id); message.success(t('common.deleted_ok')) }
        catch { message.error(t('common.error')) }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'chart_of_accounts', [
            { key: 'code', title: 'Код' }, { key: 'name', title: 'Название' },
            { key: 'group_code', title: 'Группа' }, { key: 'account_type', title: t('common.type') }, { key: 'balance', title: 'Баланс' },
        ])
        message.success(`${t('common.export')}: ${filtered.length}`)
    }

    /* Balance summaries */
    const totalAssets = accounts.filter((a: any) => a.account_type === 'asset').reduce((s: number, a: any) => s + (a.balance || 0), 0)
    const totalContraAsset = accounts.filter((a: any) => a.account_type === 'contra_asset').reduce((s: number, a: any) => s + (a.balance || 0), 0)
    const totalLiabilities = accounts.filter((a: any) => a.account_type === 'liability').reduce((s: number, a: any) => s + (a.balance || 0), 0)
    const totalEquity = accounts.filter((a: any) => a.account_type === 'equity').reduce((s: number, a: any) => s + (a.balance || 0), 0)

    const columns: any[] = [
        { title: 'Группа', dataIndex: 'group_code', key: 'group', width: 80, render: (v: string, r: any) => v ? <Tooltip title={r.group_name}><Tag>{v}</Tag></Tooltip> : '—' },
        { title: 'Код', dataIndex: 'code', key: 'code', width: 90, render: (v: string) => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{v}</span> },
        { title: 'Название', dataIndex: 'name', key: 'name', render: (v: string, r: any) => <span style={{ fontWeight: r.parent_id ? 400 : 700, paddingLeft: r.parent_id ? 12 : 0 }}>{v}</span> },
        { title: t('common.type'), dataIndex: 'account_type', key: 'account_type', width: 120, render: (v: string) => <Tag color={typeColors[v]}>{typeLabels[v] || v}</Tag> },
        { title: 'Баланс', dataIndex: 'balance', key: 'balance', width: 160, render: (v: number) => <span style={{ fontWeight: 600, color: (v || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}>{(v || 0).toLocaleString('ru-RU')} UZS</span>, sorter: (a: any, b: any) => (a.balance || 0) - (b.balance || 0) },
        { title: t('common.status'), dataIndex: 'is_active', key: 'is_active', width: 90, render: (v: boolean) => <Tag color={v !== false ? 'green' : 'default'}>{v !== false ? 'Активный' : 'Закрыт'}</Tag> },
        {
            title: '', key: 'actions', width: 100,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('common.edit')}><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('accounting.chart_title')}</h1><p>{t('accounting.chart_title')} — {filtered.length} / {accounts.length}</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('common.create')}</Button></Space>
            </div>

            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                <Col xs={12} md={6}><Card size="small"><Statistic title={t('accounting.net_assets')} value={totalAssets - totalContraAsset} suffix="UZS" valueStyle={{ fontSize: 14, color: '#22c55e' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
                <Col xs={12} md={6}><Card size="small"><Statistic title={t('accounting.liabilities')} value={totalLiabilities} suffix="UZS" valueStyle={{ fontSize: 14, color: '#ef4444' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
                <Col xs={12} md={6}><Card size="small"><Statistic title={t('accounting.accounts_by_type.equity')} value={totalEquity} suffix="UZS" valueStyle={{ fontSize: 14, color: '#8b5cf6' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
                <Col xs={12} md={6}><Card size="small"><Statistic title={t('accounting.groups_accounts')} value={`${groups.length} / ${accounts.length}`} valueStyle={{ fontSize: 14 }} /></Card></Col>
            </Row>

            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder={t('accounting.search_code')} prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder={t('accounting.account_type')} style={{ width: 160 }} allowClear value={typeFilter} onChange={setTypeFilter} options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
                <Select placeholder={t('accounting.group')} style={{ width: 220 }} allowClear value={groupFilter} onChange={setGroupFilter} options={groups} showSearch optionFilterProp="label" />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 20, showTotal: total => `${t('common.total')}: ${total}` }} size="small" />

            <Modal title={editRecord ? 'Редактировать счёт' : 'Новый счёт'} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createAccount.isPending || updateAccount.isPending}
                okText={editRecord ? 'Сохранить' : 'Создать'} cancelText={t('common.cancel')} width={520}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="code" label={t('accounting.account_code')} rules={[{ required: true }]}><Input placeholder="1010" /></Form.Item></Col>
                        <Col span={16}><Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="account_type" label={t('common.type')} rules={[{ required: true }]}><Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="parent_id" label={t('accounting.parent_account')}><Select allowClear placeholder="—" options={accounts.map((a: any) => ({ value: a.id, label: `${a.code} — ${a.name}` }))} showSearch optionFilterProp="label" /></Form.Item></Col>
                        <Col span={24}><Form.Item name="description" label={t('common.description')}><Input /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    )
}
