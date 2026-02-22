import { useState, useMemo } from 'react'
import { Card, List, Tag, Badge, Space, Tabs, Avatar, Button, Switch, Row, Col, Statistic, Empty, Divider } from 'antd'
import { BellOutlined, CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, ClockCircleOutlined, CalendarOutlined, DollarOutlined, TeamOutlined, InboxOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useInvoices, useLeaves, useStockReport } from '../../api/hooks'
import { useTranslation } from 'react-i18next'

interface Notif {
    id: string
    type: 'warning' | 'info' | 'success' | 'error'
    title: string
    description: string
    module: string
    link: string
    time: string
    read: boolean
    icon: React.ReactNode
}

export default function NotificationCenter() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: invoices = [] } = useInvoices()
    const { data: leaves = [] } = useLeaves()
    const { data: stockReport } = useStockReport()
    const [showRead, setShowRead] = useState(false)
    const [tab, setTab] = useState('all')

    const notifications = useMemo<Notif[]>(() => {
        const notifs: Notif[] = []

        const overdue = invoices.filter((inv: any) => inv.status === 'sent' || inv.status === 'overdue')
        overdue.forEach((inv: any) => {
            notifs.push({
                id: `inv-${inv.id}`, type: 'warning',
                title: `${t('accounting.invoices_title')} №${inv.invoice_number || inv.id}`,
                description: `${inv.client_name || t('accounting.client_name')} — ${(inv.total_amount || 0).toLocaleString('ru-RU')} UZS`,
                module: 'accounting', link: '/accounting/invoices', time: inv.issue_date || '', read: false,
                icon: <DollarOutlined style={{ color: '#f97316' }} />,
            })
        })

        const pendingLeaves = leaves.filter((l: any) => l.status === 'pending')
        pendingLeaves.forEach((l: any) => {
            notifs.push({
                id: `leave-${l.id}`, type: 'info',
                title: `${t('vacations.title')}: ${l.employee_name || t('payroll.employee')}`,
                description: `${l.start_date} – ${l.end_date}`,
                module: 'hr', link: '/hr/leaves', time: l.created_at || l.start_date || '', read: false,
                icon: <CalendarOutlined style={{ color: '#6366f1' }} />,
            })
        })

        const lowStock = (stockReport?.items || []).filter((s: any) => s.quantity < 10)
        lowStock.forEach((s: any) => {
            notifs.push({
                id: `stock-${s.product_id}`, type: 'error',
                title: `${t('warehouse.low_stock')}: ${s.product_name || t('warehouse.product_name')}`,
                description: `${s.quantity} ${t('warehouse.unit')}`,
                module: 'warehouse', link: '/warehouse/products', time: '', read: false,
                icon: <InboxOutlined style={{ color: '#f43f5e' }} />,
            })
        })

        notifs.push({
            id: 'sys-1', type: 'success',
            title: `${t('accounting.month_close_title')}: 2026-01`,
            description: t('accounting.journal_title'),
            module: 'accounting', link: '/accounting/month-close', time: '2026-02-01', read: true,
            icon: <CheckCircleOutlined style={{ color: '#22c55e' }} />,
        })

        return notifs
    }, [invoices, leaves, stockReport, t])

    const filtered = notifications.filter(n => {
        if (!showRead && n.read) return false
        if (tab === 'all') return true
        return n.module === tab
    })

    const unreadCount = notifications.filter(n => !n.read).length

    const moduleLabel = (m: string) => m === 'accounting' ? t('layout.accounting') : m === 'hr' ? t('layout.hr') : m === 'warehouse' ? t('layout.warehouse') : m

    return (
        <div className="fade-in">
            <div className="page-header"><h1><BellOutlined /> {t('notifications_page.title')}</h1><p>{t('notifications_page.subtitle')}</p></div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={8}><Card><Statistic title={t('notifications_page.unread', 'O\'qilmagan')} value={unreadCount} prefix={<Badge dot={unreadCount > 0}><BellOutlined style={{ color: '#6366f1' }} /></Badge>} valueStyle={{ color: unreadCount > 0 ? '#f97316' : '#22c55e' }} /></Card></Col>
                <Col xs={8}><Card><Statistic title={t('notifications_page.total_notifications', 'Barcha xabarlar')} value={notifications.length} prefix={<InfoCircleOutlined style={{ color: '#8b5cf6' }} />} /></Card></Col>
                <Col xs={8}><Card><Statistic title={t('notifications_page.modules_with_events', 'Voqeali modullar')} value={new Set(notifications.map(n => n.module)).size} prefix={<SettingOutlined style={{ color: '#06b6d4' }} />} /></Card></Col>
            </Row>

            <Card title={<Space><BellOutlined /> {t('layout.notifications')} <Tag color="blue">{unreadCount}</Tag></Space>} extra={
                <Space>
                    <Switch checked={showRead} onChange={setShowRead} size="small" />
                </Space>
            }>
                <Tabs activeKey={tab} onChange={setTab} items={[
                    { key: 'all', label: `${t('common.all_notifications', 'Barchasi')} (${notifications.filter(n => showRead || !n.read).length})` },
                    { key: 'accounting', label: <Space><DollarOutlined />{t('layout.accounting')}</Space> },
                    { key: 'hr', label: <Space><TeamOutlined />HR</Space> },
                    { key: 'warehouse', label: <Space><InboxOutlined />{t('layout.warehouse')}</Space> },
                ]} />

                {filtered.length === 0 ? (
                    <Empty description={t('notifications_page.no_notifications')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    <List
                        dataSource={filtered}
                        renderItem={(item) => (
                            <List.Item
                                style={{ cursor: 'pointer', background: item.read ? 'transparent' : 'rgba(99,102,241,0.06)', borderRadius: 10, padding: '14px 18px', marginBottom: 6, transition: 'all 0.2s' }}
                                onClick={() => navigate(item.link)}
                                extra={<Tag color={item.type === 'warning' ? 'orange' : item.type === 'error' ? 'red' : item.type === 'success' ? 'green' : 'blue'}>{moduleLabel(item.module)}</Tag>}
                            >
                                <List.Item.Meta
                                    avatar={<Badge dot={!item.read}><Avatar style={{ background: 'rgba(99,102,241,0.15)' }} icon={item.icon} /></Badge>}
                                    title={<span style={{ fontWeight: item.read ? 400 : 600 }}>{item.title}</span>}
                                    description={<><div style={{ color: '#94a3b8' }}>{item.description}</div>{item.time && <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}><ClockCircleOutlined /> {item.time}</div>}</>}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    )
}
