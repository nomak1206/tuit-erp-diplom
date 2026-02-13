import { useState } from 'react'
import { Card, Row, Col, Table, Tag, Spin, Statistic, Button, DatePicker, Space, Modal, Descriptions, message, Divider } from 'antd'
import { WalletOutlined, CalculatorOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons'
import { usePayroll, useCalculatePayrollAll } from '../../api/hooks'
import dayjs from 'dayjs'

const fmt = (v: number) => v?.toLocaleString('ru-RU') + ' сўм'

export default function Payroll() {
    const { data: payroll = [], isLoading } = usePayroll()
    const calcAll = useCalculatePayrollAll()
    const [selectedRow, setSelectedRow] = useState<any>(null)
    const [period, setPeriod] = useState<dayjs.Dayjs | null>(null)

    const handleMassCalc = () => {
        if (!period) {
            message.warning('Выберите период')
            return
        }
        const start = period.startOf('month').format('YYYY-MM-DD')
        const end = period.endOf('month').format('YYYY-MM-DD')
        calcAll.mutate({ period_start: start, period_end: end }, {
            onSuccess: (data) => {
                message.success(`Рассчитано ${data.count} сотрудников. Итого к выплате: ${fmt(data.totals.net)}`)
            },
            onError: () => message.error('Ошибка расчёта'),
        })
    }

    const columns = [
        { title: 'Сотрудник', dataIndex: 'employee_name', key: 'name', width: 160 },
        { title: 'Период', dataIndex: 'period', key: 'period', width: 90 },
        { title: 'Отраб. дней', dataIndex: 'worked_days', key: 'wd', width: 90, render: (v: number, r: any) => `${v}/${r.total_days}` },
        { title: 'Оклад', dataIndex: 'base_salary', key: 'base', render: (v: number) => fmt(v) },
        { title: 'Надбавки', dataIndex: 'allowances', key: 'allow', render: (v: number) => v ? fmt(v) : '—' },
        { title: 'Начислено', dataIndex: 'gross', key: 'gross', render: (v: number) => <strong>{fmt(v)}</strong> },
        { title: 'НДФЛ 12%', dataIndex: 'ndfl', key: 'ndfl', render: (v: number) => <span style={{ color: '#ef4444' }}>−{fmt(v)}</span> },
        { title: 'ИНПС 1%', dataIndex: 'inps', key: 'inps', render: (v: number) => <span style={{ color: '#f97316' }}>−{fmt(v)}</span> },
        { title: 'К выплате', dataIndex: 'net_salary', key: 'net', render: (v: number) => <strong style={{ color: '#22c55e' }}>{fmt(v)}</strong> },
        { title: 'ЕСН 12%', dataIndex: 'esn_employer', key: 'esn', render: (v: number) => <span style={{ color: '#64748b' }}>{fmt(v)}</span> },
        { title: 'Статус', dataIndex: 'is_paid', key: 'paid', render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? 'Оплачено' : 'Ожидание'}</Tag> },
    ]

    if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const totalGross = payroll.reduce((s: number, p: any) => s + (p.gross || 0), 0)
    const totalNdfl = payroll.reduce((s: number, p: any) => s + (p.ndfl || 0), 0)
    const totalInps = payroll.reduce((s: number, p: any) => s + (p.inps || 0), 0)
    const totalNet = payroll.reduce((s: number, p: any) => s + (p.net_salary || 0), 0)
    const totalEsn = payroll.reduce((s: number, p: any) => s + (p.esn_employer || 0), 0)

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><WalletOutlined /> Зарплата</h1>
                <p>Расчёт заработной платы по законодательству РУз (НДФЛ 12%, ИНПС 1%, ЕСН 12%)</p>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} md={6}>
                    <Card><Statistic title="Начислено (gross)" value={totalGross} suffix="сўм" valueStyle={{ fontSize: 16 }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card><Statistic title="НДФЛ + ИНПС" value={totalNdfl + totalInps} suffix="сўм" valueStyle={{ fontSize: 16, color: '#ef4444' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card><Statistic title="К выплате (net)" value={totalNet} suffix="сўм" valueStyle={{ fontSize: 16, color: '#22c55e' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card><Statistic title="ЕСН (от работодателя)" value={totalEsn} suffix="сўм" valueStyle={{ fontSize: 16, color: '#64748b' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card>
                </Col>
            </Row>

            <Card
                title={<><CalculatorOutlined /> Расчётная ведомость</>}
                extra={
                    <Space>
                        <DatePicker picker="month" onChange={v => setPeriod(v)} placeholder="Период" format="MMMM YYYY" />
                        <Button type="primary" icon={<TeamOutlined />} onClick={handleMassCalc} loading={calcAll.isPending}>
                            Рассчитать всех
                        </Button>
                    </Space>
                }
            >
                <Table
                    dataSource={payroll}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: 1200 }}
                    onRow={(record) => ({ onClick: () => setSelectedRow(record), style: { cursor: 'pointer' } })}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0}><strong>ИТОГО</strong></Table.Summary.Cell>
                                <Table.Summary.Cell index={1} />
                                <Table.Summary.Cell index={2} />
                                <Table.Summary.Cell index={3} />
                                <Table.Summary.Cell index={4} />
                                <Table.Summary.Cell index={5}><strong>{fmt(totalGross)}</strong></Table.Summary.Cell>
                                <Table.Summary.Cell index={6}><span style={{ color: '#ef4444' }}>−{fmt(totalNdfl)}</span></Table.Summary.Cell>
                                <Table.Summary.Cell index={7}><span style={{ color: '#f97316' }}>−{fmt(totalInps)}</span></Table.Summary.Cell>
                                <Table.Summary.Cell index={8}><strong style={{ color: '#22c55e' }}>{fmt(totalNet)}</strong></Table.Summary.Cell>
                                <Table.Summary.Cell index={9}><span style={{ color: '#64748b' }}>{fmt(totalEsn)}</span></Table.Summary.Cell>
                                <Table.Summary.Cell index={10} />
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Card>

            <Modal
                open={!!selectedRow}
                onCancel={() => setSelectedRow(null)}
                footer={null}
                title="Расчётный лист"
                width={520}
            >
                {selectedRow && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Сотрудник">{selectedRow.employee_name}</Descriptions.Item>
                        <Descriptions.Item label="Период">{selectedRow.period_start} — {selectedRow.period_end}</Descriptions.Item>
                        <Descriptions.Item label="Отработано">{selectedRow.worked_days} из {selectedRow.total_days} дней</Descriptions.Item>
                        <Divider style={{ margin: '8px 0' }} />
                        <Descriptions.Item label="Оклад">{fmt(selectedRow.base_salary)}</Descriptions.Item>
                        <Descriptions.Item label="Надбавки">{fmt(selectedRow.allowances)}</Descriptions.Item>
                        <Descriptions.Item label="Начислено (gross)"><strong>{fmt(selectedRow.gross)}</strong></Descriptions.Item>
                        <Divider style={{ margin: '8px 0' }} />
                        <Descriptions.Item label="НДФЛ (12%)"><span style={{ color: '#ef4444' }}>−{fmt(selectedRow.ndfl)}</span></Descriptions.Item>
                        <Descriptions.Item label="ИНПС (1%)"><span style={{ color: '#f97316' }}>−{fmt(selectedRow.inps)}</span></Descriptions.Item>
                        <Descriptions.Item label="Удержания"><span style={{ color: '#ef4444' }}>−{fmt(selectedRow.deductions)}</span></Descriptions.Item>
                        <Divider style={{ margin: '8px 0' }} />
                        <Descriptions.Item label="К выплате"><span style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{fmt(selectedRow.net_salary)}</span></Descriptions.Item>
                        <Descriptions.Item label="ЕСН (работодатель)">{fmt(selectedRow.esn_employer)}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    )
}
