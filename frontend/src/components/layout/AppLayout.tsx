import React, { useState, useEffect } from 'react'
import { Layout, Menu, Input, Badge, Avatar, Dropdown, Space, Drawer, List, Tag, message, Modal, Typography } from 'antd'
import {
    DashboardOutlined,
    TeamOutlined,
    FundProjectionScreenOutlined,
    DollarOutlined,
    UserOutlined,
    ShopOutlined,
    ProjectOutlined,
    FileTextOutlined,
    BarChartOutlined,
    SettingOutlined,
    BellOutlined,
    SearchOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SolutionOutlined,
    ContactsOutlined,
    CalculatorOutlined,
    AccountBookOutlined,
    AuditOutlined,
    IdcardOutlined,
    ClockCircleOutlined,
    WalletOutlined,
    InboxOutlined,
    SwapOutlined,
    AppstoreOutlined,
    CheckSquareOutlined,
    LogoutOutlined,
    QuestionCircleOutlined,
    InfoCircleOutlined,
    CalendarOutlined,
    ScheduleOutlined,
    LockOutlined,
    MoonOutlined,
    SunOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

const { Sider, Header, Content } = Layout

interface AppLayoutProps {
    children: React.ReactNode
}


export default function AppLayout({ children }: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false)
    const [notifDrawer, setNotifDrawer] = useState(false)
    const [searchModal, setSearchModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const navigate = useNavigate()
    const location = useLocation()
    const { themeMode, toggleTheme } = useTheme()
    const { t, i18n } = useTranslation()

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const notifications = [
        { id: 1, title: t('crm.new_lead_title', 'Новый лид создан'), description: t('crm.new_lead_desc', 'Компания "TechStart" добавлена'), time: t('common.time_5m_ago', '5 мин назад'), read: false, link: '/crm/leads' },
        { id: 2, title: t('accounting.invoice_paid_title', 'Счёт оплачен'), description: t('accounting.invoice_paid_desc', 'Счёт INV-2026-042 оплачен'), time: t('common.time_15m_ago', '15 мин назад'), read: false, link: '/accounting/invoices' },
        { id: 3, title: t('projects.task_done_title', 'Задача завершена'), description: t('projects.task_done_desc', 'Разработка API модуля'), time: t('common.time_1h_ago', '1 час назад'), read: true, link: '/projects/board' },
        { id: 4, title: t('warehouse.low_stock'), description: t('warehouse.low_stock_desc', 'Товар "Монитор 27" — мин. запас'), time: t('common.time_2h_ago', '2 часа назад'), read: false, link: '/warehouse/products' },
        { id: 5, title: t('documents.doc_review_title', 'Документ на согласовании'), description: t('documents.doc_review_desc', 'Договор DOC-2026-015'), time: t('common.time_3h_ago', '3 часа назад'), read: true, link: '/documents' },
    ]

    const searchRoutes = [
        { path: '/', label: t('dashboard.title', 'Дашборд'), icon: '📊' },
        { path: '/crm', label: t('crm.title', 'CRM — Обзор'), icon: '💼' },
        { path: '/crm/contacts', label: t('contacts.title', 'CRM — Контакты'), icon: '👥' },
        { path: '/crm/leads', label: t('leads.title', 'CRM — Лиды'), icon: '🎯' },
        { path: '/crm/deals', label: t('deals.title', 'CRM — Сделки (Kanban)'), icon: '💰' },
        { path: '/accounting', label: t('accounting.title', 'Бухгалтерия — Обзор'), icon: '🧮' },
        { path: '/accounting/chart', label: t('accounting.chart_title', 'План счетов'), icon: '📋' },
        { path: '/accounting/journal', label: t('accounting.journal_title', 'Журнал проводок'), icon: '📖' },
        { path: '/accounting/invoices', label: t('accounting.invoices_title', 'Счета-фактуры'), icon: '🧾' },
        { path: '/hr', label: t('hr.title', 'HR — Обзор'), icon: '👤' },
        { path: '/hr/employees', label: t('hr.employees', 'Сотрудники'), icon: '🏢' },
        { path: '/hr/timesheet', label: t('timesheet.title', 'Табель учёта'), icon: '⏰' },
        { path: '/hr/payroll', label: t('payroll.title', 'Зарплата'), icon: '💵' },
        { path: '/hr/vacations', label: t('vacations.title', 'Расчёт отпускных'), icon: '🏖️' },
        { path: '/hr/schedules', label: t('schedules.title', 'Графики работы'), icon: '📅' },
        { path: '/warehouse', label: t('warehouse.title', 'Склад — Обзор'), icon: '📦' },
        { path: '/warehouse/products', label: t('warehouse.products_title', 'Товары'), icon: '🛒' },
        { path: '/warehouse/movements', label: t('warehouse.movements_title', 'Движения товаров'), icon: '🔄' },
        { path: '/warehouse/inventory', label: t('warehouse.inventory_title', 'Инвентаризация'), icon: '✅' },
        { path: '/accounting/month-close', label: t('accounting.month_close_title', 'Закрытие месяца'), icon: '🔒' },
        { path: '/accounting/trial-balance', label: t('accounting.trial_balance_title', 'ОСВ'), icon: '📊' },
        { path: '/hr/staffing', label: t('staffing.title', 'Штатное расписание'), icon: '📋' },
        { path: '/notifications', label: t('notifications_page.title', 'Уведомления'), icon: '🔔' },
        { path: '/projects', label: t('projects.title', 'Проекты — Обзор'), icon: '📁' },
        { path: '/projects/board', label: t('projects.board_title', 'Доска задач'), icon: '📌' },
        { path: '/documents', label: t('documents.title', 'Документы'), icon: '📄' },
        { path: '/analytics', label: t('analytics.title', 'Аналитика'), icon: '📈' },
        { path: '/settings', label: t('settings.title', 'Настройки'), icon: '⚙️' },
    ]

    const unreadCount = notifications.filter(n => !n.read).length

    const menuItems: MenuProps['items'] = [
        { key: '/', icon: <DashboardOutlined />, label: t('layout.dashboard') },
        {
            key: 'crm-group', icon: <FundProjectionScreenOutlined />, label: t('layout.crm'),
            children: [
                { key: '/crm', icon: <AppstoreOutlined />, label: t('layout.crm_overview') },
                { key: '/crm/leads', icon: <SolutionOutlined />, label: t('layout.crm_leads') },
                { key: '/crm/deals', icon: <DollarOutlined />, label: t('layout.crm_deals') },
                { key: '/crm/contacts', icon: <ContactsOutlined />, label: t('layout.crm_contacts') },
            ],
        },
        {
            key: 'accounting-group', icon: <CalculatorOutlined />, label: t('layout.accounting'),
            children: [
                { key: '/accounting', icon: <DollarOutlined />, label: t('layout.acc_overview') },
                { key: '/accounting/chart', icon: <AccountBookOutlined />, label: t('layout.acc_chart') },
                { key: '/accounting/journal', icon: <AuditOutlined />, label: t('layout.acc_journal') },
                { key: '/accounting/invoices', icon: <FileTextOutlined />, label: t('layout.acc_invoices') },
                { key: '/accounting/month-close', icon: <LockOutlined />, label: t('layout.acc_close') },
                { key: '/accounting/trial-balance', icon: <BarChartOutlined />, label: t('layout.acc_trial') },
            ],
        },
        {
            key: 'hr-group', icon: <TeamOutlined />, label: t('layout.hr'),
            children: [
                { key: '/hr', icon: <UserOutlined />, label: t('layout.hr_overview') },
                { key: '/hr/employees', icon: <IdcardOutlined />, label: t('layout.hr_employees') },
                { key: '/hr/timesheet', icon: <ClockCircleOutlined />, label: t('layout.hr_timesheet') },
                { key: '/hr/payroll', icon: <WalletOutlined />, label: t('layout.hr_payroll') },
                { key: '/hr/vacations', icon: <CalendarOutlined />, label: t('layout.hr_vacations') },
                { key: '/hr/schedules', icon: <ScheduleOutlined />, label: t('layout.hr_schedules') },
                { key: '/hr/staffing', icon: <TeamOutlined />, label: t('layout.hr_staffing') },
            ],
        },
        {
            key: 'warehouse-group', icon: <ShopOutlined />, label: t('layout.warehouse'),
            children: [
                { key: '/warehouse', icon: <InboxOutlined />, label: t('layout.wh_overview') },
                { key: '/warehouse/products', icon: <AppstoreOutlined />, label: t('layout.wh_products') },
                { key: '/warehouse/movements', icon: <SwapOutlined />, label: t('layout.wh_movements') },
                { key: '/warehouse/inventory', icon: <CheckSquareOutlined />, label: t('layout.wh_inventory') },
            ],
        },
        {
            key: 'projects-group', icon: <ProjectOutlined />, label: t('layout.projects'),
            children: [
                { key: '/projects', icon: <ProjectOutlined />, label: t('layout.proj_overview') },
                { key: '/projects/board', icon: <CheckSquareOutlined />, label: t('layout.proj_board') },
            ],
        },
        { key: '/documents', icon: <FileTextOutlined />, label: t('layout.documents') },
        { key: '/analytics', icon: <BarChartOutlined />, label: t('layout.analytics') },
        { key: '/notifications', icon: <BellOutlined />, label: t('layout.notifications') },
        { type: 'divider' },
        { key: '/settings', icon: <SettingOutlined />, label: t('layout.settings') },
    ]

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key.startsWith('/')) navigate(key)
    }

    const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'profile') navigate('/settings')
        if (key === 'settings') navigate('/settings')
        if (key === 'help') Modal.info({ title: t('layout.help'), content: t('layout.help_text', 'ERP System v2.0 — Корпоративная система управления предприятием. \n\nПоддержка: admin@erp.uz'), okText: t('common.close', 'Закрыть') })
        if (key === 'logout') {
            Modal.confirm({
                title: t('layout.logout'),
                content: t('layout.logout_confirm', 'Вы действительно хотите выйти?'),
                okText: t('layout.logout'),
                cancelText: t('common.cancel', 'Отмена'),
                okButtonProps: { danger: true },
                onOk: () => { message.success(t('layout.logout_success', 'Вы вышли из системы')); navigate('/') },
            })
        }
    }

    const userMenuItems: MenuProps['items'] = [
        { key: 'profile', icon: <UserOutlined />, label: t('layout.profile') },
        { key: 'settings', icon: <SettingOutlined />, label: t('layout.settings') },
        { key: 'help', icon: <QuestionCircleOutlined />, label: t('layout.help') },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: t('layout.logout'), danger: true },
    ]

    const languageMenuItems: MenuProps['items'] = [
        { key: 'ru', label: 'Русский', disabled: i18n.language === 'ru' },
        { key: 'uz', label: 'Oʻzbekcha', disabled: i18n.language === 'uz' },
    ]

    const getSelectedKeys = () => [location.pathname]
    const getOpenKeys = () => {
        const path = location.pathname
        if (path.startsWith('/crm')) return ['crm-group']
        if (path.startsWith('/accounting')) return ['accounting-group']
        if (path.startsWith('/hr')) return ['hr-group']
        if (path.startsWith('/warehouse')) return ['warehouse-group']
        if (path.startsWith('/projects')) return ['projects-group']
        return []
    }

    const filteredRoutes = searchQuery
        ? searchRoutes.filter(r => r.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : searchRoutes

    return (
        <Layout style={{ height: '100vh' }}>
            <Sider theme={themeMode === 'dark' ? 'dark' : 'light'} trigger={null} collapsible collapsed={collapsed} width={260} collapsedWidth={80}
                breakpoint="lg" onBreakpoint={(broken) => setCollapsed(broken)}
                style={{ overflow: 'auto', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
                <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <div className="sidebar-logo-icon">E</div>
                    {!collapsed && (
                        <div className="sidebar-logo-text">
                            <h3>ERP System</h3>
                            <span>v2.0.0</span>
                        </div>
                    )}
                </div>
                <Menu theme={themeMode === 'dark' ? 'dark' : 'light'} mode="inline" selectedKeys={getSelectedKeys()} defaultOpenKeys={getOpenKeys()}
                    items={menuItems} onClick={handleMenuClick} style={{ borderRight: 0 }} />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
                <Header className="app-header" style={{ padding: '0 16px' }}>
                    <Space>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            onClick: () => setCollapsed(!collapsed),
                            style: { fontSize: 18, cursor: 'pointer', color: '#94a3b8' },
                        })}
                        {!isMobile && (
                            <Input
                                placeholder={t('layout.search_placeholder')}
                                prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
                                className="header-search"
                                style={{ width: 240, background: 'var(--bg-kanban-col)', border: '1px solid var(--border-color)' }}
                                onClick={() => setSearchModal(true)}
                                readOnly
                            />
                        )}
                        {isMobile && (
                            <SearchOutlined style={{ fontSize: 18, color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 8 }} onClick={() => setSearchModal(true)} />
                        )}
                    </Space>

                    <div className="header-right">
                        <Space style={{ marginRight: 8, gap: 12 }}>
                            <Dropdown menu={{ items: languageMenuItems, onClick: ({ key }) => i18n.changeLanguage(key) }} placement="bottomRight" trigger={['click']}>
                                <Tag color="blue" style={{ cursor: 'pointer', margin: 0, padding: '4px 8px' }}>
                                    {i18n.language.toUpperCase()}
                                </Tag>
                            </Dropdown>

                            {themeMode === 'dark' ? (
                                <SunOutlined onClick={toggleTheme} style={{ fontSize: 18, color: '#94a3b8', cursor: 'pointer' }} title={t('layout.light_theme')} />
                            ) : (
                                <MoonOutlined onClick={toggleTheme} style={{ fontSize: 18, color: '#64748b', cursor: 'pointer' }} title={t('layout.dark_theme')} />
                            )}
                        </Space>
                        <Badge count={unreadCount} size="small" style={{ marginRight: 16 }}>
                            <BellOutlined style={{ fontSize: 20, color: themeMode === 'dark' ? '#94a3b8' : '#64748b', cursor: 'pointer' }} onClick={() => setNotifDrawer(true)} />
                        </Badge>
                        <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" trigger={['click']}>
                            <Space style={{ cursor: 'pointer', marginLeft: 16 }}>
                                <Avatar style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} icon={<UserOutlined />} />
                                <span style={{ color: 'var(--text-main)', fontSize: 13, fontWeight: 500 }}>{t('layout.admin')}</span>
                            </Space>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="page-content">
                    {children}
                </Content>
            </Layout>

            {/* Notifications Drawer */}
            <Drawer title={<Space><BellOutlined /> {t('layout.notif_title')} <Tag color="blue">{t('layout.new_notifications', { count: unreadCount })}</Tag></Space>}
                open={notifDrawer} onClose={() => setNotifDrawer(false)} width={400}>
                <List
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            style={{ cursor: 'pointer', background: item.read ? 'transparent' : 'rgba(99,102,241,0.05)', borderRadius: 8, padding: '12px 16px', marginBottom: 4 }}
                            onClick={() => { navigate(item.link); setNotifDrawer(false) }}
                        >
                            <List.Item.Meta
                                avatar={<Badge dot={!item.read}><InfoCircleOutlined style={{ fontSize: 20, color: item.read ? '#64748b' : '#6366f1' }} /></Badge>}
                                title={<span style={{ fontWeight: item.read ? 400 : 600 }}>{item.title}</span>}
                                description={<><div style={{ color: '#94a3b8' }}>{item.description}</div><div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{item.time}</div></>}
                            />
                        </List.Item>
                    )}
                />
            </Drawer>

            {/* Search Modal */}
            <Modal title={<Space><SearchOutlined /> {t('layout.search_title')}</Space>}
                open={searchModal} onCancel={() => { setSearchModal(false); setSearchQuery('') }}
                footer={null} width={520}>
                <Input placeholder={t('layout.search_input')} prefix={<SearchOutlined />}
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                    style={{ marginBottom: 16 }} size="large" allowClear />
                <List
                    dataSource={filteredRoutes}
                    renderItem={(item) => (
                        <List.Item
                            style={{ cursor: 'pointer', borderRadius: 8, padding: '8px 12px' }}
                            onClick={() => { navigate(item.path); setSearchModal(false); setSearchQuery('') }}
                        >
                            <Space>
                                <span style={{ fontSize: 18 }}>{item.icon}</span>
                                <span style={{ fontWeight: 500 }}>{item.label}</span>
                            </Space>
                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>{item.path}</Typography.Text>
                        </List.Item>
                    )}
                />
            </Modal>
        </Layout>
    )
}
