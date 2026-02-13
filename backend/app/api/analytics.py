from fastapi import APIRouter

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def get_dashboard_data():
    """Main dashboard data for the ERP system"""
    return {
        "kpi": {
            "total_revenue": 95000000,
            "revenue_change": 12.5,
            "total_deals": 7,
            "deals_change": 3,
            "active_projects": 3,
            "total_employees": 10,
            "pending_tasks": 4,
            "overdue_invoices": 1,
        },
        "revenue_chart": [
            {"month": "Авг", "revenue": 45000000, "expenses": 32000000},
            {"month": "Сен", "revenue": 52000000, "expenses": 35000000},
            {"month": "Окт", "revenue": 61000000, "expenses": 38000000},
            {"month": "Ноя", "revenue": 58000000, "expenses": 40000000},
            {"month": "Дек", "revenue": 72000000, "expenses": 42000000},
            {"month": "Янв", "revenue": 85000000, "expenses": 45000000},
            {"month": "Фев", "revenue": 95000000, "expenses": 48000000},
        ],
        "pipeline_summary": [
            {"stage": "Новые", "count": 2, "amount": 10000000, "color": "#8884d8"},
            {"stage": "Переговоры", "count": 1, "amount": 8000000, "color": "#83a6ed"},
            {"stage": "Предложение", "count": 1, "amount": 25000000, "color": "#8dd1e1"},
            {"stage": "Контракт", "count": 1, "amount": 15000000, "color": "#82ca9d"},
            {"stage": "Выиграно", "count": 1, "amount": 12000000, "color": "#52c41a"},
            {"stage": "Проиграно", "count": 1, "amount": 18000000, "color": "#ff4d4f"},
        ],
        "recent_activities": [
            {"id": 1, "icon": "phone", "title": "Звонок Азизу Каримову", "time": "2 часа назад", "type": "call"},
            {"id": 2, "icon": "file", "title": "Создан счёт INV-2026-003", "time": "5 часов назад", "type": "invoice"},
            {"id": 3, "icon": "user", "title": "Новый сотрудник: Анна Волкова", "time": "Вчера", "type": "hr"},
            {"id": 4, "icon": "check", "title": "Задача «Дизайн БД» завершена", "time": "Вчера", "type": "task"},
            {"id": 5, "icon": "dollar", "title": "Оплата от TechCorp — 17 250 000 UZS", "time": "3 дня назад", "type": "payment"},
        ],
        "department_stats": [
            {"name": "IT-отдел", "employees": 3, "budget_used": 65},
            {"name": "Продажи", "employees": 3, "budget_used": 42},
            {"name": "Бухгалтерия", "employees": 2, "budget_used": 80},
            {"name": "HR", "employees": 1, "budget_used": 35},
            {"name": "Склад", "employees": 1, "budget_used": 55},
        ],
    }


@router.get("/sales")
async def get_sales_analytics():
    return {
        "monthly_sales": [
            {"month": "Янв", "deals_won": 2, "revenue": 22000000},
            {"month": "Фев", "deals_won": 1, "revenue": 12000000},
        ],
        "conversion_funnel": [
            {"stage": "Лиды", "count": 5},
            {"stage": "Квалифицировано", "count": 3},
            {"stage": "Предложение", "count": 2},
            {"stage": "Продажа", "count": 1},
        ],
        "top_managers": [
            {"name": "Бобур Ахмедов", "deals": 4, "revenue": 45000000},
            {"name": "Гулнора Маматова", "deals": 2, "revenue": 20000000},
        ],
    }
