import React, { useState } from 'react'
import { Layout, Menu, Input, Badge, Avatar, Dropdown, Space } from 'antd'
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
    PhoneOutlined,
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
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'

const { Sider, Header, Content } = Layout

interface AppLayoutProps {
    children: React.ReactNode
}

const menuItems: MenuProps['items'] = [
    {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Дашборд',
    },
    {
        key: 'crm-group',
        icon: <FundProjectionScreenOutlined />,
        label: 'CRM',
        children: [
            { key: '/crm', icon: <AppstoreOutlined />, label: 'Обзор' },
            { key: '/crm/leads', icon: <SolutionOutlined />, label: 'Лиды' },
            { key: '/crm/deals', icon: <DollarOutlined />, label: 'Сделки' },
            { key: '/crm/contacts', icon: <ContactsOutlined />, label: 'Контакты' },
        ],
    },
    {
        key: 'accounting-group',
        icon: <CalculatorOutlined />,
        label: 'Бухгалтерия',
        children: [
            { key: '/accounting', icon: <DollarOutlined />, label: 'Обзор' },
            { key: '/accounting/chart', icon: <AccountBookOutlined />, label: 'План счетов' },
            { key: '/accounting/journal', icon: <AuditOutlined />, label: 'Проводки' },
            { key: '/accounting/invoices', icon: <FileTextOutlined />, label: 'Счета' },
        ],
    },
    {
        key: 'hr-group',
        icon: <TeamOutlined />,
        label: 'HR и Кадры',
        children: [
            { key: '/hr', icon: <UserOutlined />, label: 'Обзор' },
            { key: '/hr/employees', icon: <IdcardOutlined />, label: 'Сотрудники' },
            { key: '/hr/timesheet', icon: <ClockCircleOutlined />, label: 'Табель' },
            { key: '/hr/payroll', icon: <WalletOutlined />, label: 'Зарплата' },
        ],
    },
    {
        key: 'warehouse-group',
        icon: <ShopOutlined />,
        label: 'Склад',
        children: [
            { key: '/warehouse', icon: <InboxOutlined />, label: 'Обзор' },
            { key: '/warehouse/products', icon: <AppstoreOutlined />, label: 'Товары' },
            { key: '/warehouse/movements', icon: <SwapOutlined />, label: 'Движения' },
        ],
    },
    {
        key: 'projects-group',
        icon: <ProjectOutlined />,
        label: 'Проекты',
        children: [
            { key: '/projects', icon: <ProjectOutlined />, label: 'Проекты' },
            { key: '/projects/tasks', icon: <CheckSquareOutlined />, label: 'Задачи' },
        ],
    },
    {
        key: '/documents',
        icon: <FileTextOutlined />,
        label: 'Документы',
    },
    {
        key: '/analytics',
        icon: <BarChartOutlined />,
        label: 'Аналитика',
    },
    { type: 'divider' },
    {
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Настройки',
    },
]

const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Профиль' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Настройки' },
    { type: 'divider' },
    { key: 'logout', label: 'Выход', danger: true },
]

export default function AppLayout({ children }: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key.startsWith('/')) {
            navigate(key)
        }
    }

    const getSelectedKeys = () => {
        return [location.pathname]
    }

    const getOpenKeys = () => {
        const path = location.pathname
        if (path.startsWith('/crm')) return ['crm-group']
        if (path.startsWith('/accounting')) return ['accounting-group']
        if (path.startsWith('/hr')) return ['hr-group']
        if (path.startsWith('/warehouse')) return ['warehouse-group']
        if (path.startsWith('/projects')) return ['projects-group']
        return []
    }

    return (
        <Layout style={{ height: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                collapsedWidth={80}
                style={{ overflow: 'auto', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
            >
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">E</div>
                    {!collapsed && (
                        <div className="sidebar-logo-text">
                            <h3>ERP System</h3>
                            <span>v1.0.0</span>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={getSelectedKeys()}
                    defaultOpenKeys={getOpenKeys()}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0 }}
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
                {/* Header */}
                <Header className="app-header">
                    <Space>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            onClick: () => setCollapsed(!collapsed),
                            style: { fontSize: 18, cursor: 'pointer', color: '#94a3b8' },
                        })}
                        <Input
                            placeholder="Поиск по системе..."
                            prefix={<SearchOutlined style={{ color: '#64748b' }} />}
                            className="header-search"
                            style={{ width: 280, background: '#141428', border: '1px solid #2d2d4a' }}
                        />
                    </Space>

                    <div className="header-right">
                        <Badge count={3} size="small">
                            <BellOutlined style={{ fontSize: 20, color: '#94a3b8', cursor: 'pointer' }} />
                        </Badge>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} icon={<UserOutlined />} />
                                {!collapsed && <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>Администратор</span>}
                            </Space>
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content className="page-content">
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}
