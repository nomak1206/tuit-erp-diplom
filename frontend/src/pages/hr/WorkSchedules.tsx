import { Card, Row, Col, Table, Tag, Spin, Descriptions, Timeline, Badge, Tabs } from 'antd'
import { ScheduleOutlined, ClockCircleOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons'
import { useSchedules, useHolidays, useEmployees } from '../../api/hooks'
import dayjs from 'dayjs'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function WorkSchedules() {
    const { data: schedules = [], isLoading } = useSchedules()
    const { data: holidays = [] } = useHolidays()
    const { data: employees = [] } = useEmployees()

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const scheduleTypes: Record<string, { label: string; color: string }> = {
        five_day: { label: '5-дневка', color: 'blue' },
        six_day: { label: '6-дневка', color: 'orange' },
        shift: { label: 'Сменный', color: 'purple' },
        flexible: { label: 'Гибкий', color: 'green' },
    }

    const scheduleCols = [
        { title: 'Название', dataIndex: 'name', key: 'name', render: (n: string, r: any) => <><strong>{n}</strong>{r.is_default && <Tag color="green" style={{ marginLeft: 8 }}>По умолч.</Tag>}</> },
        { title: 'Тип', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={scheduleTypes[t]?.color || 'default'}>{scheduleTypes[t]?.label || t}</Tag> },
        { title: 'Рабочие дни', dataIndex: 'work_days', key: 'days', render: (days: number[]) => days.length > 0 ? days.map(d => <Tag key={d} style={{ marginBottom: 2 }}>{WEEKDAYS[d]}</Tag>) : <Tag color="purple">По графику</Tag> },
        { title: 'Часы', key: 'time', render: (_: any, r: any) => `${r.start_time} – ${r.end_time}` },
        { title: 'Ч/день', dataIndex: 'hours_per_day', key: 'hpd', render: (v: number) => `${v}ч` },
        { title: 'Ч/неделю', dataIndex: 'hours_per_week', key: 'hpw', render: (v: number) => <strong>{v}ч</strong> },
        { title: 'Обед', dataIndex: 'break_minutes', key: 'break', render: (v: number) => `${v} мин` },
    ]

    // Production calendar for current month
    const today = dayjs()
    const monthStart = today.startOf('month')
    const monthEnd = today.endOf('month')
    const holidayDates = new Set(holidays.map((h: any) => h.date))

    const calendarDays: { day: number; weekday: number; isHoliday: boolean; holidayName: string; isWeekend: boolean; isToday: boolean }[] = []
    let d = monthStart
    while (d.isBefore(monthEnd) || d.isSame(monthEnd, 'day')) {
        const dateStr = d.format('YYYY-MM-DD')
        const hol = holidays.find((h: any) => h.date === dateStr)
        calendarDays.push({
            day: d.date(),
            weekday: d.day(),
            isHoliday: holidayDates.has(dateStr),
            holidayName: hol ? hol.name : '',
            isWeekend: d.day() === 0 || d.day() === 6,
            isToday: d.isSame(today, 'day'),
        })
        d = d.add(1, 'day')
    }

    const workDaysInMonth = calendarDays.filter(d => !d.isWeekend && !d.isHoliday).length

    // Employees by schedule
    const bySchedule = schedules.map((s: any) => ({
        ...s,
        employeeCount: employees.filter((e: any) => (e.schedule_type || 'five_day') === s.type).length,
    }))

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><ScheduleOutlined /> Графики работы</h1>
                <p>Управление рабочим временем и производственный календарь</p>
            </div>

            <Tabs defaultActiveKey="schedules" items={[
                {
                    key: 'schedules',
                    label: <><ClockCircleOutlined /> Графики</>,
                    children: (
                        <>
                            <Table dataSource={bySchedule} columns={scheduleCols} rowKey="id" pagination={false}
                                expandable={{
                                    expandedRowRender: (record: any) => (
                                        <Descriptions size="small" column={3}>
                                            <Descriptions.Item label="Описание" span={2}>{record.description}</Descriptions.Item>
                                            <Descriptions.Item label="Сотрудников">{record.employeeCount}</Descriptions.Item>
                                        </Descriptions>
                                    ),
                                }}
                            />
                            <Row gutter={16} style={{ marginTop: 16 }}>
                                {bySchedule.map((s: any) => (
                                    <Col xs={12} md={6} key={s.id}>
                                        <Card size="small" style={{ borderLeft: `3px solid ${scheduleTypes[s.type]?.color === 'blue' ? '#3b82f6' : scheduleTypes[s.type]?.color === 'orange' ? '#f97316' : scheduleTypes[s.type]?.color === 'purple' ? '#8b5cf6' : '#22c55e'}` }}>
                                            <div style={{ fontSize: 12, color: '#999' }}>{scheduleTypes[s.type]?.label}</div>
                                            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.employeeCount}</div>
                                            <div style={{ fontSize: 12 }}>сотрудников</div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    ),
                },
                {
                    key: 'calendar',
                    label: <><CalendarOutlined /> Производственный календарь</>,
                    children: (
                        <Row gutter={[16, 16]}>
                            <Col xs={24} lg={16}>
                                <Card title={`${today.format('MMMM YYYY')} — Производственный календарь`} extra={<Tag color="blue">{workDaysInMonth} раб. дней</Tag>}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                                        {WEEKDAYS.map(w => <div key={w} style={{ textAlign: 'center', fontWeight: 700, padding: '6px 0', color: w === 'Сб' || w === 'Вс' ? '#f87171' : '#333' }}>{w}</div>)}
                                        {/* offset for first day */}
                                        {Array.from({ length: (monthStart.day() + 6) % 7 }).map((_, i) => <div key={`pad-${i}`} />)}
                                        {calendarDays.map(cd => (
                                            <div key={cd.day} title={cd.holidayName} style={{
                                                textAlign: 'center', padding: '8px 4px', borderRadius: 6,
                                                background: cd.isToday ? '#6366f1' : cd.isHoliday ? '#fef2f2' : cd.isWeekend ? '#f8fafc' : '#f0fdf4',
                                                color: cd.isToday ? '#fff' : cd.isHoliday ? '#dc2626' : cd.isWeekend ? '#94a3b8' : '#166534',
                                                fontWeight: cd.isToday || cd.isHoliday ? 700 : 400,
                                                border: cd.isHoliday ? '1px solid #fecaca' : '1px solid transparent',
                                                cursor: cd.holidayName ? 'help' : 'default',
                                            }}>
                                                {cd.day}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: '#666' }}>
                                        <span><Badge color="#f0fdf4" /> Рабочий</span>
                                        <span><Badge color="#f8fafc" /> Выходной</span>
                                        <span><Badge color="#fef2f2" /> Праздник</span>
                                        <span><Badge color="#6366f1" /> Сегодня</span>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} lg={8}>
                                <Card title="Праздники">
                                    <Timeline items={holidays.map((h: any) => ({
                                        color: dayjs(h.date).isBefore(today) ? 'gray' : 'red',
                                        children: <><Tag color="red">{dayjs(h.date).format('DD.MM')}</Tag> {h.name}</>,
                                    }))} />
                                </Card>
                            </Col>
                        </Row>
                    ),
                },
                {
                    key: 'employees',
                    label: <><TeamOutlined /> По сотрудникам</>,
                    children: (
                        <Table
                            dataSource={employees}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                { title: '№', dataIndex: 'employee_number', key: 'num', width: 90 },
                                { title: 'Сотрудник', key: 'name', render: (_: any, r: any) => `${r.last_name} ${r.first_name} ${r.middle_name}` },
                                { title: 'Должность', dataIndex: 'position', key: 'pos' },
                                { title: 'График', dataIndex: 'schedule_type', key: 'sched', render: (t: string) => <Tag color={scheduleTypes[t || 'five_day']?.color}>{scheduleTypes[t || 'five_day']?.label}</Tag> },
                                { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'orange'}>{s === 'active' ? 'Активен' : s}</Tag> },
                            ]}
                        />
                    ),
                },
            ]} />
        </div>
    )
}
