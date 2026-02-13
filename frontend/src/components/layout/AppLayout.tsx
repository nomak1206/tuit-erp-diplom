import React, { useState } from 'react'
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
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'

const { Sider, Header, Content } = Layout

interface AppLayoutProps {
    children: React.ReactNode
}

const menuItems: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: 'Дашборд' },
    {
        key: 'crm-group', icon: <FundProjectionScreenOutlined />, label: 'CRM',
        children: [
            { key: '/crm', icon: <AppstoreOutlined />, label: 'Обзор' },
            { key: '/crm/leads', icon: <SolutionOutlined />, label: 'Лиды' },
            { key: '/crm/deals', icon: <DollarOutlined />, label: 'Сделки' },
            { key: '/crm/contacts', icon: <ContactsOutlined />, label: 'Контакты' },
        ],
    },
    {
        key: 'accounting-group', icon: <CalculatorOutlined />, label: 'Бухгалтерия',
        children: [
            { key: '/accounting', icon: <DollarOutlined />, label: 'Обзор' },
            { key: '/accounting/chart', icon: <AccountBookOutlined />, label: 'План счетов' },
            { key: '/accounting/journal', icon: <AuditOutlined />, label: 'Проводки' },
            { key: '/accounting/invoices', icon: <FileTextOutlined />, label: 'Счета' },
        ],
    },
    {
        key: 'hr-group', icon: <TeamOutlined />, label: 'HR и Кадры',
        children: [
            { key: '/hr', icon: <UserOutlined />, label: 'Обзор' },
            { key: '/hr/employees', icon: <IdcardOutlined />, label: 'Сотрудники' },
            { key: '/hr/timesheet', icon: <ClockCircleOutlined />, label: 'Табель' },
            { key: '/hr/payroll', icon: <WalletOutlined />, label: 'Зарплата' },
            { key: '/hr/vacations', icon: <CalendarOutlined />, label: 'Отпуска' },
            { key: '/hr/schedules', icon: <ScheduleOutlined />, label: 'Графики' },
        ],
    },
    {
        key: 'warehouse-group', icon: <ShopOutlined />, label: 'Склад',
        children: [
            { key: '/warehouse', icon: <InboxOutlined />, label: 'Обзор' },
            { key: '/warehouse/products', icon: <AppstoreOutlined />, label: 'Товары' },
            { key: '/warehouse/movements', icon: <SwapOutlined />, label: 'Движения' },
        ],
    },
    {
        key: 'projects-group', icon: <ProjectOutlined />, label: 'Проекты',
        children: [
            { key: '/projects', icon: <ProjectOutlined />, label: 'Обзор' },
            { key: '/projects/board', icon: <CheckSquareOutlined />, label: 'Доска задач' },
        ],
    },
    { key: '/documents', icon: <FileTextOutlined />, label: 'Документы' },
    { key: '/analytics', icon: <BarChartOutlined />, label: 'Аналитика' },
    { type: 'divider' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Настройки' },
]

// Simulated notifications
const notifications = [
    { id: 1, title: 'Новый лид создан', description: 'Компания "TechStart" добавлена', time: '5 мин назад', read: false, link: '/crm/leads' },
    { id: 2, title: 'Счёт оплачен', description: 'Счёт INV-2026-042 оплачен', time: '15 мин назад', read: false, link: '/accounting/invoices' },
    { id: 3, title: 'Задача завершена', description: 'Разработка API модуля', time: '1 час назад', read: true, link: '/projects/board' },
    { id: 4, title: 'Низкий остаток', description: 'Товар "Монитор 27" — мин. запас', time: '2 часа назад', read: false, link: '/warehouse/products' },
    { id: 5, title: 'Документ на согласовании', description: 'Договор DOC-2026-015', time: '3 часа назад', read: true, link: '/documents' },
]

// Global search routes for quick navigation
const searchRoutes = [
    { path: '/', label: 'Дашборд', icon: '📊' },
    { path: '/crm', label: 'CRM — Обзор', icon: '💼' },
    { path: '/crm/contacts', label: 'CRM — Контакты', icon: '👥' },
    { path: '/crm/leads', label: 'CRM — Лиды', icon: '🎯' },
    { path: '/crm/deals', label: 'CRM — Сделки (Kanban)', icon: '💰' },
    { path: '/accounting', label: 'Бухгалтерия — Обзор', icon: '🧮' },
    { path: '/accounting/chart', label: 'План счетов', icon: '📋' },
    { path: '/accounting/journal', label: 'Журнал проводок', icon: '📖' },
    { path: '/accounting/invoices', label: 'Счета-фактуры', icon: '🧾' },
    { path: '/hr', label: 'HR — Обзор', icon: '👤' },
    { path: '/hr/employees', label: 'Сотрудники', icon: '🏢' },
    { path: '/hr/timesheet', label: 'Табель учёта', icon: '⏰' },
    { path: '/hr/payroll', label: 'Зарплата', icon: '💵' },
    { path: '/hr/vacations', label: 'Расчёт отпускных', icon: '🏖️' },
    { path: '/hr/schedules', label: 'Графики работы', icon: '📅' },
    { path: '/warehouse', label: 'Склад — Обзор', icon: '📦' },
    { path: '/warehouse/products', label: 'Товары', icon: '🛒' },
    { path: '/warehouse/movements', label: 'Движения товаров', icon: '🔄' },
    { path: '/projects', label: 'Проекты — Обзор', icon: '📁' },
    { path: '/projects/board', label: 'Доска задач', icon: '📌' },
    { path: '/documents', label: 'Документы', icon: '📄' },
    { path: '/analytics', label: 'Аналитика', icon: '📈' },
    { path: '/settings', label: 'Настройки', icon: '⚙️' },
]

export default function AppLayout({ children }: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false)
    const [notifDrawer, setNotifDrawer] = useState(false)
    const [searchModal, setSearchModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()
    const location = useLocation()

    const unreadCount = notifications.filter(n => !n.read).length

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key.startsWith('/')) navigate(key)
    }

    const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'profile') navigate('/settings')
        if (key === 'settings') navigate('/settings')
        if (key === 'help') Modal.info({ title: 'О системе', content: 'ERP System v2.0 — Корпоративная система управления предприятием. \n\nПоддержка: admin@erp.uz', okText: 'Закрыть' })
        if (key === 'logout') {
            Modal.confirm({
                title: 'Выход из системы',
                content: 'Вы действительно хотите выйти?',
                okText: 'Выйти',
                cancelText: 'Отмена',
                okButtonProps: { danger: true },
                onOk: () => { message.success('Вы вышли из системы'); navigate('/') },
            })
        }
    }

    const userMenuItems: MenuProps['items'] = [
        { key: 'profile', icon: <UserOutlined />, label: 'Мой профиль' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Настройки' },
        { key: 'help', icon: <QuestionCircleOutlined />, label: 'О системе' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Выход', danger: true },
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
            <Sider trigger={null} collapsible collapsed={collapsed} width={260} collapsedWidth={80}
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
                <Menu theme="dark" mode="inline" selectedKeys={getSelectedKeys()} defaultOpenKeys={getOpenKeys()}
                    items={menuItems} onClick={handleMenuClick} style={{ borderRight: 0 }} />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
                <Header className="app-header">
                    <Space>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            onClick: () => setCollapsed(!collapsed),
                            style: { fontSize: 18, cursor: 'pointer', color: '#94a3b8' },
                        })}
                        <Input
                            placeholder="Поиск по системе... (Ctrl+K)"
                            prefix={<SearchOutlined style={{ color: '#64748b' }} />}
                            className="header-search"
                            style={{ width: 280, background: '#141428', border: '1px solid #2d2d4a' }}
                            onClick={() => setSearchModal(true)}
                            readOnly
                        />
                    </Space>

                    <div className="header-right">
                        <Badge count={unreadCount} size="small">
                            <BellOutlined style={{ fontSize: 20, color: '#94a3b8', cursor: 'pointer' }} onClick={() => setNotifDrawer(true)} />
                        </Badge>
                        <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" trigger={['click']}>
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} icon={<UserOutlined />} />
                                <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>Администратор</span>
                            </Space>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="page-content">
                    {children}
                </Content>
            </Layout>

            {/* Notifications Drawer */}
            <Drawer title={<Space><BellOutlined /> Уведомления <Tag color="blue">{unreadCount} новых</Tag></Space>}
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
            <Modal title={<Space><SearchOutlined /> Поиск по системе</Space>}
                open={searchModal} onCancel={() => { setSearchModal(false); setSearchQuery('') }}
                footer={null} width={520}>
                <Input placeholder="Введите название раздела..." prefix={<SearchOutlined />}
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
