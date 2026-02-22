import { useState } from 'react'
import { Card, Row, Col, Table, Tag, Spin, Statistic, Button, DatePicker, Space, Modal, Descriptions, message, Divider } from 'antd'
import { WalletOutlined, CalculatorOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons'
import { usePayroll, useCalculatePayrollAll } from '../../api/hooks'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

const fmt = (v: number) => v?.toLocaleString('ru-RU') + ' UZS'

export default function Payroll() {
    const { t } = useTranslation()
    const { data: payroll = [], isLoading } = usePayroll()
    const calcAll = useCalculatePayrollAll()
    const [selectedRow, setSelectedRow] = useState<any>(null)
    const [period, setPeriod] = useState<dayjs.Dayjs | null>(null)

    const handleMassCalc = () => {
        if (!period) { message.warning(t('payroll.period')); return }
        const start = period.startOf('month').format('YYYY-MM-DD')
        const end = period.endOf('month').format('YYYY-MM-DD')
        calcAll.mutate({ period_start: start, period_end: end }, {
            onSuccess: (data: any) => message.success(t('payroll.calculated_success')),
            onError: () => message.error(t('common.error')),
        })
    }

    const columns = [
        { title: t('payroll.employee'), dataIndex: 'employee_name', key: 'name', width: 160 },
        { title: t('payroll.period'), dataIndex: 'period', key: 'period', width: 90 },
        { title: t('timesheet.work_days'), dataIndex: 'worked_days', key: 'wd', width: 90, render: (v: number, r: any) => `${v}/${r.total_days}` },
        { title: t('employees.salary'), dataIndex: 'base_salary', key: 'base', render: (v: number) => fmt(v) },
        { title: t('payroll.deductions'), dataIndex: 'allowances', key: 'allow', render: (v: number) => v ? fmt(v) : '—' },
        { title: t('payroll.gross_salary'), dataIndex: 'gross', key: 'gross', render: (v: number) => <strong>{fmt(v)}</strong> },
        { title: t('payroll.ndfl') + ' 12%', dataIndex: 'ndfl', key: 'ndfl', render: (v: number) => <span style={{ color: '#ef4444' }}>−{fmt(v)}</span> },
        { title: t('payroll.inps') + ' 1%', dataIndex: 'inps', key: 'inps', render: (v: number) => <span style={{ color: '#f97316' }}>−{fmt(v)}</span> },
        { title: t('payroll.net_salary'), dataIndex: 'net_salary', key: 'net', render: (v: number) => <strong style={{ color: '#22c55e' }}>{fmt(v)}</strong> },
        { title: t('payroll.esn'), dataIndex: 'esn_employer', key: 'esn', render: (v: number) => <span style={{ color: '#64748b' }}>{fmt(v)}</span> },
        { title: t('common.status'), dataIndex: 'is_paid', key: 'paid', render: (v: boolean) => <Tag color={v ? 'green' : 'orange'}>{v ? t('accounting.invoice_statuses.paid') : t('common.pending')}</Tag> },
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
                <h1><WalletOutlined /> {t('payroll.title')}</h1>
                <p>{t('payroll.subtitle')}</p>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} md={6}><Card><Statistic title={t('payroll.gross')} value={totalGross} suffix="UZS" valueStyle={{ fontSize: 16 }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title={t('payroll.ndfl_inps')} value={totalNdfl + totalInps} suffix="UZS" valueStyle={{ fontSize: 16, color: '#ef4444' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title={t('payroll.net_pay')} value={totalNet} suffix="UZS" valueStyle={{ fontSize: 16, color: '#22c55e' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
                <Col xs={12} md={6}><Card><Statistic title={t('payroll.esn')} value={totalEsn} suffix="UZS" valueStyle={{ fontSize: 16, color: '#64748b' }} formatter={(v) => Number(v).toLocaleString('ru-RU')} /></Card></Col>
            </Row>

            <Card
                title={<><CalculatorOutlined /> {t('payroll.title')}</>}
                extra={
                    <Space>
                        <DatePicker picker="month" onChange={v => setPeriod(v)} placeholder={t('payroll.period')} format="MMMM YYYY" />
                        <Button type="primary" icon={<TeamOutlined />} onClick={handleMassCalc} loading={calcAll.isPending}>
                            {t('payroll.run_payroll')}
                        </Button>
                    </Space>
                }
            >
                <Table
                    dataSource={payroll} columns={columns} rowKey="id" pagination={false} size="small"
                    scroll={{ x: 1200 }}
                    onRow={(record) => ({ onClick: () => setSelectedRow(record), style: { cursor: 'pointer' } })}
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0}><strong>{t('common.total')}</strong></Table.Summary.Cell>
                                <Table.Summary.Cell index={1} /><Table.Summary.Cell index={2} /><Table.Summary.Cell index={3} /><Table.Summary.Cell index={4} />
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

            <Modal open={!!selectedRow} onCancel={() => setSelectedRow(null)} footer={null} title={t('payroll.title')} width={520}>
                {selectedRow && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label={t('payroll.employee')}>{selectedRow.employee_name}</Descriptions.Item>
                        <Descriptions.Item label={t('payroll.period')}>{selectedRow.period_start} — {selectedRow.period_end}</Descriptions.Item>
                        <Descriptions.Item label={t('timesheet.work_days')}>{selectedRow.worked_days} / {selectedRow.total_days}</Descriptions.Item>
                        <Divider style={{ margin: '8px 0' }} />
                        <Descriptions.Item label={t('employees.salary')}>{fmt(selectedRow.base_salary)}</Descriptions.Item>
                        <Descriptions.Item label={t('payroll.gross')}><strong>{fmt(selectedRow.gross)}</strong></Descriptions.Item>
                        <Divider style={{ margin: '8px 0' }} />
                        <Descriptions.Item label={t('payroll.ndfl') + ' (12%)'}><span style={{ color: '#ef4444' }}>−{fmt(selectedRow.ndfl)}</span></Descriptions.Item>
                        <Descriptions.Item label={t('payroll.inps') + ' (1%)'}><span style={{ color: '#f97316' }}>−{fmt(selectedRow.inps)}</span></Descriptions.Item>
                        <Divider style={{ margin: '8px 0' }} />
                        <Descriptions.Item label={t('payroll.net_salary')}><span style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{fmt(selectedRow.net_salary)}</span></Descriptions.Item>
                        <Descriptions.Item label={t('payroll.esn')}>{fmt(selectedRow.esn_employer)}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    )
}
