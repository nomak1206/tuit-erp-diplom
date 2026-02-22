import { useState, useMemo } from 'react'
import { Table, Tag, Button, Space, Spin, Card, Row, Col, Statistic, message, Input } from 'antd'
import { ClockCircleOutlined, CheckCircleOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons'
import { useEmployees } from '../../api/hooks'
import { exportToCSV } from '../../utils/export'
import { useTranslation } from 'react-i18next'

export default function Timesheet() {
    const { t } = useTranslation()
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
            status: e.status === 'active' ? t('timesheet.present') : e.status === 'on_leave' ? t('timesheet.on_vacation') : e.status,
            worked_days: e.status === 'active' ? workedDays : 0,
            worked_hours: e.status === 'active' ? workedDays * 8 : 0,
        })), 'timesheet', [
            { key: 'name', title: t('payroll.employee') }, { key: 'position', title: t('employees.position') },
            { key: 'status', title: t('common.status') }, { key: 'worked_days', title: t('timesheet.work_days') },
            { key: 'worked_hours', title: t('timesheet.total_hours') },
        ])
        message.success(`${t('common.export')}: ${employees.length}`)
    }

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const columns = [
        { title: t('payroll.employee'), key: 'name', render: (_: any, r: any) => <span style={{ fontWeight: 600 }}>{r.first_name} {r.last_name}</span> },
        { title: t('employees.position'), dataIndex: 'position', key: 'position' },
        { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : s === 'on_leave' ? 'blue' : 'red'}>{s === 'active' ? t('timesheet.present') : s === 'on_leave' ? t('timesheet.on_vacation') : s}</Tag> },
        { title: t('timesheet.work_days'), key: 'days', render: (_: any, r: any) => r.status === 'active' ? <span style={{ fontWeight: 600 }}>{workedDays}</span> : <span style={{ color: '#64748b' }}>—</span> },
        { title: t('timesheet.total_hours'), key: 'hours', render: (_: any, r: any) => r.status === 'active' ? <span>{workedDays * 8}</span> : '—' },
        {
            title: '', key: 'actions', width: 120,
            render: (_: any, r: any) => r.status === 'active' ? (
                <Space>
                    <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => message.success(`${r.first_name}`)}>{t('timesheet.present')}</Button>
                </Space>
            ) : null,
        },
    ]

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>{t('timesheet.title')}</h1><p>{t('timesheet.subtitle')}</p></div>
                <Space>
                    <Button icon={<ExportOutlined />} onClick={handleExport}>{t('common.export')}</Button>
                </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Input placeholder={t('timesheet.search')} prefix={<SearchOutlined />} style={{ width: 280 }} value={search} onChange={e => setSearch(e.target.value)} allowClear />
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={12} lg={6}><Card bordered={false}><Statistic title={t('timesheet.work_days')} value={workedDays} suffix={`/ ${workDays.filter(d => !d.isWeekend).length}`} /></Card></Col>
                <Col xs={12} lg={6}><Card bordered={false}><Statistic title={t('timesheet.employees_at_work')} value={activeEmps.length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
                <Col xs={12} lg={6}><Card bordered={false}><Statistic title={t('timesheet.total_hours')} value={activeEmps.length * workedDays * 8} suffix={t('timesheet.hours_suffix')} /></Card></Col>
                <Col xs={12} lg={6}><Card bordered={false}><Statistic title={t('timesheet.on_vacation')} value={employees.filter((e: any) => e.status === 'on_leave').length} valueStyle={{ color: '#1890ff' }} /></Card></Col>
            </Row>

            <Table columns={columns} dataSource={filteredEmps} rowKey="id" pagination={{ pageSize: 10, showTotal: total => `${t('common.total')}: ${total}` }} />
        </div>
    )
}
