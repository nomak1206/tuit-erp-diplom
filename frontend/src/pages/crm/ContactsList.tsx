import { Table, Button, Space, Input, Tag, Avatar } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'

const contacts = [
    { id: 1, first_name: 'Азиз', last_name: 'Каримов', email: 'aziz@example.com', phone: '+998901111111', company: 'TechCorp UZ', position: 'CEO' },
    { id: 2, first_name: 'Нодира', last_name: 'Рахимова', email: 'nodira@example.com', phone: '+998902222222', company: 'BuildPro', position: 'Закупщик' },
    { id: 3, first_name: 'Дмитрий', last_name: 'Ким', email: 'dmitriy@example.com', phone: '+998903333333', company: 'LogiTrans', position: 'Директор' },
    { id: 4, first_name: 'Шахзод', last_name: 'Усманов', email: 'shahzod@example.com', phone: '+998904444444', company: 'FoodMarket', position: 'Менеджер' },
    { id: 5, first_name: 'Лола', last_name: 'Мирзаева', email: 'lola@example.com', phone: '+998905555555', company: 'MediaGroup', position: 'Маркетолог' },
]

const columns = [
    {
        title: 'Контакт', key: 'name',
        render: (_: any, r: any) => (
            <Space>
                <Avatar style={{ background: '#6366f1' }} icon={<UserOutlined />} size="small" />
                <span style={{ fontWeight: 600 }}>{r.first_name} {r.last_name}</span>
            </Space>
        )
    },
    { title: 'Компания', dataIndex: 'company', key: 'company', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Должность', dataIndex: 'position', key: 'position' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => <Space><MailOutlined style={{ color: '#64748b' }} />{v}</Space> },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: (v: string) => <Space><PhoneOutlined style={{ color: '#64748b' }} />{v}</Space> },
]

export default function ContactsList() {
    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Контакты</h1>
                <p>Справочник клиентов и партнёров</p>
            </div>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Поиск контактов..." prefix={<SearchOutlined />} style={{ width: 280 }} />
                <Button type="primary" icon={<PlusOutlined />}>Новый контакт</Button>
            </Space>
            <Table columns={columns} dataSource={contacts} rowKey="id" pagination={{ pageSize: 10 }} />
        </div>
    )
}
