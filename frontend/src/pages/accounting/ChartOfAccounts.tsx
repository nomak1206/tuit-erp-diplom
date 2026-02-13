import { Tree, Card, Tag, Row, Col, Statistic } from 'antd'
import { AccountBookOutlined } from '@ant-design/icons'

const typeColors: Record<string, string> = { asset: 'blue', liability: 'red', equity: 'green', revenue: 'purple', expense: 'orange' }
const typeLabels: Record<string, string> = { asset: 'Актив', liability: 'Пассив', equity: 'Капитал', revenue: 'Доход', expense: 'Расход' }

const treeData = [
    {
        title: '0100 — Основные средства', key: '0100', tag: 'asset', balance: 150000000, children: [
            { title: '0110 — Здания и сооружения', key: '0110', tag: 'asset', balance: 100000000 },
            { title: '0120 — Оборудование', key: '0120', tag: 'asset', balance: 50000000 },
        ]
    },
    { title: '5000 — Расчётный счёт', key: '5000', tag: 'asset', balance: 85000000 },
    { title: '5100 — Касса', key: '5100', tag: 'asset', balance: 5000000 },
    { title: '6000 — Расчёты с поставщиками', key: '6000', tag: 'liability', balance: 12000000 },
    { title: '6200 — Расчёты с покупателями', key: '6200', tag: 'asset', balance: 28000000 },
    { title: '7000 — Доходы от реализации', key: '7000', tag: 'revenue', balance: 95000000 },
    { title: '8000 — Себестоимость продукции', key: '8000', tag: 'expense', balance: 45000000 },
    { title: '8100 — Административные расходы', key: '8100', tag: 'expense', balance: 22000000 },
    { title: '8500 — Уставный капитал', key: '8500', tag: 'equity', balance: 200000000 },
]

const renderTitle = (node: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '4px 0' }}>
        <span style={{ fontWeight: 500 }}>{node.title}</span>
        <div style={{ display: 'flex', gap: 8 }}>
            <Tag color={typeColors[node.tag]}>{typeLabels[node.tag]}</Tag>
            <span style={{ color: '#94a3b8', fontSize: 12, minWidth: 100, textAlign: 'right' }}>{(node.balance / 1000000).toFixed(1)} млн</span>
        </div>
    </div>
)

export default function ChartOfAccounts() {
    return (
        <div className="fade-in">
            <div className="page-header"><h1>План счетов</h1><p>Структура бухгалтерских счетов (1С-style)</p></div>
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={6}><Card bordered={false}><Statistic title="Всего счетов" value={11} prefix={<AccountBookOutlined />} /></Card></Col>
                <Col span={6}><Card bordered={false}><Statistic title="Активы" value="268 млн" valueStyle={{ color: '#6366f1' }} /></Card></Col>
                <Col span={6}><Card bordered={false}><Statistic title="Доходы" value="95 млн" valueStyle={{ color: '#52c41a' }} /></Card></Col>
                <Col span={6}><Card bordered={false}><Statistic title="Расходы" value="67 млн" valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
            </Row>
            <Card bordered={false} className="account-tree">
                <Tree
                    showLine
                    defaultExpandAll
                    treeData={treeData.map(node => ({
                        ...node,
                        title: renderTitle(node),
                        key: node.key,
                        children: node.children?.map(child => ({ ...child, title: renderTitle(child), key: child.key })),
                    }))}
                />
            </Card>
        </div>
    )
}
