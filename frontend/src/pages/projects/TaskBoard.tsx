import { useState, useMemo } from 'react'
import { Tag, Button, Modal, Form, Input, Select, Row, Col, message, Drawer, Descriptions, Space, Tooltip, Spin, Popconfirm } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CommentOutlined, SearchOutlined } from '@ant-design/icons'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useProjects } from '../../api/hooks'
import { useTranslation } from 'react-i18next'

const statusCols = [
    { key: 'todo', tKey: 'projects.statuses.todo', defaultLabel: 'К выполнению', color: '#8884d8' },
    { key: 'in_progress', tKey: 'projects.statuses.in_progress', defaultLabel: 'В работе', color: '#ffa940' },
    { key: 'review', tKey: 'projects.statuses.review', defaultLabel: 'На проверке', color: '#36cfc9' },
    { key: 'done', tKey: 'projects.statuses.done', defaultLabel: 'Готово', color: '#52c41a' },
]

const priorityLabels: Record<string, string> = { low: 'projects.priorities.low', medium: 'projects.priorities.medium', high: 'projects.priorities.high', critical: 'projects.priorities.critical' }
const priorityColors: Record<string, string> = { low: 'default', medium: 'blue', high: 'orange', critical: 'red' }

export default function TaskBoard() {
    const { t } = useTranslation()
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
            if (editRecord) { await updateTask.mutateAsync({ id: editRecord.id, ...values }); message.success(t('common.saved')) }
            else { await createTask.mutateAsync(values); message.success(t('common.created_ok')) }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error(t('common.error')) }
    }

    const handleDelete = async (id: number) => {
        try { await deleteTask.mutateAsync(id); message.success(t('common.deleted_ok')); setDrawerOpen(false) }
        catch { message.error(t('common.error')) }
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
                    message.success(`${t('projects.task_moved')} "${t(statusCols.find(s => s.key === targetStatus)!.tKey)}"`)
                } catch { message.error(t('common.error')) }
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
                <div><h1>{t('projects.board_title')}</h1><p>Kanban — {filteredTasks.length} {t('projects.tasks_in')} {statusCols.length} {t('projects.columns')}</p></div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>{t('projects.new_task')}</Button>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder={t('common.search')} prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder={t('projects.title')} style={{ width: 220 }} allowClear value={projectFilter} onChange={setProjectFilter} options={projects.map((p: any) => ({ value: p.id, label: p.name }))} />
            </Space>

            <div className="kanban-board">
                {statusCols.map(col => {
                    const colTasks = filteredTasks.filter((t: any) => t.status === col.key)
                    return (
                        <div className="kanban-column" key={col.key} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.key)}>
                            <div className="kanban-column-header" style={{ borderColor: col.color }}>
                                <h4 style={{ color: col.color }}>{t(col.tKey, col.defaultLabel)}</h4>
                                <Space size={4}>
                                    <Tag style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: '#94a3b8' }}>{colTasks.length}</Tag>
                                    <Tooltip title={`${t('common.add')} "${t(col.tKey)}"`}>
                                        <Button type="text" size="small" icon={<PlusOutlined />} onClick={() => openCreate(col.key)} style={{ color: col.color }} />
                                    </Tooltip>
                                </Space>
                            </div>
                            {colTasks.map((task: any) => (
                                <div className="kanban-card" key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} style={{ cursor: 'grab', opacity: dragId === task.id ? 0.5 : 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h5 style={{ flex: 1, cursor: 'pointer', margin: 0 }} onClick={() => openDetail(task)}>{task.title}</h5>
                                        <Space size={0}>
                                            <Tooltip title={t('common.details')}><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openDetail(task)} /></Tooltip>
                                            <Tooltip title={t('common.edit')}><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(task)} /></Tooltip>
                                        </Space>
                                    </div>
                                    <Space style={{ marginTop: 6 }} wrap size={4}>
                                        {task.priority && <Tag color={priorityColors[task.priority]} style={{ fontSize: 10 }}>{t(priorityLabels[task.priority] || '')}</Tag>}
                                        {task.project_id && <Tag style={{ fontSize: 10 }}>{getProjectName(task.project_id)}</Tag>}
                                    </Space>
                                    {task.due_date && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>📅 {new Date(task.due_date).toLocaleDateString('ru-RU')}</div>}
                                </div>
                            ))}
                            {colTasks.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 12, border: '1px dashed #2d2d4a', borderRadius: 8, margin: '8px 0' }}>{t('projects.drag_here')}</div>}
                        </div>
                    )
                })}
            </div>

            <Modal title={editRecord ? t('projects.edit_task') : t('projects.new_task')} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createTask.isPending || updateTask.isPending}
                okText={editRecord ? t('common.save') : t('common.create')} cancelText={t('common.cancel')} width={560}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'todo', priority: 'medium' }}>
                    <Row gutter={16}>
                        <Col span={24}><Form.Item name="title" label={t('common.name')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="project_id" label={t('projects.title')}><Select allowClear options={projects.map((p: any) => ({ value: p.id, label: p.name }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="status" label={t('common.status')}><Select options={statusCols.map(s => ({ value: s.key, label: t(s.tKey) }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="priority" label={t('projects.priority')}><Select options={Object.entries(priorityLabels).map(([v, l]) => ({ value: v, label: t(l) }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="due_date" label={t('projects.deadline')}><Input type="date" /></Form.Item></Col>
                        <Col span={24}><Form.Item name="description" label={t('common.description')}><Input.TextArea rows={3} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected?.title || ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={460}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>{t('common.edit')}</Button>
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => selected && handleDelete(selected.id)}>
                        <Button danger icon={<DeleteOutlined />}>{t('common.delete')}</Button>
                    </Popconfirm>
                </Space>}>
                {selected && (
                    <div>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label={t('projects.title')}>{getProjectName(selected.project_id)}</Descriptions.Item>
                            <Descriptions.Item label={t('common.status')}><Tag color={statusCols.find(s => s.key === selected.status)?.color}>{selected.status ? t(statusCols.find(s => s.key === selected.status)!.tKey) : '—'}</Tag></Descriptions.Item>
                            <Descriptions.Item label={t('projects.priority')}><Tag color={priorityColors[selected.priority]}>{t(priorityLabels[selected.priority] || '')}</Tag></Descriptions.Item>
                            <Descriptions.Item label={t('projects.deadline')}>{selected.due_date ? new Date(selected.due_date).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('common.description')}>{selected.description || '—'}</Descriptions.Item>
                        </Descriptions>
                        <div style={{ marginTop: 16 }}>
                            <h4><CommentOutlined /> {t('projects.quick_status')}</h4>
                            <Space wrap>
                                {statusCols.map(s => (
                                    <Button key={s.key} size="small" type={selected.status === s.key ? 'primary' : 'default'}
                                        style={{ borderColor: s.color, color: selected.status === s.key ? '#fff' : s.color, background: selected.status === s.key ? s.color : 'transparent' }}
                                        onClick={async () => {
                                            if (selected.status !== s.key) {
                                                await updateTask.mutateAsync({ id: selected.id, status: s.key })
                                                setSelected({ ...selected, status: s.key })
                                                message.success(`${t('common.status')} → ${t(s.tKey)}`)
                                            }
                                        }}>{t(s.tKey)}</Button>
                                ))}
                            </Space>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    )
}
