import { useState } from 'react'
import { Card, Row, Col, Select, DatePicker, Button, Descriptions, Table, Tag, Statistic, Space, Spin, Divider, message, Alert } from 'antd'
import { CalendarOutlined, CalculatorOutlined, UserOutlined, GiftOutlined } from '@ant-design/icons'
import { useEmployees, useLeaves, useHolidays } from '../../api/hooks'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

export default function VacationCalc() {
    const { t } = useTranslation()
    const { data: employees = [], isLoading } = useEmployees()
    const { data: leaves = [] } = useLeaves()
    const { data: holidays = [] } = useHolidays()
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
    const [dates, setDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null])
    const [result, setResult] = useState<any>(null)
    const [calculating, setCalculating] = useState(false)

    const handleCalculate = async () => {
        if (!selectedEmployee || !dates[0] || !dates[1]) {
            message.warning(t('vacations.select_employee'))
            return
        }
        setCalculating(true)
        try {
            const res = await fetch(
                `/api/hr/vacation/calculate?employee_id=${selectedEmployee}&start_date=${dates[0].format('YYYY-MM-DD')}&end_date=${dates[1].format('YYYY-MM-DD')}`
            )
            const data = await res.json()
            setResult(data)
        } catch {
            message.error(t('common.error'))
        }
        setCalculating(false)
    }

    const fmt = (v: number) => v?.toLocaleString('ru-RU') + ' UZS'

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const leaveTypes: Record<string, { label: string; color: string }> = {
        vacation: { label: t('dashboard.vacation'), color: 'blue' },
        sick: { label: t('dashboard.sick'), color: 'orange' },
        personal: { label: t('common.internal'), color: 'purple' },
        maternity: { label: t('common.approved'), color: 'pink' },
        unpaid: { label: t('dashboard.unpaid'), color: 'default' },
    }

    const leaveColumns = [
        { title: t('payroll.employee'), dataIndex: 'employee_name', key: 'name' },
        { title: t('common.type'), dataIndex: 'type', key: 'type', render: (tp: string) => <Tag color={leaveTypes[tp]?.color || 'default'}>{leaveTypes[tp]?.label || tp}</Tag> },
        { title: t('projects.start_date'), dataIndex: 'start_date', key: 'start' },
        { title: t('projects.end_date'), dataIndex: 'end_date', key: 'end' },
        { title: t('vacations.calendar_days'), dataIndex: 'calendar_days', key: 'cal' },
        { title: t('vacations.work_days'), dataIndex: 'work_days', key: 'work' },
        { title: t('common.status'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'approved' ? 'green' : s === 'pending' ? 'orange' : 'red'}>{s === 'approved' ? t('common.approved') : s === 'pending' ? t('common.pending') : t('common.rejected')}</Tag> },
    ]

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><CalendarOutlined /> {t('vacations.title')}</h1>
                <p>{t('vacations.subtitle')}</p>
            </div>

            <Alert message={t('vacations.formula_info')} type="info" showIcon style={{ marginBottom: 16 }} />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card title={<><CalculatorOutlined /> {t('vacations.title')}</>}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}><UserOutlined /> {t('vacations.employee_name')}</label>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder={t('vacations.select_employee')}
                                    showSearch
                                    optionFilterProp="label"
                                    onChange={v => { setSelectedEmployee(v); setResult(null) }}
                                    options={employees.map((e: any) => ({ value: e.id, label: `${e.last_name} ${e.first_name} ${e.middle_name} — ${e.position}` }))}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}><CalendarOutlined /> {t('payroll.period')}</label>
                                <DatePicker.RangePicker
                                    style={{ width: '100%' }}
                                    onChange={(vals) => { setDates(vals as any); setResult(null) }}
                                    format="DD.MM.YYYY"
                                />
                            </div>
                            <Button type="primary" icon={<CalculatorOutlined />} onClick={handleCalculate} loading={calculating} block size="large">
                                {t('payroll.calculate')}
                            </Button>
                        </Space>

                        {result && (
                            <>
                                <Divider />
                                <Descriptions bordered column={2} size="small" title={t('vacations.result_title')}>
                                    <Descriptions.Item label={t('vacations.employee_name')} span={2}>{result.employee_name}</Descriptions.Item>
                                    <Descriptions.Item label={t('contacts.position')}>{result.position}</Descriptions.Item>
                                    <Descriptions.Item label={t('vacations.avg_salary')}>{fmt(result.avg_salary)}</Descriptions.Item>
                                    <Descriptions.Item label={t('vacations.daily_rate')}>{fmt(result.daily_rate)}</Descriptions.Item>
                                    <Descriptions.Item label={t('vacations.calendar_days')}>{result.calendar_days}</Descriptions.Item>
                                    <Descriptions.Item label={t('vacations.work_days')}>{result.work_days}</Descriptions.Item>
                                    <Descriptions.Item label={t('vacations.coefficient')}>{25.4}</Descriptions.Item>
                                </Descriptions>
                                <Divider orientation="left">{t('vacations.accrued')}</Divider>
                                <Descriptions bordered column={2} size="small">
                                    <Descriptions.Item label={t('vacations.accrued')} span={2}>
                                        <span style={{ fontSize: 16, fontWeight: 700, color: '#6366f1' }}>{fmt(result.vacation_pay_gross)}</span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label={t('vacations.ndfl_12')}>{fmt(result.ndfl)}</Descriptions.Item>
                                    <Descriptions.Item label={t('vacations.inps_1')}>{fmt(result.inps)}</Descriptions.Item>
                                    <Descriptions.Item label={t('vacations.to_pay')} span={2}>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{fmt(result.vacation_pay_net)}</span>
                                    </Descriptions.Item>
                                </Descriptions>
                                <Divider orientation="left">{t('vacations.remaining')}</Divider>
                                <Row gutter={16}>
                                    <Col span={8}><Statistic title={t('vacations.total_days')} value={result.min_vacation_days} suffix={t('vacations.cal_days_suffix')} /></Col>
                                    <Col span={8}><Statistic title={t('vacations.used')} value={result.used_days} suffix={t('vacations.cal_days_suffix')} valueStyle={{ color: '#f97316' }} /></Col>
                                    <Col span={8}><Statistic title={t('vacations.remaining')} value={result.remaining_days} suffix={t('vacations.cal_days_suffix')} valueStyle={{ color: '#22c55e' }} /></Col>
                                </Row>
                            </>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title={<><GiftOutlined /> {t('schedules.holidays')} {new Date().getFullYear()}</>} style={{ marginBottom: 16 }}>
                        {holidays.map((h: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <span>{h.name}</span>
                                <Tag color="red">{dayjs(h.date).format('DD.MM')}</Tag>
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>

            <Card title={t('vacations.leave_history')} style={{ marginTop: 16 }}>
                <Table dataSource={leaves} columns={leaveColumns} rowKey="id" pagination={false} size="small" />
            </Card>
        </div>
    )
}
