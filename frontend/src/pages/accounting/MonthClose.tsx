import { useState } from 'react'
import { Card, Steps, Button, Row, Col, Statistic, Table, Tag, message, Spin, Result, Select, Space, Alert, Divider, Progress } from 'antd'
import { CheckCircleOutlined, LockOutlined, CalculatorOutlined, DollarOutlined, AuditOutlined, CalendarOutlined, LoadingOutlined } from '@ant-design/icons'
import { useCloseMonth, useClosedMonths, useFinancialSummary, useJournalEntries } from '../../api/hooks'
import { useTranslation } from 'react-i18next'

const months = [
    { value: '2026-01', label: '01/2026' }, { value: '2026-02', label: '02/2026' },
    { value: '2026-03', label: '03/2026' }, { value: '2026-04', label: '04/2026' },
    { value: '2026-05', label: '05/2026' }, { value: '2026-06', label: '06/2026' },
    { value: '2026-07', label: '07/2026' }, { value: '2026-08', label: '08/2026' },
    { value: '2026-09', label: '09/2026' }, { value: '2026-10', label: '10/2026' },
    { value: '2026-11', label: '11/2026' }, { value: '2026-12', label: '12/2026' },
]

const fmt = (v: number) => v.toLocaleString('ru-RU')

export default function MonthClose() {
    const { t } = useTranslation()
    const [currentStep, setCurrentStep] = useState(0)
    const [period, setPeriod] = useState('2026-02')
    const [closeResult, setCloseResult] = useState<any>(null)
    const { data: closedMonths = [], isLoading: cmLoading } = useClosedMonths()
    const { data: summary, isLoading: sumLoading } = useFinancialSummary()
    const { data: journal = [] } = useJournalEntries()
    const closeMonth = useCloseMonth()

    const isClosed = closedMonths.some((c: any) => c.period === period)

    const handleClose = async () => {
        try {
            const result = await closeMonth.mutateAsync({ period })
            setCloseResult(result)
            setCurrentStep(3)
            message.success(t('common.saved'))
        } catch (err: any) {
            message.error(err?.response?.data?.detail || t('common.error'))
        }
    }

    if (cmLoading || sumLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

    const steps = [
        {
            title: t('accounting.period'),
            icon: <CalendarOutlined />,
            content: (
                <Card bordered={false}>
                    <h3 style={{ marginBottom: 16 }}>{t('accounting.period')}</h3>
                    <Select options={months} value={period} onChange={setPeriod} style={{ width: 260 }} size="large" />
                    {isClosed && <Alert type="warning" message={`${period} — ${t('common.completed')}`} showIcon style={{ marginTop: 16 }} />}
                    <Divider />
                    <Table
                        dataSource={closedMonths} rowKey="period" size="small" pagination={false}
                        columns={[
                            { title: t('accounting.period'), dataIndex: 'period', render: (v: string) => <Tag icon={<LockOutlined />} color="green">{months.find(m => m.value === v)?.label || v}</Tag> },
                            { title: t('common.date'), dataIndex: 'closed_at', render: (v: string) => new Date(v).toLocaleString('ru-RU') },
                            { title: t('accounting.entries_created'), dataIndex: 'entries_count' },
                            { title: t('accounting.depreciation'), dataIndex: 'depreciation', render: (v: number) => `${fmt(v || 0)} UZS` },
                            { title: t('accounting.payroll_fund'), dataIndex: 'salary', render: (v: number) => `${fmt(v || 0)} UZS` },
                        ]}
                    />
                </Card>
            ),
        },
        {
            title: t('accounting.depreciation'),
            icon: <CalculatorOutlined />,
            content: (
                <Card bordered={false}>
                    <h3 style={{ marginBottom: 16 }}>{t('accounting.depreciation')}</h3>
                    <Row gutter={[16, 16]}>
                        <Col span={8}><Card><Statistic title={t('accounting.asset_cost')} value={summary?.total_assets || 0} formatter={(v: any) => fmt(Number(v))} suffix="UZS" /></Card></Col>
                        <Col span={8}><Card><Statistic title={t('accounting.accumulated_wear')} value={0} formatter={(v: any) => fmt(Number(v))} suffix="UZS" /></Card></Col>
                        <Col span={8}><Card><Statistic title={t('accounting.calc_depreciation')} value={Math.round((summary?.total_assets || 0) * 0.02)} formatter={(v: any) => fmt(Number(v))} suffix="UZS" valueStyle={{ color: '#f97316' }} /></Card></Col>
                    </Row>
                </Card>
            ),
        },
        {
            title: t('payroll.title'),
            icon: <DollarOutlined />,
            content: (
                <Card bordered={false}>
                    <h3 style={{ marginBottom: 16 }}>{t('payroll.title')}</h3>
                    <Row gutter={[16, 16]}>
                        <Col span={8}><Card><Statistic title={t('accounting.payroll_fund')} value={85000000} formatter={(v: any) => fmt(Number(v))} suffix="UZS" /></Card></Col>
                        <Col span={8}><Card><Statistic title={t('payroll.ndfl_inps')} value={Math.round(85000000 * 0.13)} formatter={(v: any) => fmt(Number(v))} suffix="UZS" valueStyle={{ color: '#f43f5e' }} /></Card></Col>
                        <Col span={8}><Card><Statistic title={t('accounting.payroll_net')} value={Math.round(85000000 * 0.87)} formatter={(v: any) => fmt(Number(v))} suffix="UZS" valueStyle={{ color: '#22c55e' }} /></Card></Col>
                    </Row>
                    <Divider />
                    <Button type="primary" size="large" icon={<LockOutlined />} onClick={handleClose} loading={closeMonth.isPending} disabled={isClosed} danger>
                        {t('accounting.month_close_title')} — {months.find(m => m.value === period)?.label || period}
                    </Button>
                </Card>
            ),
        },
        {
            title: t('common.completed'),
            icon: <CheckCircleOutlined />,
            content: (
                <Card bordered={false}>
                    <Result
                        status="success"
                        title={`${t('accounting.month_close_title')} — ${months.find(m => m.value === period)?.label || period}`}
                        subTitle={closeResult ? `${t('accounting.entries_created')}: ${closeResult.entries_created}` : ''}
                        extra={[<Button type="primary" key="journal" onClick={() => setCurrentStep(0)}>{t('common.next')}</Button>]}
                    />
                    {closeResult?.details && (
                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                            <Col span={8}><Card><Statistic title={t('accounting.depreciation')} value={closeResult.details.depreciation || 0} formatter={(v: any) => fmt(Number(v))} suffix="UZS" prefix={<AuditOutlined />} /></Card></Col>
                            <Col span={8}><Card><Statistic title={t('accounting.payroll_fund')} value={closeResult.details.salary || 0} formatter={(v: any) => fmt(Number(v))} suffix="UZS" prefix={<DollarOutlined />} /></Card></Col>
                            <Col span={8}><Card><Statistic title={t('accounting.entries_created')} value={closeResult.entries_created || 0} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#22c55e' }} /></Card></Col>
                        </Row>
                    )}
                </Card>
            ),
        },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{t('accounting.month_close_title')}</h1><p>{t('accounting.subtitle')}</p></div>
            <Card bordered={false} style={{ marginBottom: 16 }}>
                <Steps current={currentStep} items={steps.map(s => ({ title: s.title, icon: currentStep > steps.indexOf(s) ? <CheckCircleOutlined style={{ color: '#22c55e' }} /> : s.icon }))} />
            </Card>
            {steps[currentStep].content}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                {currentStep > 0 && currentStep < 3 && <Button onClick={() => setCurrentStep(currentStep - 1)}>{t('common.back')}</Button>}
                {currentStep < 2 && <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)} disabled={isClosed && currentStep === 0} style={{ marginLeft: 'auto' }}>{t('common.next')}</Button>}
            </div>
        </div>
    )
}
