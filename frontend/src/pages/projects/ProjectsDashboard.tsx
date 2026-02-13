import { Row, Col, Spin, Card, Statistic, Space, Button, List, Tag, Progress, Modal, Form, Input, Select, message, InputNumber } from 'antd'
import { ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useProjects, useTasks, useCreateProject } from '../../api/hooks'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']
const statusLabels: Record<string, string> = { active: 'Активный', completed: 'Завершён', on_hold: 'Приостановлен', planning: 'Планирование' }
const statusColors: Record<string, string> = { active: 'green', completed: 'blue', on_hold: 'orange', planning: 'default' }

export default function ProjectsDashboard() {
    const navigate = useNavigate()
    const { data: projects = [], isLoading: pl } = useProjects()
    const { data: tasks = [], isLoading: tl } = useTasks()
    const createProject = useCreateProject()
    const [modalOpen, setModalOpen] = useState(false)
    const [form] = Form.useForm()

    if (pl || tl) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const doneTasks = tasks.filter((t: any) => t.status === 'done').length
    const progressPct = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0

    const tasksByStatus = Object.entries(tasks.reduce((acc: any, t: any) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc }, {})).map(([name, value]) => ({ name, value }))

    const handleCreateProject = async (values: any) => {
        try { await createProject.mutateAsync(values); message.success('Проект создан'); setModalOpen(false); form.resetFields() }
        catch { message.error('Ошибка') }
    }

    const kpis = [
        { title: 'Проектов', value: projects.length, icon: <ProjectOutlined />, color: '#6366f1' },
        { title: 'Задач', value: tasks.length, icon: <CheckCircleOutlined />, color: '#8b5cf6' },
        { title: 'Выполнено', value: doneTasks, icon: <ClockCircleOutlined />, color: '#22c55e' },
        { title: 'Прогресс', value: `${progressPct}%`, icon: <TeamOutlined />, color: '#ec4899' },
    ]

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>Проекты — Обзор</h1><p>Управление проектами и задачами</p></div>
                <Space>
                    <Button onClick={() => navigate('/projects/board')}>Доска задач</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>Новый проект</Button>
                </Space>
            </div>
            <Row gutter={[16, 16]}>
                {kpis.map(k => (
                    <Col xs={12} lg={6} key={k.title}>
                        <Card hoverable onClick={() => navigate('/projects/board')} style={{ cursor: 'pointer', borderLeft: `3px solid ${k.color}` }}>
                            <Statistic title={k.title} value={k.value} prefix={<span style={{ color: k.color }}>{k.icon}</span>} />
                        </Card>
                    </Col>
                ))}
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Задачи по статусам" extra={<Button type="link" onClick={() => navigate('/projects/board')}>Доска →</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart><Pie data={tasksByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                                {tasksByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Список проектов">
                        <List dataSource={projects} renderItem={(p: any) => {
                            const pTasks = tasks.filter((t: any) => t.project_id === p.id)
                            const pDone = pTasks.filter((t: any) => t.status === 'done').length
                            const pPct = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0
                            return (
                                <List.Item style={{ cursor: 'pointer' }} onClick={() => navigate('/projects/board')}>
                                    <List.Item.Meta title={<span style={{ fontWeight: 600 }}>{p.name}</span>} description={<Tag color={statusColors[p.status]}>{statusLabels[p.status] || p.status}</Tag>} />
                                    <Progress type="circle" percent={pPct} size={40} strokeColor="#6366f1" />
                                </List.Item>
                            )
                        }} locale={{ emptyText: 'Нет проектов' }} />
                    </Card>
                </Col>
            </Row>

            <Modal title="Новый проект" open={modalOpen} onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()} confirmLoading={createProject.isPending} okText="Создать" cancelText="Отмена">
                <Form form={form} layout="vertical" onFinish={handleCreateProject} initialValues={{ status: 'planning' }}>
                    <Form.Item name="name" label="Название" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="description" label="Описание"><Input.TextArea rows={3} /></Form.Item>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="status" label="Статус"><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="budget" label="Бюджет"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="start_date" label="Начало"><Input type="date" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="end_date" label="Окончание"><Input type="date" /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    )
}
