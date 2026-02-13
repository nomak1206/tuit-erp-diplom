import { Table, Tag, Card } from 'antd'

const days = Array.from({ length: 28 }, (_, i) => i + 1)
const employees = [
    { id: 1, name: 'Алексей Иванов', dept: 'IT' },
    { id: 2, name: 'Мария Петрова', dept: 'IT' },
    { id: 3, name: 'Бобур Ахмедов', dept: 'Продажи' },
    { id: 4, name: 'Гулнора Маматова', dept: 'Продажи' },
    { id: 5, name: 'Татьяна Козлова', dept: 'Бухгалтерия' },
]

const getStatus = (empId: number, day: number) => {
    if (day > 12) return null
    if (empId === 2 && day >= 8 && day <= 10) return 'Б'
    if ([6, 7, 13, 14, 20, 21, 27, 28].includes(day)) return 'В'
    return '8'
}

const columns = [
    { title: 'Сотрудник', dataIndex: 'name', key: 'name', fixed: 'left' as const, width: 180, render: (v: string) => <span style={{ fontWeight: 600, fontSize: 12 }}>{v}</span> },
    { title: 'Отдел', dataIndex: 'dept', key: 'dept', fixed: 'left' as const, width: 100, render: (v: string) => <Tag color="blue" style={{ fontSize: 10 }}>{v}</Tag> },
    ...days.map(d => ({
        title: String(d),
        key: `d${d}`,
        width: 36,
        align: 'center' as const,
        render: (_: any, record: any) => {
            const s = getStatus(record.id, d)
            if (!s) return <span style={{ color: '#2d2d4a' }}>—</span>
            const color = s === '8' ? '#52c41a' : s === 'В' ? '#64748b' : s === 'Б' ? '#ff4d4f' : '#faad14'
            return <span style={{ color, fontSize: 11, fontWeight: 600 }}>{s}</span>
        }
    })),
]

export default function Timesheet() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Табель учёта рабочего времени</h1><p>Февраль 2026</p></div>
            <Card bordered={false} style={{ overflow: 'auto' }}>
                <Table columns={columns} dataSource={employees} rowKey="id" pagination={false} scroll={{ x: 1400 }} size="small"
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={2}><strong>Итого часов</strong></Table.Summary.Cell>
                            {days.map((d, i) => (
                                <Table.Summary.Cell key={i} index={i + 2} align="center">
                                    <span style={{ fontSize: 10, color: '#64748b' }}>{d <= 12 && ![6, 7, 13, 14].includes(d) ? '40' : ''}</span>
                                </Table.Summary.Cell>
                            ))}
                        </Table.Summary.Row>
                    )}
                />
            </Card>
            <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8' }}>
                <span><span style={{ color: '#52c41a', fontWeight: 600 }}>8</span> — рабочий день</span>
                <span><span style={{ color: '#64748b', fontWeight: 600 }}>В</span> — выходной</span>
                <span><span style={{ color: '#ff4d4f', fontWeight: 600 }}>Б</span> — больничный</span>
            </div>
        </div>
    )
}
