import { Row, Col, Spin, Card, Statistic, Space, Button, List, Tag, Progress, Modal, Form, Input, Select, message, InputNumber } from 'antd'
import { ProjectOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useProjects, useTasks, useCreateProject } from '../../api/hooks'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']
const statusLabels: Record<string, string> = { active: 'common.active', completed: 'projects.completed', on_hold: 'common.on_hold', planning: 'common.planning' }
const statusColors: Record<string, string> = { active: 'green', completed: 'blue', on_hold: 'orange', planning: 'default' }

export default function ProjectsDashboard() {
    const { t } = useTranslation()
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
        try { await createProject.mutateAsync(values); message.success(t('common.created_ok')); setModalOpen(false); form.resetFields() }
        catch { message.error(t('common.error')) }
    }

    const kpis = [
        { title: t('projects.total_projects'), value: projects.length, icon: <ProjectOutlined />, color: '#6366f1' },
        { title: t('projects.active_tasks'), value: tasks.length, icon: <CheckCircleOutlined />, color: '#8b5cf6' },
        { title: t('projects.completed'), value: doneTasks, icon: <ClockCircleOutlined />, color: '#22c55e' },
        { title: t('projects.progress'), value: `${progressPct}%`, icon: <TeamOutlined />, color: '#ec4899' },
    ]

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('projects.title')}</h1><p>{t('projects.subtitle')}</p></div>
                <Space>
                    <Button onClick={() => navigate('/projects/board')}>{t('projects.board_title')}</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>{t('projects.new_project')}</Button>
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
                    <Card title={t('projects.tasks_by_status')} extra={<Button type="link" onClick={() => navigate('/projects/board')}>{t('projects.board_link')}</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart><Pie data={tasksByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                                {tasksByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title={t('projects.project_list')}>
                        <List dataSource={projects} renderItem={(p: any) => {
                            const pTasks = tasks.filter((t: any) => t.project_id === p.id)
                            const pDone = pTasks.filter((t: any) => t.status === 'done').length
                            const pPct = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0
                            return (
                                <List.Item style={{ cursor: 'pointer' }} onClick={() => navigate('/projects/board')}>
                                    <List.Item.Meta title={<span style={{ fontWeight: 600 }}>{p.name}</span>} description={<Tag color={statusColors[p.status]}>{t(statusLabels[p.status] || p.status)}</Tag>} />
                                    <Progress type="circle" percent={pPct} size={40} strokeColor="#6366f1" />
                                </List.Item>
                            )
                        }} locale={{ emptyText: t('common.no_data') }} />
                    </Card>
                </Col>
            </Row>

            <Modal title={t('projects.new_project')} open={modalOpen} onCancel={() => setModalOpen(false)}
                onOk={() => form.submit()} confirmLoading={createProject.isPending} okText={t('common.create')} cancelText={t('common.cancel')}>
                <Form form={form} layout="vertical" onFinish={handleCreateProject} initialValues={{ status: 'planning' }}>
                    <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="description" label={t('common.description')}><Input.TextArea rows={3} /></Form.Item>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="status" label={t('common.status')}><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="budget" label={t('projects.budget')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="start_date" label={t('projects.start_date')}><Input type="date" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="end_date" label={t('projects.end_date')}><Input type="date" /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    )
}
