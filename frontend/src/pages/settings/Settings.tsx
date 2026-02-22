import { useState } from 'react'
import { Tabs, Form, Input, Select, Switch, Button, message, Divider, Row, Col, Card, Avatar, Space } from 'antd'
import { UserOutlined, SettingOutlined, BellOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons'
import { useCurrentUser, useUpdateProfile } from '../../api/hooks'
import { useTranslation } from 'react-i18next'

export default function Settings() {
    const { data: user } = useCurrentUser()
    const updateProfile = useUpdateProfile()
    const [profileForm] = Form.useForm()
    const [systemForm] = Form.useForm()
    const [notifForm] = Form.useForm()
    const [securityForm] = Form.useForm()
    const { t, i18n } = useTranslation()

    const handleProfileSave = async (values: any) => {
        try { await updateProfile.mutateAsync(values); message.success(t('settings.profile_saved')) }
        catch { message.error(t('common.error', 'Ошибка сохранения')) }
    }

    const handleSave = (section: string) => () => {
        message.success(`${section} — ${t('settings.settings_saved')}`)
    }

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang)
    }

    const tabItems = [
        {
            key: 'profile', label: <Space><UserOutlined />{t('settings.profile_tab')}</Space>,
            children: (
                <Card bordered={false}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar size={80} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: 32 }} icon={<UserOutlined />} />
                        <h3 style={{ margin: '12px 0 4px' }}>{user?.full_name || t('layout.admin')}</h3>
                        <p style={{ color: '#64748b' }}>{user?.email || 'admin@tashkent.erp'}</p>
                    </div>
                    <Form form={profileForm} layout="vertical" onFinish={handleProfileSave} initialValues={{ full_name: user?.full_name || t('layout.admin'), email: user?.email || 'admin@erp.uz', phone: '+998 90 123 45 67', language: i18n.language }}>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="full_name" label={t('settings.full_name')}><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="email" label={t('settings.email')}><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="phone" label={t('settings.phone')}><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="language" label={t('settings.language')}><Select onChange={handleLanguageChange} options={[{ value: 'ru', label: t('settings.lang_ru', 'Русский') }, { value: 'uz', label: t('settings.lang_uz', "O'zbekcha") }]} /></Form.Item></Col>
                        </Row>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={updateProfile.isPending}>{t('common.save')}</Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'system', label: <Space><SettingOutlined />{t('settings.system_tab')}</Space>,
            children: (
                <Card bordered={false}>
                    <Form form={systemForm} layout="vertical" onFinish={handleSave(t('settings.system_tab'))} initialValues={{ company_name: 'MChJ "Tashkent Tech Solutions"', currency: 'UZS', timezone: 'Asia/Tashkent', fiscal_year: 1, auto_backup: true, org_inn: '302456789', org_legal_address: 'Toshkent sh., Yakkasaroy tumani', org_director: 'Karimov A.Sh.', org_oked: '62010', fiscal_year_end: 12 }}>
                        <Divider orientation="left">{t('settings.organization')}</Divider>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="company_name" label={t('settings.company_name')}><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="org_inn" label={t('settings.inn')}><Input /></Form.Item></Col>
                            <Col span={24}><Form.Item name="org_legal_address" label={t('settings.legal_address')}><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="org_director" label={t('settings.director')}><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item name="org_oked" label={t('settings.oked')}><Input /></Form.Item></Col>
                        </Row>
                        <Divider orientation="left">{t('settings.finance_system')}</Divider>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="currency" label={t('settings.currency')}><Select options={[{ value: 'UZS', label: t('settings.currency_uzs', 'UZS (So\'m)') }, { value: 'USD', label: t('settings.currency_usd', 'USD (Dollar)') }, { value: 'EUR', label: t('settings.currency_eur', 'EUR (Yevro)') }]} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="timezone" label={t('settings.timezone')}><Select options={[{ value: 'Asia/Tashkent', label: t('settings.tz_tash', 'UTC+5 (Tashkent)') }, { value: 'Europe/Moscow', label: t('settings.tz_moscow', 'UTC+3 (Moscow)') }]} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="fiscal_year" label={t('settings.fiscal_year_start')}><Select options={[{ value: 1, label: t('dashboard.months.jan') }, { value: 4, label: t('dashboard.months.apr') }, { value: 7, label: t('dashboard.months.jul') }, { value: 10, label: t('dashboard.months.oct') }]} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="fiscal_year_end" label={t('settings.fiscal_year_end')}><Select options={[{ value: 12, label: t('dashboard.months.dec') }, { value: 3, label: t('dashboard.months.mar') }, { value: 6, label: t('dashboard.months.jun') }, { value: 9, label: t('dashboard.months.sep') }]} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="auto_backup" label={t('settings.auto_backup')} valuePropName="checked"><Switch /></Form.Item></Col>
                        </Row>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit">{t('common.save')}</Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'notifications', label: <Space><BellOutlined />{t('settings.notifications_tab')}</Space>,
            children: (
                <Card bordered={false}>
                    <Form form={notifForm} layout="vertical" onFinish={handleSave(t('settings.notifications_tab'))} initialValues={{ email_notif: true, sms_notif: false, deal_alerts: true, task_reminders: true, weekly_report: true }}>
                        <Divider orientation="left">{t('settings.channels')}</Divider>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="email_notif" label={t('settings.email_notif')} valuePropName="checked"><Switch /></Form.Item></Col>
                            <Col span={12}><Form.Item name="sms_notif" label={t('settings.sms_notif')} valuePropName="checked"><Switch /></Form.Item></Col>
                        </Row>
                        <Divider orientation="left">{t('settings.triggers')}</Divider>
                        <Row gutter={16}>
                            <Col span={8}><Form.Item name="deal_alerts" label={t('settings.deal_alerts')} valuePropName="checked"><Switch /></Form.Item></Col>
                            <Col span={8}><Form.Item name="task_reminders" label={t('settings.task_reminders')} valuePropName="checked"><Switch /></Form.Item></Col>
                            <Col span={8}><Form.Item name="weekly_report" label={t('settings.weekly_report')} valuePropName="checked"><Switch /></Form.Item></Col>
                        </Row>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit">{t('common.save')}</Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'security', label: <Space><LockOutlined />{t('settings.security_tab')}</Space>,
            children: (
                <Card bordered={false}>
                    <Form form={securityForm} layout="vertical" onFinish={handleSave(t('settings.security_tab'))}>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="current_password" label={t('settings.current_password')}><Input.Password /></Form.Item></Col>
                            <Col span={12}><div /></Col>
                            <Col span={12}><Form.Item name="new_password" label={t('settings.new_password')} rules={[{ min: 8, message: t('settings.password_min') }]}><Input.Password /></Form.Item></Col>
                            <Col span={12}><Form.Item name="confirm_password" label={t('settings.confirm_password')} dependencies={['new_password']} rules={[({ getFieldValue }) => ({ validator(_, v) { return !v || getFieldValue('new_password') === v ? Promise.resolve() : Promise.reject(t('settings.password_mismatch')) } })]}><Input.Password /></Form.Item></Col>
                        </Row>
                        <Divider orientation="left">{t('settings.two_factor')}</Divider>
                        <Form.Item name="two_factor" valuePropName="checked"><Switch checkedChildren={t('settings.two_factor_on')} unCheckedChildren={t('settings.two_factor_off')} /></Form.Item>
                        <Button type="primary" icon={<SaveOutlined />} htmlType="submit">{t('settings.update_password')}</Button>
                    </Form>
                </Card>
            ),
        },
    ]

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{t('settings.title')}</h1><p>{t('settings.subtitle')}</p></div>
            <Tabs defaultActiveKey="profile" tabPosition="left" style={{ minHeight: 500 }} items={tabItems} />
        </div>
    )
}
