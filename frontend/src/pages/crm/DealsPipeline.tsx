import { Tag, Button } from 'antd'
import { PlusOutlined, DollarOutlined } from '@ant-design/icons'

interface Deal {
    id: number; title: string; amount: number; company?: string; probability: number; stage: string
}

const stages = [
    { key: 'new', label: 'Новые', color: '#8884d8' },
    { key: 'negotiation', label: 'Переговоры', color: '#83a6ed' },
    { key: 'proposal', label: 'Предложение', color: '#8dd1e1' },
    { key: 'contract', label: 'Контракт', color: '#82ca9d' },
    { key: 'won', label: 'Выиграно', color: '#52c41a' },
    { key: 'lost', label: 'Проиграно', color: '#ff4d4f' },
]

const deals: Deal[] = [
    { id: 1, title: 'Внедрение ERP TechCorp', amount: 15000000, company: 'TechCorp UZ', probability: 90, stage: 'contract' },
    { id: 2, title: 'CRM BuildPro', amount: 25000000, company: 'BuildPro', probability: 60, stage: 'proposal' },
    { id: 3, title: 'Логистика LogiTrans', amount: 50000000, company: 'LogiTrans', probability: 30, stage: 'new' },
    { id: 4, title: 'Аналитика MediaGroup', amount: 12000000, company: 'MediaGroup', probability: 100, stage: 'won' },
    { id: 5, title: 'Терминал FoodMarket', amount: 8000000, company: 'FoodMarket', probability: 45, stage: 'negotiation' },
    { id: 6, title: 'Обновление CRM TechCorp', amount: 5000000, company: 'TechCorp UZ', probability: 20, stage: 'new' },
    { id: 7, title: 'Мобильное приложение BuildPro', amount: 18000000, company: 'BuildPro', probability: 0, stage: 'lost' },
]

const formatAmount = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)} млн`
    if (v >= 1000) return `${(v / 1000).toFixed(0)} тыс`
    return v.toString()
}

export default function DealsPipeline() {
    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Воронка сделок</h1>
                    <p>Kanban-доска управления сделками</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />}>Новая сделка</Button>
            </div>

            <div className="kanban-board">
                {stages.map(stage => {
                    const stageDeals = deals.filter(d => d.stage === stage.key)
                    const stageTotal = stageDeals.reduce((s, d) => s + d.amount, 0)
                    return (
                        <div className="kanban-column" key={stage.key}>
                            <div className="kanban-column-header" style={{ borderColor: stage.color }}>
                                <h4 style={{ color: stage.color }}>{stage.label}</h4>
                                <Tag style={{ background: 'rgba(99,102,241,0.1)', border: 'none', color: '#94a3b8' }}>{stageDeals.length}</Tag>
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, textAlign: 'center' }}>
                                {formatAmount(stageTotal)} UZS
                            </div>
                            {stageDeals.map(deal => (
                                <div className="kanban-card" key={deal.id}>
                                    <h5>{deal.title}</h5>
                                    <p>{deal.company}</p>
                                    <div className="kanban-card-footer">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#818cf8', fontSize: 13, fontWeight: 600 }}>
                                            <DollarOutlined /> {formatAmount(deal.amount)}
                                        </span>
                                        <Tag color={deal.probability >= 70 ? 'green' : deal.probability >= 40 ? 'orange' : 'red'} style={{ fontSize: 11 }}>
                                            {deal.probability}%
                                        </Tag>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
