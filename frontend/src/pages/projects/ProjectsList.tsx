import { Table, Tag, Button, Space, Input, Progress, Spin } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useProjects } from '../../api/hooks'

export default function ProjectsList() {
    const { t } = useTranslation()
    const [search, setSearch] = useState('')
    const { data: projectsData = [], isLoading } = useProjects()

    const statusMap: Record<string, { color: string; label: string }> = {
        active: { color: 'blue', label: t('common.active', 'Активный') },
        completed: { color: 'green', label: t('projects.completed', 'Завершён') },
        on_hold: { color: 'orange', label: t('common.on_hold', 'Приостановлен') },
        cancelled: { color: 'red', label: t('common.cancelled', 'Отменён') },
    }

    const columns = [
        { title: t('common.name', 'Название'), dataIndex: 'name', key: 'name', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
        { title: t('deals.client', 'Клиент'), dataIndex: 'client', key: 'client', render: (v: string) => <Tag color="blue">{v || '—'}</Tag> },
        { title: t('common.status', 'Статус'), dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label ?? s}</Tag> },
        { title: t('projects.progress', 'Прогресс'), dataIndex: 'progress', key: 'progress', render: (v: number) => <Progress percent={v ?? 0} size="small" strokeColor="#6366f1" style={{ width: 120 }} /> },
        { title: `${t('projects.budget', 'Бюджет')} (UZS)`, dataIndex: 'budget', key: 'budget', render: (v: number) => v ? v.toLocaleString('ru-RU') : '—' },
        { title: t('projects.deadline', 'Дедлайн'), dataIndex: 'deadline', key: 'deadline', render: (v: string) => v ? new Date(v).toLocaleDateString('ru-RU') : '—' },
    ]

    const filtered = search
        ? projectsData.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase()))
        : projectsData

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{t('projects.title')}</h1><p>{t('projects.subtitle')}</p></div>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder={t('common.search')}
                    prefix={<SearchOutlined />}
                    style={{ width: 280 }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Button type="primary" icon={<PlusOutlined />}>{t('projects.new_project')}</Button>
            </Space>
            <Spin spinning={isLoading}>
                <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 10 }} />
            </Spin>
        </div>
    )
}
