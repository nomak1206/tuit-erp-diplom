import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Popconfirm, Tooltip, Spin, Statistic, Card } from 'antd'
import { PlusOutlined, SearchOutlined, ExportOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons'
import { useChartOfAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'

const typeLabels: Record<string, string> = { asset: 'Актив', liability: 'Пассив', equity: 'Капитал', revenue: 'Доход', expense: 'Расход', contra_asset: 'Контр-актив' }
const typeColors: Record<string, string> = { asset: 'blue', liability: 'red', equity: 'purple', revenue: 'green', expense: 'orange', contra_asset: 'cyan' }

export default function ChartOfAccounts() {
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
            if (editRecord) { await updateAccount.mutateAsync({ id: editRecord.id, ...values }); message.success('Счёт обновлён') }
            else { await createAccount.mutateAsync(values); message.success('Счёт создан') }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Ошибка') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteAccount.mutateAsync(id); message.success('Счёт удалён') }
        catch { message.error('Ошибка') }
    }

    const handleExport = () => {
        exportToCSV(filtered, 'chart_of_accounts', [
            { key: 'code', title: 'Код' }, { key: 'name', title: 'Название' },
            { key: 'group_code', title: 'Группа' }, { key: 'account_type', title: 'Тип' }, { key: 'balance', title: 'Баланс' },
        ])
        message.success(`Экспортировано ${filtered.length} записей`)
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
        { title: 'Тип', dataIndex: 'account_type', key: 'account_type', width: 120, render: (v: string) => <Tag color={typeColors[v]}>{typeLabels[v] || v}</Tag> },
        { title: 'Баланс', dataIndex: 'balance', key: 'balance', width: 160, render: (v: number) => <span style={{ fontWeight: 600, color: (v || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}>{(v || 0).toLocaleString('ru-RU')} UZS</span>, sorter: (a: any, b: any) => (a.balance || 0) - (b.balance || 0) },
        { title: 'Статус', dataIndex: 'is_active', key: 'is_active', width: 90, render: (v: boolean) => <Tag color={v !== false ? 'green' : 'default'}>{v !== false ? 'Активный' : 'Закрыт'}</Tag> },
        {
            title: '', key: 'actions', width: 100,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Редактировать"><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    <Popconfirm title="Удалить счёт?" onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>План счетов (НСБУ №21)</h1><p>Бухгалтерские счета — {filtered.length} из {accounts.length}</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>Экспорт</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Новый счёт</Button></Space>
            </div>

            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                <Col xs={12} md={6}><Card size="small"><Statistic title="Активы (нетто)" value={totalAssets - totalContraAsset} suffix="UZS" valueStyle={{ fontSize: 14, color: '#22c55e' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
                <Col xs={12} md={6}><Card size="small"><Statistic title="Обязательства" value={totalLiabilities} suffix="UZS" valueStyle={{ fontSize: 14, color: '#ef4444' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
                <Col xs={12} md={6}><Card size="small"><Statistic title="Капитал" value={totalEquity} suffix="UZS" valueStyle={{ fontSize: 14, color: '#8b5cf6' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
                <Col xs={12} md={6}><Card size="small"><Statistic title="Групп / Счетов" value={`${groups.length} / ${accounts.length}`} valueStyle={{ fontSize: 14 }} /></Card></Col>
            </Row>

            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder="Поиск по коду или названию..." prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder="Тип счёта" style={{ width: 160 }} allowClear value={typeFilter} onChange={setTypeFilter} options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
                <Select placeholder="Группа" style={{ width: 220 }} allowClear value={groupFilter} onChange={setGroupFilter} options={groups} showSearch optionFilterProp="label" />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 20, showTotal: t => `Всего: ${t}` }} size="small" />

            <Modal title={editRecord ? 'Редактировать счёт' : 'Новый счёт'} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createAccount.isPending || updateAccount.isPending}
                okText={editRecord ? 'Сохранить' : 'Создать'} cancelText="Отмена" width={520}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="code" label="Код счёта" rules={[{ required: true }]}><Input placeholder="1010" /></Form.Item></Col>
                        <Col span={16}><Form.Item name="name" label="Название" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="account_type" label="Тип" rules={[{ required: true }]}><Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="parent_id" label="Родительский счёт"><Select allowClear placeholder="— нет —" options={accounts.map((a: any) => ({ value: a.id, label: `${a.code} — ${a.name}` }))} showSearch optionFilterProp="label" /></Form.Item></Col>
                        <Col span={24}><Form.Item name="description" label="Описание"><Input /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    )
}
