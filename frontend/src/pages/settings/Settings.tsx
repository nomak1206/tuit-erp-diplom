import { Card, Form, Input, Switch, Select, Button, Divider, Row, Col, Space, Tag, Tabs } from 'antd'
import { SaveOutlined, UserOutlined, LockOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons'

export default function Settings() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>Настройки</h1><p>Конфигурация системы и профиля</p></div>

            <Tabs items={[
                {
                    key: 'profile',
                    label: <span><UserOutlined /> Профиль</span>,
                    children: (
                        <Card bordered={false}>
                            <Form layout="vertical" initialValues={{ full_name: 'Администратор Системы', email: 'admin@erp.local', phone: '+998901000000', position: 'Системный администратор' }}>
                                <Row gutter={24}>
                                    <Col span={12}><Form.Item label="ФИО" name="full_name"><Input /></Form.Item></Col>
                                    <Col span={12}><Form.Item label="Email" name="email"><Input /></Form.Item></Col>
                                    <Col span={12}><Form.Item label="Телефон" name="phone"><Input /></Form.Item></Col>
                                    <Col span={12}><Form.Item label="Должность" name="position"><Input /></Form.Item></Col>
                                </Row>
                                <Button type="primary" icon={<SaveOutlined />}>Сохранить</Button>
                            </Form>
                        </Card>
                    ),
                },
                {
                    key: 'system',
                    label: <span><SettingOutlined /> Система</span>,
                    children: (
                        <Card bordered={false}>
                            <Form layout="vertical" initialValues={{ app_name: 'ERP/CRM System', language: 'ru', timezone: 'Asia/Tashkent', currency: 'UZS' }}>
                                <Row gutter={24}>
                                    <Col span={12}><Form.Item label="Название системы" name="app_name"><Input /></Form.Item></Col>
                                    <Col span={12}><Form.Item label="Язык" name="language"><Select options={[{ value: 'ru', label: 'Русский' }, { value: 'uz', label: "O'zbek" }, { value: 'en', label: 'English' }]} /></Form.Item></Col>
                                    <Col span={12}><Form.Item label="Часовой пояс" name="timezone"><Select options={[{ value: 'Asia/Tashkent', label: 'UTC+5 (Ташкент)' }, { value: 'Europe/Moscow', label: 'UTC+3 (Москва)' }]} /></Form.Item></Col>
                                    <Col span={12}><Form.Item label="Валюта" name="currency"><Select options={[{ value: 'UZS', label: 'UZS — Узбекский сум' }, { value: 'USD', label: 'USD — Доллар' }, { value: 'EUR', label: 'EUR — Евро' }]} /></Form.Item></Col>
                                </Row>
                                <Button type="primary" icon={<SaveOutlined />}>Сохранить</Button>
                            </Form>
                        </Card>
                    ),
                },
                {
                    key: 'notifications',
                    label: <span><BellOutlined /> Уведомления</span>,
                    children: (
                        <Card bordered={false}>
                            <Space direction="vertical" style={{ width: '100%' }} size="large">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div><strong>Email-уведомления</strong><p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Получать уведомления на email</p></div>
                                    <Switch defaultChecked />
                                </div>
                                <Divider style={{ margin: 0 }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div><strong>Уведомления о сделках</strong><p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Изменения статусов сделок в CRM</p></div>
                                    <Switch defaultChecked />
                                </div>
                                <Divider style={{ margin: 0 }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div><strong>Уведомления о задачах</strong><p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Новые назначения и дедлайны</p></div>
                                    <Switch defaultChecked />
                                </div>
                                <Divider style={{ margin: 0 }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div><strong>Финансовые отчёты</strong><p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Еженедельная сводка по финансам</p></div>
                                    <Switch />
                                </div>
                            </Space>
                        </Card>
                    ),
                },
                {
                    key: 'security',
                    label: <span><LockOutlined /> Безопасность</span>,
                    children: (
                        <Card bordered={false}>
                            <Form layout="vertical">
                                <Form.Item label="Текущий пароль"><Input.Password /></Form.Item>
                                <Form.Item label="Новый пароль"><Input.Password /></Form.Item>
                                <Form.Item label="Подтверждение нового пароля"><Input.Password /></Form.Item>
                                <Button type="primary" icon={<LockOutlined />}>Изменить пароль</Button>
                            </Form>
                            <Divider />
                            <h4 style={{ marginBottom: 12 }}>Активные сессии</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                                <div><strong>Windows — Chrome</strong><p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Ташкент, Узбекистан • Сейчас</p></div>
                                <Tag color="green">Текущая</Tag>
                            </div>
                        </Card>
                    ),
                },
            ]} />
        </div>
    )
}
