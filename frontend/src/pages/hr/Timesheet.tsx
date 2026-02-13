import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Spin, Card, Row, Col, Statistic, message, Input } from 'antd'
import { ClockCircleOutlined, CheckCircleOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons'
import { useEmployees } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'

export default function Timesheet() {
    const { data: employees = [], isLoading } = useEmployees()
    const [search, setSearch] = useState('')

    const filteredEmps = useMemo(() => {
        if (!search) return employees
        const s = search.toLowerCase()
        return employees.filter((e: any) => `${e.first_name} ${e.last_name}`.toLowerCase().includes(s) || e.position?.toLowerCase().includes(s))
    }, [employees, search])

    const activeEmps = filteredEmps.filter((e: any) => e.status === 'active')

    const today = new Date()
    const workDays = Array.from({ length: today.getDate() }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth(), i + 1)
        return { day: i + 1, isWeekend: d.getDay() === 0 || d.getDay() === 6 }
    })
    const workedDays = workDays.filter(d => !d.isWeekend).length

    const handleExport = () => {
        exportToCSV(employees.map((e: any) => ({
            name: `${e.first_name} ${e.last_name}`, position: e.position,
            status: e.status === 'active' ? 'На работе' : e.status === 'on_leave' ? 'В отпуске' : e.status,
            worked_days: e.status === 'active' ? workedDays : 0,
            worked_hours: e.status === 'active' ? workedDays * 8 : 0,
        })), 'timesheet', [
            { key: 'name', title: 'Сотрудник' }, { key: 'position', title: 'Должность' },
            { key: 'status', title: 'Статус' }, { key: 'worked_days', title: 'Отработано дней' },
            { key: 'worked_hours', title: 'Часов' },
        ])
        message.success(`Экспортировано ${employees.length} записей`)
    }

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const columns = [
        { title: 'Сотрудник', key: 'name', render: (_: any, r: any) => <span style={{ fontWeight: 600 }}>{r.first_name} {r.last_name}</span> },
        { title: 'Должность', dataIndex: 'position', key: 'position' },
        { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : s === 'on_leave' ? 'blue' : 'red'}>{s === 'active' ? 'На работе' : s === 'on_leave' ? 'В отпуске' : s}</Tag> },
        { title: 'Отработано дней', key: 'days', render: (_: any, r: any) => r.status === 'active' ? <span style={{ fontWeight: 600 }}>{workedDays}</span> : <span style={{ color: '#64748b' }}>—</span> },
        { title: 'Часов', key: 'hours', render: (_: any, r: any) => r.status === 'active' ? <span>{workedDays * 8}</span> : '—' },
        {
            title: '', key: 'actions', width: 120,
            render: (_: any, r: any) => r.status === 'active' ? (
                <Space>
                    <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => message.success(`Отметка для ${r.first_name}`)}>Отметить</Button>
                </Space>
            ) : null,
        },
    ]

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>Табель учёта</h1><p>Учёт рабочего времени — {today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</p></div>
                <Space>
                    <Button icon={<ExportOutlined />} onClick={handleExport}>Экспорт</Button>
                    <Button type="primary" icon={<ClockCircleOutlined />} onClick={() => message.success('Приход зафиксирован')}>Отметить приход</Button>
                </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск по сотруднику..." prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={12} lg={6}><Card bordered={false}><Statistic title="Рабочих дней" value={workedDays} suffix={`/ ${workDays.filter(d => !d.isWeekend).length}`} /></Card></Col>
                <Col xs={12} lg={6}><Card bordered={false}><Statistic title="Сотрудников на работе" value={activeEmps.length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
                <Col xs={12} lg={6}><Card bordered={false}><Statistic title="Общие часы" value={activeEmps.length * workedDays * 8} suffix="ч" /></Card></Col>
                <Col xs={12} lg={6}><Card bordered={false}><Statistic title="В отпуске" value={employees.filter((e: any) => e.status === 'on_leave').length} valueStyle={{ color: '#1890ff' }} /></Card></Col>
            </Row>

            <Table columns={columns} dataSource={filteredEmps} rowKey="id" pagination={{ pageSize: 10, showTotal: t => `Всего: ${t}` }} />
        </div>
    )
}
