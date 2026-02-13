import { useState, useMemo } from 'react'
import { Tag, Button, Modal, Form, Input, Select, Row, Col, message, Drawer, Descriptions, Space, Tooltip, Spin, Popconfirm } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CommentOutlined, SearchOutlined } from '@ant-design/icons'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useProjects } from '../../api/hooks'

const statusCols = [
    { key: 'todo', label: 'К выполнению', color: '#8884d8' },
    { key: 'in_progress', label: 'В работе', color: '#ffa940' },
    { key: 'review', label: 'На проверке', color: '#36cfc9' },
    { key: 'done', label: 'Готово', color: '#52c41a' },
]

const priorityLabels: Record<string, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' }
const priorityColors: Record<string, string> = { low: 'default', medium: 'blue', high: 'orange', critical: 'red' }

export default function TaskBoard() {
    const { data: tasks = [], isLoading } = useTasks()
    const { data: projects = [] } = useProjects()
    const createTask = useCreateTask()
    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [dragId, setDragId] = useState<number | null>(null)
    const [search, setSearch] = useState('')
    const [projectFilter, setProjectFilter] = useState<number | undefined>()
    const [form] = Form.useForm()

    const openCreate = (status?: string) => { setEditRecord(null); form.resetFields(); form.setFieldsValue({ status: status || 'todo' }); setModalOpen(true) }
    const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true) }
    const openDetail = (r: any) => { setSelected(r); setDrawerOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) { await updateTask.mutateAsync({ id: editRecord.id, ...values }); message.success('Задача обновлена') }
            else { await createTask.mutateAsync(values); message.success('Задача создана') }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Ошибка') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteTask.mutateAsync(id); message.success('Задача удалена'); setDrawerOpen(false) }
        catch { message.error('Ошибка') }
    }

    const handleDragStart = (e: React.DragEvent, id: number) => { setDragId(id); e.dataTransfer.effectAllowed = 'move' }
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
    const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault()
        if (dragId !== null) {
            const task = tasks.find((t: any) => t.id === dragId)
            if (task && task.status !== targetStatus) {
                try {
                    await updateTask.mutateAsync({ id: dragId, status: targetStatus })
                    message.success(`Задача перемещена в "${statusCols.find(s => s.key === targetStatus)?.label}"`)
                } catch { message.error('Ошибка') }
            }
            setDragId(null)
        }
    }

    const getProjectName = (id: number) => projects.find((p: any) => p.id === id)?.name || '—'

    const filteredTasks = useMemo(() => {
        let result = tasks
        if (search) { const s = search.toLowerCase(); result = result.filter((t: any) => t.title?.toLowerCase().includes(s)) }
        if (projectFilter) result = result.filter((t: any) => t.project_id === projectFilter)
        return result
    }, [tasks, search, projectFilter])

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>Доска задач</h1><p>Kanban — {filteredTasks.length} задач в {statusCols.length} колонках</p></div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>Новая задача</Button>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder="Поиск задач..." prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder="Проект" style={{ width: 220 }} allowClear value={projectFilter} onChange={setProjectFilter} options={projects.map((p: any) => ({ value: p.id, label: p.name }))} />
            </Space>

            <div className="kanban-board">
                {statusCols.map(col => {
                    const colTasks = filteredTasks.filter((t: any) => t.status === col.key)
                    return (
                        <div className="kanban-column" key={col.key} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.key)}>
                            <div className="kanban-column-header" style={{ borderColor: col.color }}>
                                <h4 style={{ color: col.color }}>{col.label}</h4>
                                <Space size={4}>
                                    <Tag style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: '#94a3b8' }}>{colTasks.length}</Tag>
                                    <Tooltip title={`Добавить в "${col.label}"`}>
                                        <Button type="text" size="small" icon={<PlusOutlined />} onClick={() => openCreate(col.key)} style={{ color: col.color }} />
                                    </Tooltip>
                                </Space>
                            </div>
                            {colTasks.map((task: any) => (
                                <div className="kanban-card" key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} style={{ cursor: 'grab', opacity: dragId === task.id ? 0.5 : 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h5 style={{ flex: 1, cursor: 'pointer', margin: 0 }} onClick={() => openDetail(task)}>{task.title}</h5>
                                        <Space size={0}>
                                            <Tooltip title="Просмотр"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openDetail(task)} /></Tooltip>
                                            <Tooltip title="Редактировать"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(task)} /></Tooltip>
                                        </Space>
                                    </div>
                                    <Space style={{ marginTop: 6 }} wrap size={4}>
                                        {task.priority && <Tag color={priorityColors[task.priority]} style={{ fontSize: 10 }}>{priorityLabels[task.priority]}</Tag>}
                                        {task.project_id && <Tag style={{ fontSize: 10 }}>{getProjectName(task.project_id)}</Tag>}
                                    </Space>
                                    {task.due_date && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>📅 {new Date(task.due_date).toLocaleDateString('ru-RU')}</div>}
                                </div>
                            ))}
                            {colTasks.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 12, border: '1px dashed #2d2d4a', borderRadius: 8, margin: '8px 0' }}>Перетащите задачу сюда</div>}
                        </div>
                    )
                })}
            </div>

            <Modal title={editRecord ? 'Редактировать задачу' : 'Новая задача'} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createTask.isPending || updateTask.isPending}
                okText={editRecord ? 'Сохранить' : 'Создать'} cancelText="Отмена" width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'todo', priority: 'medium' }}>
                    <Row gutter={16}>
                        <Col span={24}><Form.Item name="title" label="Название" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="project_id" label="Проект"><Select allowClear options={projects.map((p: any) => ({ value: p.id, label: p.name }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="status" label="Статус"><Select options={statusCols.map(s => ({ value: s.key, label: s.label }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="priority" label="Приоритет"><Select options={Object.entries(priorityLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="due_date" label="Дедлайн"><Input type="date" /></Form.Item></Col>
                        <Col span={24}><Form.Item name="description" label="Описание"><Input.TextArea rows={3} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.title || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={460}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>Редактировать</Button>
                    <Popconfirm title="Удалить задачу?" onConfirm={() => selected && handleDelete(selected.id)}>
                        <Button danger icon={<DeleteOutlined />}>Удалить</Button>
                    </Popconfirm>
                </Space>}>
                {selected && (
                    <div>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Проект">{getProjectName(selected.project_id)}</Descriptions.Item>
                            <Descriptions.Item label="Статус"><Tag color={statusCols.find(s => s.key === selected.status)?.color}>{statusCols.find(s => s.key === selected.status)?.label}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Приоритет"><Tag color={priorityColors[selected.priority]}>{priorityLabels[selected.priority]}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Дедлайн">{selected.due_date ? new Date(selected.due_date).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                            <Descriptions.Item label="Описание">{selected.description || '—'}</Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 16 }}>
                            <h4><CommentOutlined /> Быстрое изменение статуса</h4>
                            <Space wrap>
                                {statusCols.map(s => (
                                    <Button key={s.key} size="small" type={selected.status === s.key ? 'primary' : 'default'}
                                        style={{ borderColor: s.color, color: selected.status === s.key ? '#fff' : s.color, background: selected.status === s.key ? s.color : 'transparent' }}
                                        onClick={async () => {
                                            if (selected.status !== s.key) {
                                                await updateTask.mutateAsync({ id: selected.id, status: s.key })
                                                setSelected({ ...selected, status: s.key })
                                                message.success(`Статус → ${s.label}`)
                                            }
                                        }}>{s.label}</Button>
                                ))}
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    )
}
