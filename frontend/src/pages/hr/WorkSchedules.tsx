import { Card, Row, Col, Table, Tag, Spin, Descriptions, Timeline, Badge, Tabs } from 'antd'
import { ScheduleOutlined, ClockCircleOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons'
import { useSchedules, useHolidays, useEmployees } from '../../api/hooks'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

const WEEKDAYS = ['common.days_short.mon', 'common.days_short.tue', 'common.days_short.wed', 'common.days_short.thu', 'common.days_short.fri', 'common.days_short.sat', 'common.days_short.sun']

export default function WorkSchedules() {
    const { t } = useTranslation()
    const { data: schedules = [], isLoading } = useSchedules()
    const { data: holidays = [] } = useHolidays()
    const { data: employees = [] } = useEmployees()

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const scheduleTypes: Record<string, { label: string; color: string }> = {
        five_day: { label: 'hr.schedule_5_day', color: 'blue' },
        six_day: { label: 'hr.schedule_6_day', color: 'orange' },
        shift: { label: 'hr.schedule_shift', color: 'purple' },
        flexible: { label: 'hr.schedule_flex', color: 'green' },
    }

    const scheduleCols = [
        { title: t('common.name', 'Название'), dataIndex: 'name', key: 'name', render: (n: string, r: any) => <><strong>{n}</strong>{r.is_default && <Tag color="green" style={{ marginLeft: 8 }}>{t('common.default', 'По умолч.')}</Tag>}</> },
        { title: t('common.type', 'Тип'), dataIndex: 'type', key: 'type', render: (typeKey: string) => <Tag color={scheduleTypes[typeKey]?.color || 'default'}>{t(scheduleTypes[typeKey]?.label || typeKey)}</Tag> },
        { title: t('hr.work_days', 'Рабочие дни'), dataIndex: 'work_days', key: 'days', render: (days: number[]) => days.length > 0 ? days.map(d => <Tag key={d} style={{ marginBottom: 2 }}>{t(WEEKDAYS[d] || '')}</Tag>) : <Tag color="purple">{t('hr.by_schedule', 'По графику')}</Tag> },
        { title: t('hr.hours', 'Часы'), key: 'time', render: (_: any, r: any) => `${r.start_time} – ${r.end_time}` },
        { title: t('hr.h_per_day', 'Ч/день'), dataIndex: 'hours_per_day', key: 'hpd', render: (v: number) => `${v}ч` },
        { title: t('hr.h_per_week', 'Ч/неделю'), dataIndex: 'hours_per_week', key: 'hpw', render: (v: number) => <strong>{v}ч</strong> },
        { title: t('hr.break_mins', 'Обед'), dataIndex: 'break_minutes', key: 'break', render: (v: number) => `${v} ${t('common.min', 'мин')}` },
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
                <h1><ScheduleOutlined /> {t('schedules.title')}</h1>
                <p>{t('schedules.subtitle')}</p>
            </div>

            <Tabs defaultActiveKey="schedules" items={[
                {
                    key: 'schedules',
                    label: <><ClockCircleOutlined /> {t('hr.schedules_tab', 'Графики')}</>,
                    children: (
                        <>
                            <Table dataSource={bySchedule} columns={scheduleCols} rowKey="id" pagination={false}
                                expandable={{
                                    expandedRowRender: (record: any) => (
                                        <Descriptions size="small" column={3}>
                                            <Descriptions.Item label={t('common.description')} span={2}>{record.description}</Descriptions.Item>
                                            <Descriptions.Item label={t('employees.title')}>{record.employeeCount}</Descriptions.Item>
                                        </Descriptions>
                                    ),
                                }}
                            />
                            <Row gutter={16} style={{ marginTop: 16 }}>
                                {bySchedule.map((s: any) => (
                                    <Col xs={12} md={6} key={s.id}>
                                        <Card size="small" style={{ borderLeft: `3px solid ${scheduleTypes[s.type]?.color === 'blue' ? '#3b82f6' : scheduleTypes[s.type]?.color === 'orange' ? '#f97316' : scheduleTypes[s.type]?.color === 'purple' ? '#8b5cf6' : '#22c55e'}` }}>
                                            <div style={{ fontSize: 12, color: '#999' }}>{t(scheduleTypes[s.type]?.label || s.type)}</div>
                                            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.employeeCount}</div>
                                            <div style={{ fontSize: 12 }}>{t('dashboard.employees', 'сотрудников').toLowerCase()}</div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    ),
                },
                {
                    key: 'calendar',
                    label: <><CalendarOutlined /> {t('hr.production_calendar', 'Производственный календарь')}</>,
                    children: (
                        <Row gutter={[16, 16]}>
                            <Col xs={24} lg={16}>
                                <Card title={`${today.format('MMMM YYYY')} — ${t('hr.production_calendar', 'Производственный календарь')}`} extra={<Tag color="blue">{workDaysInMonth} {t('hr.work_days_count', 'раб. дней')}</Tag>}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                                        {WEEKDAYS.map(wKey => <div key={wKey} style={{ textAlign: 'center', fontWeight: 700, padding: '6px 0', color: wKey.includes('sat') || wKey.includes('sun') ? '#f87171' : '#333' }}>{t(wKey)}</div>)}
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
                                        <span><Badge color="#f0fdf4" /> {t('hr.work_day', 'Рабочий')}</span>
                                        <span><Badge color="#f8fafc" /> {t('hr.weekend', 'Выходной')}</span>
                                        <span><Badge color="#fef2f2" /> {t('hr.holiday', 'Праздник')}</span>
                                        <span><Badge color="#6366f1" /> {t('hr.today', 'Сегодня')}</span>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} lg={8}>
                                <Card title={t('schedules.holidays')}>
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
                    label: <><TeamOutlined /> {t('hr.by_employees', 'По сотрудникам')}</>,
                    children: (
                        <Table
                            dataSource={employees}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                { title: t('common.number', '№'), dataIndex: 'employee_number', key: 'num', width: 90 },
                                { title: t('hr.employee', 'Сотрудник'), key: 'name', render: (_: any, r: any) => `${r.last_name} ${r.first_name} ${r.middle_name}` },
                                { title: t('hr.position', 'Должность'), dataIndex: 'position', key: 'pos' },
                                { title: t('hr.schedule', 'График'), dataIndex: 'schedule_type', key: 'sched', render: (tKey: string) => <Tag color={scheduleTypes[tKey || 'five_day']?.color}>{t(scheduleTypes[tKey || 'five_day']?.label || tKey)}</Tag> },
                                { title: t('common.status', 'Статус'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'orange'}>{s === 'active' ? t('common.active', 'Активен') : s}</Tag> },
                            ]}
                        />
                    ),
                },
            ]} />
        </div>
    )
}
