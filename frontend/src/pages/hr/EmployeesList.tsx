import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Input, Select, Modal, Form, Row, Col, message, Drawer, Descriptions, Avatar, Popconfirm, Tooltip, Spin, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExportOutlined } from '@ant-design/icons'
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useDepartments } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'

const statusLabels: Record<string, string> = { active: 'Активный', on_leave: 'В отпуске', terminated: 'Уволен', probation: 'Испытательный' }
const statusColors: Record<string, string> = { active: 'green', on_leave: 'blue', terminated: 'red', probation: 'orange' }
const scheduleLabels: Record<string, string> = { five_day: '5-дневка', six_day: '6-дневка', shift: 'Сменный', flexible: 'Свободный' }

export default function EmployeesList() {
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
            if (editRecord) { await updateEmployee.mutateAsync({ id: editRecord.id, ...values }); message.success('Сотрудник обновлён') }
            else { await createEmployee.mutateAsync(values); message.success('Сотрудник добавлен') }
            setModalOpen(false); form.resetFields(); setEditRecord(null)
        } catch { message.error('Ошибка') }
    }

    const handleDelete = async (id: number) => {
        try { await deleteEmployee.mutateAsync(id); message.success('Сотрудник удалён'); setDrawerOpen(false) }
        catch { message.error('Ошибка') }
    }

    const handleExport = () => {
        exportToCSV(filtered.map((e: any) => ({ ...e, department: getDeptName(e.department_id) })), 'employees', [
            { key: 'first_name', title: 'Имя' }, { key: 'last_name', title: 'Фамилия' },
            { key: 'email', title: 'Email' }, { key: 'position', title: 'Должность' },
            { key: 'department', title: 'Отдел' }, { key: 'status', title: 'Статус' },
            { key: 'salary', title: 'Оклад' },
        ])
        message.success(`Экспортировано ${filtered.length} записей`)
    }

    const columns = [
        {
            title: 'Сотрудник', key: 'name',
            render: (_: any, r: any) => (
                <Space><Avatar style={{ background: '#6366f1' }} icon={<UserOutlined />} size="small" />
                    <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => openDetail(r)}>{r.first_name} {r.last_name}</span>
                </Space>
            ),
        },
        { title: 'Должность', dataIndex: 'position', key: 'position' },
        { title: 'Отдел', dataIndex: 'department_id', key: 'department_id', render: (v: number) => v ? <Tag color="blue">{getDeptName(v)}</Tag> : '—' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Оклад', dataIndex: 'salary', key: 'salary', render: (v: number) => v ? <span style={{ fontWeight: 600 }}>{v.toLocaleString('ru-RU')} UZS</span> : '—', sorter: (a: any, b: any) => (a.salary || 0) - (b.salary || 0) },
        { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] || s}</Tag> },
        {
            title: '', key: 'actions', width: 120,
            render: (_: any, r: any) => (
                <Space onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Карточка"><Button type="text" icon={<EyeOutlined />} onClick={() => openDetail(r)} /></Tooltip>
                    <Tooltip title="Редактировать"><Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    <Popconfirm title="Удалить сотрудника?" onConfirm={() => handleDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
                </Space>
            ),
        },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>Сотрудники</h1><p>Кадровый реестр — {filtered.length} записей</p></div>
                <Space><Button icon={<ExportOutlined />} onClick={handleExport}>Экспорт</Button><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Новый сотрудник</Button></Space>
            </div>
            <Space style={{ marginBottom: 16 }} wrap>
                <Input placeholder="Поиск..." prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
                <Select placeholder="Статус" style={{ width: 160 }} allowClear value={statusFilter} onChange={setStatusFilter} options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
                <Select placeholder="Отдел" style={{ width: 200 }} allowClear value={deptFilter} onChange={setDeptFilter} options={departments.map((d: any) => ({ value: d.id, label: d.name }))} />
            </Space>
            <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10, showTotal: t => `Всего: ${t}`, showSizeChanger: true }}
                onRow={(r) => ({ onClick: () => openDetail(r), style: { cursor: 'pointer' } })} />

            <Modal title={editRecord ? 'Редактировать сотрудника' : 'Новый сотрудник'} open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
                onOk={() => form.submit()} confirmLoading={createEmployee.isPending || updateEmployee.isPending}
                okText={editRecord ? 'Сохранить' : 'Создать'} cancelText="Отмена" width={600}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'active' }}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="last_name" label="Фамилия" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="first_name" label="Имя" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="middle_name" label="Отчество"><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="email" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="phone" label="Телефон"><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="position" label="Должность" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item name="department_id" label="Отдел"><Select allowClear options={departments.map((d: any) => ({ value: d.id, label: d.name }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="salary" label="Оклад"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="status" label="Статус"><Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="schedule_type" label="График"><Select allowClear options={Object.entries(scheduleLabels).map(([v, l]) => ({ value: v, label: l }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="hire_date" label="Дата найма"><Input type="date" /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>

            <Drawer title={selected ? `${selected.first_name} ${selected.last_name}` : ''} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={460}
                extra={<Space>
                    <Button icon={<EditOutlined />} onClick={() => { setDrawerOpen(false); openEdit(selected) }}>Редактировать</Button>
                    <Popconfirm title="Удалить?" onConfirm={() => selected && handleDelete(selected.id)}>
                        <Button danger icon={<DeleteOutlined />}>Удалить</Button>
                    </Popconfirm>
                </Space>}>
                {selected && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar size={80} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: 32 }}>{selected.first_name?.[0]}{selected.last_name?.[0]}</Avatar>
                            <h3 style={{ margin: '12px 0 4px' }}>{selected.last_name} {selected.first_name} {selected.middle_name || ''}</h3>
                            <Tag color={statusColors[selected.status]}>{statusLabels[selected.status]}</Tag>
                            {selected.employee_number && <Tag style={{ marginTop: 4 }}>Таб. №{selected.employee_number}</Tag>}
                        </div>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Должность">{selected.position || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Отдел">{getDeptName(selected.department_id)}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selected.email || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Телефон">{selected.phone || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Оклад"><span style={{ fontWeight: 700, color: '#818cf8' }}>{(selected.salary || 0).toLocaleString('ru-RU')} UZS</span></Descriptions.Item>
                            <Descriptions.Item label="График">{scheduleLabels[selected.schedule_type] || '5-дневка'}</Descriptions.Item>
                            <Descriptions.Item label="Дата найма">{selected.hire_date ? new Date(selected.hire_date).toLocaleDateString('ru-RU') : '—'}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    )
}
