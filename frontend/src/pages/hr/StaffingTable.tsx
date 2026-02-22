import { useState, useMemo } from 'react'
import { Card, Table, Tag, Row, Col, Statistic, Spin, Progress, Button, Modal, Form, Input, InputNumber, Select, message, Space, Popconfirm } from 'antd'
import { TeamOutlined, CheckCircleOutlined, WarningOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useStaffing, useStaffingSummary, useDepartments, useCreateStaffing, useUpdateStaffing, useDeleteStaffing } from '../../api/hooks'
import { useTranslation } from 'react-i18next'

const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function StaffingTable() {
    const { t } = useTranslation()
    const { data: staffing = [], isLoading } = useStaffing()
    const { data: summary } = useStaffingSummary()
    const { data: departments = [] } = useDepartments()
    const createStaffing = useCreateStaffing()
    const updateStaffing = useUpdateStaffing()
    const deleteStaffing = useDeleteStaffing()
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [form] = Form.useForm()

    const enriched = useMemo(() => staffing.map((s: any) => ({
        ...s,
        department_name: departments.find((d: any) => d.id === s.department_id)?.name || `${t('staffing.department')} ${s.department_id}`,
        vacancies: s.count - s.occupied,
        fill_pct: Math.round((s.occupied / Math.max(s.count, 1)) * 100),
    })), [staffing, departments])

    const openCreate = () => { setEditRecord(null); form.resetFields(); setModalOpen(true) }
    const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) { await updateStaffing.mutateAsync({ id: editRecord.id, ...values }); message.success(t('common.saved')) }
            else { await createStaffing.mutateAsync(values); message.success(t('common.created_ok')) }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error(t('common.error')) }
    }

    const handleDelete = async (id: number) => {
        try { await deleteStaffing.mutateAsync(id); message.success(t('common.deleted_ok')) }
        catch { message.error(t('common.error')) }
    }

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const columns = [
        { title: t('staffing.department'), dataIndex: 'department_name', render: (v: string) => <Tag color="blue">{v}</Tag>, filters: [...new Set(enriched.map((e: any) => e.department_name))].map(d => ({ text: d as string, value: d as string })), onFilter: (value: any, record: any) => record.department_name === value },
        { title: t('employees.position'), dataIndex: 'position', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
        { title: t('staffing.position_count'), dataIndex: 'count', width: 80, align: 'center' as const },
        { title: t('staffing.occupied'), dataIndex: 'occupied', width: 80, align: 'center' as const, render: (v: number, r: any) => <span style={{ color: v >= r.count ? '#22c55e' : '#f97316', fontWeight: 600 }}>{v}</span> },
        { title: t('staffing.vacancies'), dataIndex: 'vacancies', width: 90, align: 'center' as const, render: (v: number) => v > 0 ? <Tag color="orange">{v}</Tag> : <Tag color="green">0</Tag> },
        { title: t('staffing.fill_rate'), key: 'fill', width: 180, render: (_: any, r: any) => <Progress percent={r.fill_pct} size="small" strokeColor={r.fill_pct >= 100 ? '#22c55e' : r.fill_pct >= 50 ? '#f97316' : '#f43f5e'} /> },
        { title: `${t('staffing.salary_min')}–${t('staffing.salary_max')}`, key: 'salary', render: (_: any, r: any) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{fmt(r.salary_min)} – {fmt(r.salary_max)} UZS</span> },
        {
            title: '', key: 'actions', width: 90,
            render: (_: any, r: any) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
                    <Popconfirm title={t('staffing.delete_position')} onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    const deptSummary = summary?.by_department || {}

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('staffing.title')}</h1><p>{t('staffing.subtitle')}</p></div>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('staffing.new_position')}</Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} lg={6}>
                    <Card><Statistic title={t('staffing.total_positions')} value={summary?.total_positions || 0} prefix={<TeamOutlined style={{ color: '#6366f1' }} />} /></Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card><Statistic title={t('staffing.occupied')} value={summary?.occupied || 0} prefix={<CheckCircleOutlined style={{ color: '#22c55e' }} />} /></Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card><Statistic title={t('staffing.vacancies')} value={summary?.vacancies || 0} prefix={<WarningOutlined style={{ color: '#f97316' }} />} valueStyle={{ color: (summary?.vacancies || 0) > 0 ? '#f97316' : '#22c55e' }} /></Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card><Statistic title={t('staffing.fill_rate')} value={`${summary?.fill_rate || 0}%`} prefix={<Progress type="circle" percent={summary?.fill_rate || 0} size={36} strokeColor={summary?.fill_rate >= 80 ? '#22c55e' : '#f97316'} />} /></Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                {Object.entries(deptSummary).map(([dept, info]: any) => (
                    <Col xs={12} lg={8} key={dept}>
                        <Card size="small" style={{ borderLeft: `3px solid ${info.vacancies > 0 ? '#f97316' : '#22c55e'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontWeight: 600 }}>{dept}</span>
                                <Tag color={info.vacancies > 0 ? 'orange' : 'green'}>{info.occupied}/{info.total}</Tag>
                            </div>
                            <Progress percent={Math.round(info.occupied / Math.max(info.total, 1) * 100)} size="small" strokeColor={info.vacancies > 0 ? '#f97316' : '#22c55e'} />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Table scroll={{ x: 'max-content' }} columns={columns} dataSource={enriched} rowKey="id" pagination={{ pageSize: 20 }} />

            <Modal title={editRecord ? t('common.edit') : t('staffing.new_position')} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createStaffing.isPending || updateStaffing.isPending}
                okText={editRecord ? t('common.save') : t('common.create')} cancelText={t('common.cancel')} width={520}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}><Row gutter={16}>
                    <Col span={24}><Form.Item name="department_id" label={t('staffing.department')} rules={[{ required: true }]}><Select options={departments.map((d: any) => ({ value: d.id, label: d.name }))} /></Form.Item></Col>
                    <Col span={24}><Form.Item name="position" label={t('employees.position')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                    <Col span={8}><Form.Item name="count" label={t('staffing.position_count')} rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="occupied" label={t('staffing.occupied_count')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={8}><div /></Col>
                    <Col span={12}><Form.Item name="salary_min" label={t('staffing.salary_min')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="salary_max" label={t('staffing.salary_max')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={24}><Form.Item name="description" label={t('common.description')}><Input.TextArea rows={2} /></Form.Item></Col>
                </Row></Form>
            </Modal>
        </div>
    )
}
