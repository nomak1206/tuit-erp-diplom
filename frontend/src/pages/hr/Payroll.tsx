import { Table, Tag, Button, Space } from 'antd'
import { CalculatorOutlined, CheckCircleOutlined } from '@ant-design/icons'

const payroll = [
    { id: 1, employee: 'Алексей Иванов', position: 'Руководитель IT', base: 12000000, bonuses: 2000000, deductions: 0, tax: 1680000, net: 12320000, is_paid: true },
    { id: 2, employee: 'Мария Петрова', position: 'Разработчик', base: 9000000, bonuses: 500000, deductions: 0, tax: 1140000, net: 8360000, is_paid: true },
    { id: 3, employee: 'Бобур Ахмедов', position: 'Рук. продаж', base: 11000000, bonuses: 3000000, deductions: 0, tax: 1680000, net: 12320000, is_paid: true },
    { id: 4, employee: 'Татьяна Козлова', position: 'Гл. бухгалтер', base: 10000000, bonuses: 0, deductions: 500000, tax: 1140000, net: 8360000, is_paid: true },
]

const fmt = (v: number) => v.toLocaleString('ru-RU')

const columns = [
    { title: 'Сотрудник', dataIndex: 'employee', key: 'emp', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Должность', dataIndex: 'position', key: 'pos' },
    { title: 'Оклад', dataIndex: 'base', key: 'base', render: fmt },
    { title: 'Надбавки', dataIndex: 'bonuses', key: 'bon', render: (v: number) => <span style={{ color: '#52c41a' }}>+{fmt(v)}</span> },
    { title: 'Удержания', dataIndex: 'deductions', key: 'ded', render: (v: number) => v > 0 ? <span style={{ color: '#ff4d4f' }}>-{fmt(v)}</span> : '—' },
    { title: 'НДФЛ (12%)', dataIndex: 'tax', key: 'tax', render: (v: number) => <span style={{ color: '#ff4d4f' }}>-{fmt(v)}</span> },
    { title: 'К выплате', dataIndex: 'net', key: 'net', render: (v: number) => <span style={{ fontWeight: 700, color: '#818cf8' }}>{fmt(v)}</span> },
    { title: 'Статус', dataIndex: 'is_paid', key: 'st', render: (v: boolean) => v ? <Tag icon={<CheckCircleOutlined />} color="success">Выплачено</Tag> : <Tag color="warning">Ожидает</Tag> },
]

export default function Payroll() {
    const totalNet = payroll.reduce((s, p) => s + p.net, 0)
    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><h1>Расчёт зарплаты</h1><p>Расчётная ведомость за январь 2026</p></div>
                <Button type="primary" icon={<CalculatorOutlined />}>Рассчитать за февраль</Button>
            </div>
            <Table columns={columns} dataSource={payroll} rowKey="id" pagination={false}
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6}><strong>ИТОГО к выплате:</strong></Table.Summary.Cell>
                        <Table.Summary.Cell index={6}><strong style={{ color: '#818cf8', fontSize: 15 }}>{fmt(totalNet)} UZS</strong></Table.Summary.Cell>
                        <Table.Summary.Cell index={7}></Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />
        </div>
    )
}
