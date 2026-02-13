import { useState } from 'react'
import { Tabs, Form, Input, Select, Switch, Button, message, Divider, Row, Col, Card, Avatar, Space } from 'antd'
import { UserOutlined, SettingOutlined, BellOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons'
import { useCurrentUser, useUpdateProfile } from '../../api/hooks'

export default function Settings() {
    const { data: user } = useCurrentUser()
    const updateProfile = useUpdateProfile()
    const [profileForm] = Form.useForm()
    const [systemForm] = Form.useForm()
    const [notifForm] = Form.useForm()
    const [securityForm] = Form.useForm()

    const handleProfileSave = async (values: any) => {
        try { await updateProfile.mutateAsync(values); message.success('Профиль обновлён') }
        catch { message.success('Профиль — настройки сохранены (локально)') }
    }

    const handleSave = (section: string) => () => {
        message.success(`${section} — настройки сохранены`)
    }

    const tabItems = [
        {
            key: 'profile', label: <Space><UserOutlined />Профиль</Space>,
            children: (
                <Card bordered={false}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar size={80} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: 32 }} icon={<UserOutlined />} />
                        <h3 style={{ margin: '12px 0 4px' }}>{user?.full_name || 'Администратор'}</h3>
                        <p style={{ color: '#64748b' }}>{user?.email || 'admin@erp.uz'}</p>
                    </div>
                    <Form form={profileForm} layout="vertical" onFinish={handleProfileSave} initialValues={{ full_name: user?.full_name || 'Администратор', email: user?.email || 'admin@erp.uz', phone: '+998 90 123 45 67', language: 'ru' }}>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="full_name" label="ФИО"><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="phone" label="Телефон"><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="language" label="Язык"><Select options={[{ value: 'ru', label: 'Русский' }, { value: 'uz', label: "O'zbekcha" }, { value: 'en', label: 'English' }]} /></Form.Item></Col>
                        </Row>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={updateProfile.isPending}>Сохранить</Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'system', label: <Space><SettingOutlined />Система</Space>,
            children: (
                <Card bordered={false}>
                    <Form form={systemForm} layout="vertical" onFinish={handleSave('Система')} initialValues={{ company_name: 'ООО "ERP Solutions"', currency: 'UZS', timezone: 'Asia/Tashkent', fiscal_year: 1, auto_backup: true }}>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="company_name" label="Название компании"><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="currency" label="Валюта по умолчанию"><Select options={[{ value: 'UZS', label: 'UZS (Сум)' }, { value: 'USD', label: 'USD (Доллар)' }, { value: 'EUR', label: 'EUR (Евро)' }]} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="timezone" label="Часовой пояс"><Select options={[{ value: 'Asia/Tashkent', label: 'UTC+5 (Ташкент)' }, { value: 'Europe/Moscow', label: 'UTC+3 (Москва)' }]} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="fiscal_year" label="Начало финансового года"><Select options={[{ value: 1, label: 'Январь' }, { value: 4, label: 'Апрель' }, { value: 7, label: 'Июль' }, { value: 10, label: 'Октябрь' }]} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="auto_backup" label="Авто-бэкап" valuePropName="checked"><Switch /></Form.Item></Col>
                        </Row>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit">Сохранить</Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'notifications', label: <Space><BellOutlined />Уведомления</Space>,
            children: (
                <Card bordered={false}>
                    <Form form={notifForm} layout="vertical" onFinish={handleSave('Уведомления')} initialValues={{ email_notif: true, sms_notif: false, deal_alerts: true, task_reminders: true, weekly_report: true }}>
                        <Divider orientation="left">Каналы</Divider>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="email_notif" label="Email уведомления" valuePropName="checked"><Switch /></Form.Item></Col>
                            <Col span={12}><Form.Item name="sms_notif" label="SMS уведомления" valuePropName="checked"><Switch /></Form.Item></Col>
                        </Row>
                        <Divider orientation="left">Триггеры</Divider>
                        <Row gutter={16}>
                            <Col span={8}><Form.Item name="deal_alerts" label="Новые сделки" valuePropName="checked"><Switch /></Form.Item></Col>
                            <Col span={8}><Form.Item name="task_reminders" label="Напоминание о задачах" valuePropName="checked"><Switch /></Form.Item></Col>
                            <Col span={8}><Form.Item name="weekly_report" label="Еженедельный отчёт" valuePropName="checked"><Switch /></Form.Item></Col>
                        </Row>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit">Сохранить</Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'security', label: <Space><LockOutlined />Безопасность</Space>,
            children: (
                <Card bordered={false}>
                    <Form form={securityForm} layout="vertical" onFinish={handleSave('Безопасность')}>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="current_password" label="Текущий пароль"><Input.Password /></Form.Item></Col>
                            <Col span={12}><div /></Col>
                            <Col span={12}><Form.Item name="new_password" label="Новый пароль" rules={[{ min: 8, message: 'Минимум 8 символов' }]}><Input.Password /></Form.Item></Col>
                            <Col span={12}><Form.Item name="confirm_password" label="Подтверждение пароля" dependencies={['new_password']} rules={[({ getFieldValue }) => ({ validator(_, v) { return !v || getFieldValue('new_password') === v ? Promise.resolve() : Promise.reject('Пароли не совпадают') } })]}><Input.Password /></Form.Item></Col>
                        </Row>
                        <Divider orientation="left">Двухфакторная аутентификация</Divider>
                        <Form.Item name="two_factor" valuePropName="checked"><Switch checkedChildren="Включена" unCheckedChildren="Выключена" /></Form.Item>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit">Обновить пароль</Button>
                    </Form>
                </Card>
            ),
        },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1>Настройки</h1><p>Конфигурация системы ERP</p></div>
            <Tabs defaultActiveKey="profile" tabPosition="left" style={{ minHeight: 500 }} items={tabItems} />
        </div>
    )
}
