import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Drawer, Descriptions, Avatar, Popconfirm, Tooltip, Spin, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExportOutlined } from '@ant-design/icons'
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useDepartments } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'
import { useTranslation } from 'react-i18next'

const statusColors: Record<string, string> = { active: 'green', on_leave: 'blue', terminated: 'red', probation: 'orange' }

export default function EmployeesList() {
    const { t } = useTranslation()
    const { data: employees = [], isLoading } = useEmployees()
    const { data: departments = [] } = useDepartments()
    const createEmployee = useCreateEmployee()
    const updateEmployee = useUpdateEmployee()
    const deleteEmployee = useDeleteEmployee()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string | undefined>()
    const [deptFilter, setDeptFilter] = useState<number | undefined>()
    const [modalOpen, setModalOpen] = useState(false)
    const [editRecord, setEditRecord] = useState<any>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [form] = Form.useForm()

    const statusLabels: Record<string, string> = {
        active: t('employees.statuses.active'), on_leave: t('employees.statuses.vacation'),
        terminated: t('employees.statuses.dismissed'), probation: t('employees.statuses.active')
    }
    const scheduleLabels: Record<string, string> = {
        five_day: t('employees.schedules.five_day'), six_day: t('employees.schedules.six_day'),
        shift: t('employees.schedules.shift'), flexible: t('employees.schedules.flexible')
    }

    const filtered = useMemo(() => {
        let result = employees
        if (search) { const s = search.toLowerCase(); result = result.filter((e: any) => e.first_name?.toLowerCase().includes(s) || e.last_name?.toLowerCase().includes(s) || e.email?.toLowerCase().includes(s) || e.position?.toLowerCase().includes(s)) }
        if (statusFilter) result = result.filter((e: any) => e.status === statusFilter)
        if (deptFilter) result = result.filter((e: any) => e.department_id === deptFilter)
        return result
    }, [employees, search, statusFilter, deptFilter])

    const getDeptName = (id: number) => departments.find((d: any) => d.id === id)?.name || '—'

    const openCreate = () => { setEditRecord(null); form.resetFields(); setModalOpen(true) }
    const openEdit = (r: any) => { setEditRecord(r); form.setFieldsValue(r); setModalOpen(true) }
    const openDetail = (r: any) => { setSelected(r); setDrawerOpen(true) }

    const handleSubmit = async (values: any) => {
        try {
            if (editRecord) { await updateEmployee.mutateAsync({ id: editRecord.id, ...values }); message.success(t('settings.profile_saved')) }
            else { await createEmployee.mutateAsync(values); message.success(t('settings.profile_saved')) }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Error') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteEmployee.mutateAsync(id); message.success(t('common.delete')); setDrawerOpen(false) }
        catch { message.error('Error') }
    }

    const handleExport = () => {
        exportToCSV(filtered.map((e: any) => ({ ...e, department: getDeptName(e.department_id) })), 'employees', [
            { key: 'first_name', title: t('settings.full_name') }, { key: 'last_name', title: t('settings.full_name') },
            { key: 'email', title: 'Email' }, { key: 'position', title: t('employees.position') },
            { key: 'department', title: t('employees.department') }, { key: 'status', title: t('common.status') },
            { key: 'salary', title: t('employees.salary') },
        ])
        message.success(`${t('common.export')}: ${filtered.length}`)
    }

    const columns = [
        {
            title: t('employees.title'), key: 'name',
            render: (_: any, r: any) => (
                <Space><Avatar style={{ background: '#6366f1' }} icon={<UserOutlined />} size="small" />
                    <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => openDetail(r)}>{r.first_name} {r.last_name}</span>
                </Space>
            ),
        },
        { title: t('employees.position'), dataIndex: 'position', key: 'position' },
        { title: t('employees.department'), dataIndex: 'department_id', key: 'department_id', render: (v: number) => v ? <Tag color="blue">{getDeptName(v)}</Tag> : '—' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: t('employees.salary'), dataIndex: 'salary', key: 'salary', render: (v: number) => v ? <span style={{ fontWeight: 600 }}>{v.toLocaleString('ru-RU')} UZS</span> : '—', sorter: (a: any, b: any) => (a.salary || 0) - (b.salary || 0) },
        { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] || s}</Tag> },
        {
            title: '', key: 'actions', width: 120,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t('common.details')}><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
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
                <div><h1>{t('employees.title')}</h1><p>{t('employees.subtitle')} — {filtered.length} {t('common.records')}</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('employees.new_employee')}</Button></Space>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder={t('employees.search')} prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder={t('common.status')} style={{ width: 160 }} allowClear value={statusFilter} onChange={setStatusFilter} options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
                <Select placeholder={t('employees.department')} style={{ width: 200 }} allowClear value={deptFilter} onChange={setDeptFilter} options={departments.map((d: any) => ({ value: d.id, label: d.name }))} />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10, showTotal: total => `${t('common.total')}: ${total}`, showSizeChanger: true }} scroll={{ x: 'max-content' }}
                onRow={(r) => ({ onClick: () => openDetail(r), style: { cursor: 'pointer' } })} />

            <Modal title={editRecord ? t('employees.edit_employee') : t('employees.new_employee')} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createEmployee.isPending || updateEmployee.isPending}
                okText={editRecord ? t('common.save') : t('common.create')} cancelText={t('common.cancel')} width={600}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'active' }}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="last_name" label={t('settings.full_name')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="first_name" label={t('settings.full_name')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="middle_name" label={t('settings.full_name')}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="email" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="phone" label={t('settings.phone')}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="position" label={t('employees.position')} rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="department_id" label={t('employees.department')}><Select allowClear options={departments.map((d: any) => ({ value: d.id, label: d.name }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="salary" label={t('employees.salary')}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="status" label={t('common.status')}><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="schedule_type" label={t('employees.schedule')}><Select allowClear options={Object.entries(scheduleLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="hire_date" label={t('employees.hire_date')}><Input type="date" /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected ? `${selected.first_name} ${selected.last_name}` : ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={460}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>{t('common.edit')}</Button>
                    <Popconfirm title={t('common.confirm_delete')} onConfirm={() => selected && handleDelete(selected.id)}>
                        <Button danger icon={<DeleteOutlined />}>{t('common.delete')}</Button>
                    </Popconfirm>
                </Space>}>
                {selected && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar size={80} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: 32 }}>{selected.first_name?.[0]}{selected.last_name?.[0]}</Avatar>
                            <h3 style={{ margin: '12px 0 4px' }}>{selected.last_name} {selected.first_name} {selected.middle_name || ''}</h3>
                            <Tag color={statusColors[selected.status]}>{statusLabels[selected.status]}</Tag>
                        </div>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label={t('employees.position')}>{selected.position || '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('employees.department')}>{getDeptName(selected.department_id)}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selected.email || '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('settings.phone')}>{selected.phone || '—'}</Descriptions.Item>
                            <Descriptions.Item label={t('employees.salary')}><span style={{ fontWeight: 700, color: '#818cf8' }}>{(selected.salary || 0).toLocaleString('ru-RU')} UZS</span></Descriptions.Item>
                            <Descriptions.Item label={t('employees.schedule')}>{scheduleLabels[selected.schedule_type] || scheduleLabels['five_day']}</Descriptions.Item>
                            <Descriptions.Item label={t('employees.hire_date')}>{selected.hire_date ? new Date(selected.hire_date).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    )
}
