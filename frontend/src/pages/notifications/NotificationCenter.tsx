import { useState, useMemo } from 'react'
import { Card, List, Tag, Badge, Space, Tabs, Avatar, Button, Switch, Row, Col, Statistic, Empty, Divider } from 'antd'
import { BellOutlined, CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, ClockCircleOutlined, CalendarOutlined, DollarOutlined, TeamOutlined, InboxOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useNotifications, useMarkNotificationRead } from '../../api/hooks'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

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
    const { data: notifications = [] } = useNotifications()
    const markRead = useMarkNotificationRead()
    const [showRead, setShowRead] = useState(false)
    const [tab, setTab] = useState('all')

    const getIcon = (type: string, module: string) => {
        const m = (module || '').toLowerCase()
        if (type === 'success') return <CheckCircleOutlined style={{ color: '#22c55e' }} />
        if (m === 'crm') return <TeamOutlined style={{ color: '#8b5cf6' }} />
        if (m.includes('accounting') || m.includes('buxgalteriya')) return <DollarOutlined style={{ color: '#f97316' }} />
        if (m === 'hr') return <CalendarOutlined style={{ color: '#6366f1' }} />
        if (m.includes('warehouse') || m.includes('ombor')) return <InboxOutlined style={{ color: '#f43f5e' }} />
        if (m.includes('document') || m.includes('hujjat')) return <FileTextOutlined style={{ color: '#06b6d4' }} />
        if (m.includes('project')) return <InfoCircleOutlined style={{ color: '#10b981' }} />
        return <InfoCircleOutlined style={{ color: '#6366f1' }} />
    }

    const filtered = notifications.filter((n: any) => {
        if (!showRead && n.is_read) return false
        if (tab === 'all') return true
        return n.module === tab
    })

    const unreadCount = notifications.filter((n: any) => !n.is_read).length

    const moduleLabel = (m: string) => {
        const lower = (m || '').toLowerCase()
        if (lower === 'accounting') return t('layout.accounting')
        if (lower === 'hr') return 'HR'
        if (lower === 'warehouse') return t('layout.warehouse')
        if (lower === 'crm') return 'CRM'
        if (lower === 'projects') return t('layout.projects', 'Проекты')
        if (lower === 'documents') return t('layout.documents', 'Документы')
        return m
    }

    return (
        <div className="fade-in">
            <div className="page-header"><h1><BellOutlined /> {t('notifications_page.title')}</h1><p>{t('notifications_page.subtitle')}</p></div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={8}><Card><Statistic title={t('notifications_page.unread', 'O\'qilmagan')} value={unreadCount} prefix={<Badge dot={unreadCount > 0}><BellOutlined style={{ color: '#6366f1' }} /></Badge>} valueStyle={{ color: unreadCount > 0 ? '#f97316' : '#22c55e' }} /></Card></Col>
                <Col xs={8}><Card><Statistic title={t('notifications_page.total_notifications', 'Barcha xabarlar')} value={notifications.length} prefix={<InfoCircleOutlined style={{ color: '#8b5cf6' }} />} /></Card></Col>
                <Col xs={8}><Card><Statistic title={t('notifications_page.modules_with_events', 'Voqeali modullar')} value={new Set(notifications.map((n: any) => n.module)).size} prefix={<SettingOutlined style={{ color: '#06b6d4' }} />} /></Card></Col>
            </Row>

            <Card title={<Space><BellOutlined /> {t('layout.notifications')} <Tag color="blue">{unreadCount}</Tag></Space>} extra={
                <Space>
                    <Switch checked={showRead} onChange={setShowRead} size="small" />
                </Space>
            }>
                <Tabs activeKey={tab} onChange={setTab} items={[
                    { key: 'all', label: `${t('common.all_notifications', 'Barchasi')} (${notifications.filter((n: any) => showRead || !n.is_read).length})` },
                    { key: 'crm', label: <Space><TeamOutlined />CRM</Space> },
                    { key: 'accounting', label: <Space><DollarOutlined />{t('layout.accounting')}</Space> },
                    { key: 'hr', label: <Space><CalendarOutlined />HR</Space> },
                    { key: 'warehouse', label: <Space><InboxOutlined />{t('layout.warehouse')}</Space> },
                    { key: 'projects', label: <Space><InfoCircleOutlined />{t('layout.projects', 'Проекты')}</Space> },
                    { key: 'documents', label: <Space><FileTextOutlined />{t('layout.documents', 'Документы')}</Space> },
                ]} />

                {filtered.length === 0 ? (
                    <Empty description={t('notifications_page.no_notifications')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    <List
                        dataSource={filtered}
                        renderItem={(item: any) => (
                            <List.Item
                                style={{ cursor: 'pointer', background: item.is_read ? 'transparent' : 'rgba(99,102,241,0.06)', borderRadius: 10, padding: '14px 18px', marginBottom: 6, transition: 'all 0.2s' }}
                                onClick={() => {
                                    if (!item.is_read) markRead.mutate(item.id);
                                    if (item.link) navigate(item.link);
                                }}
                                extra={<Tag color={item.type === 'warning' ? 'orange' : item.type === 'error' ? 'red' : item.type === 'success' ? 'green' : 'blue'}>{moduleLabel(item.module)}</Tag>}
                            >
                                <List.Item.Meta
                                    avatar={<Badge dot={!item.is_read}><Avatar style={{ background: 'rgba(99,102,241,0.15)' }} icon={getIcon(item.type, item.module)} /></Badge>}
                                    title={<span style={{ fontWeight: item.is_read ? 400 : 600 }}>{t(item.title)}</span>}
                                    description={<><div style={{ color: '#94a3b8' }}>{t(item.description)}</div><div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}><ClockCircleOutlined /> {dayjs(item.created_at).format('DD.MM.YYYY HH:mm')}</div></>}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    )
}
