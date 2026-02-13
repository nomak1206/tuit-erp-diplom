import { useState } from 'react'
import { Card, Row, Col, Select, DatePicker, Button, Descriptions, Table, Tag, Statistic, Space, Spin, Divider, message, Alert } from 'antd'
import { CalendarOutlined, CalculatorOutlined, UserOutlined, GiftOutlined } from '@ant-design/icons'
import { useEmployees, useLeaves, useHolidays } from '../../api/hooks'
import dayjs from 'dayjs'

export default function VacationCalc() {
    const { data: employees = [], isLoading } = useEmployees()
    const { data: leaves = [] } = useLeaves()
    const { data: holidays = [] } = useHolidays()
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
    const [dates, setDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null])
    const [result, setResult] = useState<any>(null)
    const [calculating, setCalculating] = useState(false)

    const handleCalculate = async () => {
        if (!selectedEmployee || !dates[0] || !dates[1]) {
            message.warning('Выберите сотрудника и даты отпуска')
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
            message.error('Ошибка расчёта')
        }
        setCalculating(false)
    }

    const fmt = (v: number) => v?.toLocaleString('ru-RU') + ' сўм'

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const leaveTypes: Record<string, { label: string; color: string }> = {
        vacation: { label: 'Ежегодный', color: 'blue' },
        sick: { label: 'Больничный', color: 'orange' },
        personal: { label: 'Личный', color: 'purple' },
        maternity: { label: 'Декретный', color: 'pink' },
        unpaid: { label: 'Без сохр. ЗП', color: 'default' },
    }

    const leaveColumns = [
        { title: 'Сотрудник', dataIndex: 'employee_name', key: 'name' },
        { title: 'Тип', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={leaveTypes[t]?.color || 'default'}>{leaveTypes[t]?.label || t}</Tag> },
        { title: 'Начало', dataIndex: 'start_date', key: 'start' },
        { title: 'Конец', dataIndex: 'end_date', key: 'end' },
        { title: 'Дней (кал.)', dataIndex: 'calendar_days', key: 'cal' },
        { title: 'Раб. дней', dataIndex: 'work_days', key: 'work' },
        { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'approved' ? 'green' : s === 'pending' ? 'orange' : 'red'}>{s === 'approved' ? 'Одобрен' : s === 'pending' ? 'Ожидание' : 'Отклонён'}</Tag> },
    ]

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><CalendarOutlined /> Расчёт отпускных</h1>
                <p>Калькулятор по Трудовому кодексу Республики Узбекистан</p>
            </div>

            <Alert message="Формула расчёта: Среднемесячная ЗП ÷ 25,4 × Рабочие дни в отпуске. Мин. отпуск — 21 календарный день (ТК РУз)." type="info" showIcon style={{ marginBottom: 16 }} />

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card title={<><CalculatorOutlined /> Калькулятор</>}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}><UserOutlined /> Сотрудник</label>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Выберите сотрудника"
                                    showSearch
                                    optionFilterProp="label"
                                    onChange={v => { setSelectedEmployee(v); setResult(null) }}
                                    options={employees.map((e: any) => ({ value: e.id, label: `${e.last_name} ${e.first_name} ${e.middle_name} — ${e.position}` }))}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}><CalendarOutlined /> Период отпуска</label>
                                <DatePicker.RangePicker
                                    style={{ width: '100%' }}
                                    onChange={(vals) => { setDates(vals as any); setResult(null) }}
                                    format="DD.MM.YYYY"
                                />
                            </div>
                            <Button type="primary" icon={<CalculatorOutlined />} onClick={handleCalculate} loading={calculating} block size="large">
                                Рассчитать отпускные
                            </Button>
                        </Space>

                        {result && (
                            <>
                                <Divider />
                                <Descriptions bordered column={2} size="small" title="Результат расчёта">
                                    <Descriptions.Item label="Сотрудник" span={2}>{result.employee_name}</Descriptions.Item>
                                    <Descriptions.Item label="Должность">{result.position}</Descriptions.Item>
                                    <Descriptions.Item label="Среднемесячная ЗП">{fmt(result.avg_salary)}</Descriptions.Item>
                                    <Descriptions.Item label="Дневная ставка">{fmt(result.daily_rate)}</Descriptions.Item>
                                    <Descriptions.Item label="Календ. дней">{result.calendar_days}</Descriptions.Item>
                                    <Descriptions.Item label="Рабочих дней">{result.work_days}</Descriptions.Item>
                                    <Descriptions.Item label="Коэффициент">{25.4}</Descriptions.Item>
                                </Descriptions>
                                <Divider orientation="left">Начисления и удержания</Divider>
                                <Descriptions bordered column={2} size="small">
                                    <Descriptions.Item label="Отпускные (начислено)" span={2}>
                                        <span style={{ fontSize: 16, fontWeight: 700, color: '#6366f1' }}>{fmt(result.vacation_pay_gross)}</span>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="НДФЛ (12%)">{fmt(result.ndfl)}</Descriptions.Item>
                                    <Descriptions.Item label="ИНПС (1%)">{fmt(result.inps)}</Descriptions.Item>
                                    <Descriptions.Item label="К выплате" span={2}>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{fmt(result.vacation_pay_net)}</span>
                                    </Descriptions.Item>
                                </Descriptions>
                                <Divider orientation="left">Остаток отпусков</Divider>
                                <Row gutter={16}>
                                    <Col span={8}><Statistic title="Всего дней" value={result.min_vacation_days} suffix="кал.дн." /></Col>
                                    <Col span={8}><Statistic title="Использовано" value={result.used_days} suffix="кал.дн." valueStyle={{ color: '#f97316' }} /></Col>
                                    <Col span={8}><Statistic title="Осталось" value={result.remaining_days} suffix="кал.дн." valueStyle={{ color: '#22c55e' }} /></Col>
                                </Row>
                            </>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title={<><GiftOutlined /> Праздники РУз {new Date().getFullYear()}</>} style={{ marginBottom: 16 }}>
                        {holidays.map((h: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                                <span>{h.name}</span>
                                <Tag color="red">{dayjs(h.date).format('DD.MM')}</Tag>
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>

            <Card title="История отпусков и отсутствий" style={{ marginTop: 16 }}>
                <Table dataSource={leaves} columns={leaveColumns} rowKey="id" pagination={false} size="small" />
            </Card>
        </div>
    )
}
