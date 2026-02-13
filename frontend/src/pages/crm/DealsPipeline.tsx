import { useState, useMemo } from 'react'
import { Tag, Button, Modal, Form, Input, InputNumber, Select, Row, Col, message, Drawer, Descriptions, Space, Tooltip, Spin, Popconfirm } from 'antd'
import { PlusOutlined, DollarOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useDeals, useCreateDeal, useUpdateDeal, useDeleteDeal } from '../../api/hooks'

const stageOrder = ['new', 'negotiation', 'proposal', 'contract', 'won', 'lost']

interface Deal { id: number; title: string; amount: number; stage: string; contact_name?: string; company?: string; expected_close?: string; probability?: number; description?: string }

const stages = [
    { key: 'new', label: 'Новые', color: '#8884d8' },
    { key: 'negotiation', label: 'Переговоры', color: '#ffa940' },
    { key: 'proposal', label: 'Предложение', color: '#36cfc9' },
    { key: 'contract', label: 'Контракт', color: '#597ef7' },
    { key: 'won', label: 'Выиграно', color: '#52c41a' },
    { key: 'lost', label: 'Проиграно', color: '#ff4d4f' },
]

export default function DealsPipeline() {
    const { data: deals = [], isLoading } = useDeals()
    const createDeal = useCreateDeal()
    const updateDeal = useUpdateDeal()
    const deleteDeal = useDeleteDeal()
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<Deal | null>(null)
    const [dragId, setDragId] = useState<number | null>(null)
    const [form] = Form.useForm()

    const totalPipeline = deals.filter((d: Deal) => !['won', 'lost'].includes(d.stage)).reduce((s: number, d: Deal) => s + (d.amount || 0), 0)

    const openCreate = () => { setEditRecord(null); form.resetFields(); setModalOpen(true) }
    const openEdit = (r: Deal) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) { await updateDeal.mutateAsync({ id: editRecord.id, ...values }); message.success('Сделка обновлена') }
            else { await createDeal.mutateAsync(values); message.success('Сделка создана') }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Ошибка') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteDeal.mutateAsync(id); message.success('Сделка удалена'); setDrawerOpen(false) }
        catch { message.error('Ошибка') }
    }

    const handleDragStart = (e: React.DragEvent, id: number) => { setDragId(id); e.dataTransfer.effectAllowed = 'move' }
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
    const handleDrop = async (e: React.DragEvent, targetStage: string) => {
        e.preventDefault()
        if (dragId !== null) {
            const deal = deals.find((d: Deal) => d.id === dragId)
            if (deal && deal.stage !== targetStage) {
                try {
                    await updateDeal.mutateAsync({ id: dragId, stage: targetStage })
                    message.success(`Сделка перемещена в "${stages.find(s => s.key === targetStage)?.label}"`)
                } catch { message.error('Ошибка при перемещении') }
            }
            setDragId(null)
        }
    }

    const filteredDeals = useMemo(() => {
        if (!search) return deals
        const s = search.toLowerCase()
        return deals.filter((d: any) => d.title?.toLowerCase().includes(s) || d.company?.toLowerCase().includes(s) || d.contact_name?.toLowerCase().includes(s))
    }, [deals, search])

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Воронка сделок</h1>
                    <p>Pipeline — {filteredDeals.length} сделок</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Новая сделка</Button>
            </div>
            <div style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск по названию или компании..." prefix={<SearchOutlined />} style={{ width: 360 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
            </div>

            <div className="kanban-board">
                {stages.map(stage => {
                    const stageDeals = filteredDeals.filter((d: Deal) => d.stage === stage.key)
                    const stageTotal = stageDeals.reduce((s: number, d: Deal) => s + (d.amount || 0), 0)
                    return (
                        <div className="kanban-column" key={stage.key} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.key)}>
                            <div className="kanban-column-header" style={{ borderColor: stage.color }}>
                                <h4 style={{ color: stage.color }}>{stage.label}</h4>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <Tag style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: '#94a3b8' }}>{stageDeals.length}</Tag>
                                    <Tag style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: stage.color, fontSize: 10 }}>{(stageTotal / 1e6).toFixed(1)}M</Tag>
                                </div>
                            </div>
                            {stageDeals.map((deal: Deal) => (
                                <div className="kanban-card" key={deal.id} draggable onDragStart={(e) => handleDragStart(e, deal.id)} style={{ cursor: 'grab', opacity: dragId === deal.id ? 0.5 : 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h5 style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setSelected(deal); setDrawerOpen(true) }}>{deal.title}</h5>
                                        <Space size={0}>
                                            <Tooltip title="Просмотр"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(deal); setDrawerOpen(true) }} /></Tooltip>
                                            <Tooltip title="Редактировать"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(deal)} /></Tooltip>
                                        </Space>
                                    </div>
                                    <p style={{ color: '#818cf8', fontWeight: 600, margin: '4px 0' }}><DollarOutlined /> {(deal.amount || 0).toLocaleString('ru-RU')} UZS</p>
                                    {deal.company && <Tag style={{ fontSize: 10 }}>{deal.company}</Tag>}
                                </div>
                            ))}
                            {stageDeals.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 12, border: '1px dashed #2d2d4a', borderRadius: 8, margin: '8px 0' }}>Перетащите сделку сюда</div>}
                        </div>
                    )
                })}
            </div>

            <Modal title={editRecord ? 'Редактировать сделку' : 'Новая сделка'} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createDeal.isPending || updateDeal.isPending}
                okText={editRecord ? 'Сохранить' : 'Создать'} cancelText="Отмена" width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ stage: 'new' }}>
                    <Row gutter={16}>
                        <Col span={24}><Form.Item name="title" label="Название" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="amount" label="Сумма" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="stage" label="Стадия"><Select options={stages.map(s => ({ value: s.key, label: s.label }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="company" label="Компания"><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="contact_name" label="Контакт"><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="probability" label="Вероятность %"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="expected_close" label="Дата закрытия"><Input type="date" /></Form.Item></Col>
                        <Col span={24}><Form.Item name="description" label="Описание"><Input.TextArea rows={2} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.title || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={460}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); if (selected) openEdit(selected) }}>Редактировать</Button>
                    <Popconfirm title="Удалить сделку?" onConfirm={() => selected && handleDelete(selected.id)}>
                        <Button danger icon={<DeleteOutlined />}>Удалить</Button>
                    </Popconfirm>
                </Space>}>
                {selected && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Сумма"><span style={{ fontWeight: 700, color: '#818cf8' }}>{(selected.amount || 0).toLocaleString('ru-RU')} UZS</span></Descriptions.Item>
                        <Descriptions.Item label="Стадия"><Tag color={stages.find(s => s.key === selected.stage)?.color}>{stages.find(s => s.key === selected.stage)?.label}</Tag></Descriptions.Item>
                        <Descriptions.Item label="Компания">{selected.company || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Контакт">{selected.contact_name || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Вероятность">{selected.probability ? `${selected.probability}%` : '—'}</Descriptions.Item>
                        <Descriptions.Item label="Дата закрытия">{selected.expected_close || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Описание">{selected.description || '—'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    )
}
