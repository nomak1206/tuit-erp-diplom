import { Row, Col, Spin, Card, Statistic, Space, Button, Tag, Progress, Divider, Descriptions } from 'antd'
import { TeamOutlined, IdcardOutlined, ClockCircleOutlined, WalletOutlined, ArrowRightOutlined, CalendarOutlined, ScheduleOutlined, DollarOutlined, CalculatorOutlined, AlertOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useEmployees, useDepartments, useLeaves, useHrStats } from '../../api/hooks'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4']

export default function HrDashboard() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { data: employees = [], isLoading: el } = useEmployees()
    const { data: departments = [] } = useDepartments()
    const { data: leaves = [] } = useLeaves()
    const { data: stats } = useHrStats()

    if (el) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const activeCount = employees.filter((e: any) => e.status === 'active').length
    const pendingLeaves = leaves.filter((l: any) => l.status === 'pending').length
    const totalSalary = employees.reduce((s: number, e: any) => s + (e.salary || 0), 0)
    const byDepartment = departments.map((d: any) => ({ name: d.name, value: employees.filter((e: any) => e.department_id === d.id).length })).filter((d: any) => d.value > 0)

    const statusMap: Record<string, string> = {
        active: t('employees.statuses.active'), on_leave: t('employees.statuses.vacation'), terminated: t('employees.statuses.dismissed'), probation: t('employees.statuses.active'),
    }
    const byStatus = Object.entries(employees.reduce((acc: any, e: any) => { acc[e.status || 'active'] = (acc[e.status || 'active'] || 0) + 1; return acc }, {})).map(([name, value]) => ({ name: statusMap[name] || name, value }))

    const kpis = [
        { title: t('hr_dashboard.total_employees'), value: employees.length, icon: <TeamOutlined />, color: '#6366f1', path: '/hr/employees' },
        { title: t('employees.statuses.active'), value: activeCount, icon: <IdcardOutlined />, color: '#22c55e', path: '/hr/employees' },
        { title: t('hr_dashboard.pending_leaves'), value: pendingLeaves, icon: <AlertOutlined />, color: pendingLeaves > 0 ? '#f97316' : '#64748b', path: '/hr/vacations' },
        { title: t('hr_dashboard.payroll_fund'), value: `${(totalSalary / 1e6).toFixed(1)}M`, icon: <WalletOutlined />, color: '#8b5cf6', path: '/hr/payroll' },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{t('hr_dashboard.title')}</h1><p>{t('hr_dashboard.subtitle')}</p></div>
            <Row gutter={[16, 16]}>
                {kpis.map(k => (
                    <Col xs={12} lg={6} key={k.title}>
                        <Card hoverable onClick={() => navigate(k.path)} style={{ cursor: 'pointer', borderLeft: `3px solid ${k.color}` }}>
                            <Statistic title={k.title} value={k.value} prefix={<span style={{ color: k.color }}>{k.icon}</span>} />
                            <div style={{ textAlign: 'right', marginTop: 8 }}><ArrowRightOutlined style={{ color: k.color }} /></div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title={t('hr_dashboard.by_department')} extra={<Button type="link" onClick={() => navigate('/hr/employees')}>{t('hr_dashboard.all_employees')}</Button>}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart><Pie data={byDepartment} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`}>
                                {byDepartment.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie><Tooltip /></PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title={t('hr_dashboard.by_status')}>
                        {byStatus.map((s: any) => (
                            <div key={s.name} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span>{s.name}</span><Tag>{s.value as number}</Tag>
                                </div>
                                <Progress percent={Math.round(((s.value as number) / employees.length) * 100)} strokeColor="#6366f1" />
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={14}>
                    <Card title={t('hr_dashboard.quick_actions')}>
                        <Row gutter={[12, 12]}>
                            <Col span={8}><Button block icon={<IdcardOutlined />} onClick={() => navigate('/hr/employees')}>{t('hr_dashboard.open_employees')}</Button></Col>
                            <Col span={8}><Button block icon={<ClockCircleOutlined />} onClick={() => navigate('/hr/timesheet')}>{t('hr_dashboard.open_timesheet')}</Button></Col>
                            <Col span={8}><Button block icon={<WalletOutlined />} onClick={() => navigate('/hr/payroll')}>{t('hr_dashboard.open_payroll')}</Button></Col>
                            <Col span={8}><Button block icon={<CalendarOutlined />} type="primary" ghost onClick={() => navigate('/hr/vacations')}>{t('hr_dashboard.open_vacations')}</Button></Col>
                            <Col span={8}><Button block icon={<ScheduleOutlined />} type="primary" ghost onClick={() => navigate('/hr/schedules')}>{t('layout.hr_schedules')}</Button></Col>
                            <Col span={8}><Button block icon={<CalculatorOutlined />} type="primary" ghost onClick={() => navigate('/hr/payroll')}>{t('layout.hr_payroll')}</Button></Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title={<><DollarOutlined /> {t('common.details')}</>} size="small">
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label={t('payroll.ndfl')}><Tag color="red">12%</Tag></Descriptions.Item>
                            <Descriptions.Item label={t('payroll.inps')}><Tag color="orange">1%</Tag></Descriptions.Item>
                            <Descriptions.Item label={t('payroll.esn')}><Tag color="blue">12%</Tag></Descriptions.Item>
                            <Descriptions.Item label="MROT"><strong>{stats?.mrot ? stats.mrot.toLocaleString('ru-RU') : '1 155 000'} UZS</strong></Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
