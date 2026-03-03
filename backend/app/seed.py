"""
Seed script for populating the database with demo data.

Usage:
    cd backend
    python -m app.seed

Requires a running PostgreSQL instance. Uses DATABASE_URL from .env.
"""
import asyncio
from datetime import date, datetime, timezone, timedelta
from app.database import async_session, engine
from app.models.user import User, UserRole
from app.models.hr import Employee, Department, EmployeeStatus
from app.models.crm import Contact, Lead, Deal, LeadStatus, DealStage, LeadSource
from app.models.accounting import Account, AccountType, Invoice, InvoiceStatus
from app.models.warehouse import Product, Category, Warehouse
from app.models.project import Project, Task
from app.core.security import hash_password
from sqlalchemy import select


async def seed():
    """Populate the database with demo data."""
    async with async_session() as db:
        # Check if already seeded
        result = await db.execute(select(Department))
        if result.scalars().first():
            print("Database already has data. Skipping seed.")
            return

        print("Seeding database...")

        # ---- Departments ----
        departments = [
            Department(name="IT и Разработка", code="IT", description="Отдел информационных технологий"),
            Department(name="Продажи", code="SALES", description="Отдел продаж"),
            Department(name="Бухгалтерия", code="ACC", description="Финансовый отдел"),
            Department(name="HR и Кадры", code="HR", description="Управление персоналом"),
            Department(name="Логистика", code="LOG", description="Склад и логистика"),
        ]
        for d in departments:
            db.add(d)
        await db.flush()

        # ---- Employees ----
        employees = [
            Employee(employee_number="EMP-001", first_name="Алишер", last_name="Усманов",
                     email="alisher@erp.local", phone="+998901234001",
                     hire_date=date(2024, 3, 15), department_id=departments[0].id,
                     position="Senior Developer", salary=12000000, status=EmployeeStatus.ACTIVE),
            Employee(employee_number="EMP-002", first_name="Сардор", last_name="Абдуллаев",
                     email="sardor@erp.local", phone="+998901234002",
                     hire_date=date(2024, 6, 1), department_id=departments[1].id,
                     position="Менеджер по продажам", salary=8000000, status=EmployeeStatus.ACTIVE),
            Employee(employee_number="EMP-003", first_name="Дурдона", last_name="Шомуродова",
                     email="durdona@erp.local", phone="+998901234003",
                     hire_date=date(2025, 1, 10), department_id=departments[2].id,
                     position="Бухгалтер", salary=9000000, status=EmployeeStatus.ACTIVE),
            Employee(employee_number="EMP-004", first_name="Тимур", last_name="Каримов",
                     email="timur@erp.local", phone="+998901234004",
                     hire_date=date(2025, 4, 20), department_id=departments[3].id,
                     position="HR-менеджер", salary=7500000, status=EmployeeStatus.ACTIVE),
        ]
        for e in employees:
            db.add(e)

        # ---- CRM: Contacts ----
        contacts = [
            Contact(first_name="Джамшид", last_name="Рахимов", email="jamshid@client.uz",
                    phone="+998935551001", company="TechStart UZ"),
            Contact(first_name="Нигора", last_name="Исмаилова", email="nigora@partner.uz",
                    phone="+998935551002", company="Global Trade"),
        ]
        for c in contacts:
            db.add(c)

        # ---- CRM: Leads ----
        leads = [
            Lead(title="Внедрение ERP для TexnoMarket", contact_name="Бахтиёр Сафаров",
                 phone="+998901112233", source=LeadSource.WEBSITE, status=LeadStatus.NEW, estimated_value=50000000),
            Lead(title="CRM для сети клиник", contact_name="Зарина Каримова",
                 email="zarina@clinics.uz", source=LeadSource.REFERRAL, status=LeadStatus.QUALIFIED, estimated_value=120000000),
        ]
        for l in leads:
            db.add(l)

        # ---- CRM: Deals ----
        deals = [
            Deal(title="Поставка оборудования для TexnoMarket", stage=DealStage.PROPOSAL,
                 amount=75000000, probability=60),
            Deal(title="Годовой контракт на сопровождение", stage=DealStage.NEW,
                 amount=36000000, probability=30),
        ]
        for d in deals:
            db.add(d)

        # ---- Accounting: НСБУ Plan of Accounts (Uzbekistan) ----
        accounts = [
            # 01-08: Долгосрочные активы
            Account(code="0100", name="Основные средства", type=AccountType.ASSET, balance=500000000),
            Account(code="0200", name="Нематериальные активы", type=AccountType.ASSET, balance=0),
            Account(code="0400", name="Амортизация основных средств", type=AccountType.ASSET, balance=0),
            Account(code="0500", name="Амортизация нематериальных активов", type=AccountType.ASSET, balance=0),
            Account(code="0800", name="Долгосрочные инвестиции", type=AccountType.ASSET, balance=0),
            # 10-19: Запасы
            Account(code="1000", name="Материалы", type=AccountType.ASSET, balance=0),
            Account(code="1010", name="Сырьё и материалы", type=AccountType.ASSET, balance=0),
            Account(code="1500", name="Заготовление и приобретение", type=AccountType.ASSET, balance=0),
            Account(code="2800", name="Готовая продукция", type=AccountType.ASSET, balance=0),
            Account(code="2900", name="Товары", type=AccountType.ASSET, balance=0),
            # 40-49: Расчёты
            Account(code="4010", name="Счета к получению (дебиторы)", type=AccountType.ASSET, balance=0),
            Account(code="4110", name="Авансы выданные", type=AccountType.ASSET, balance=0),
            Account(code="4310", name="Авансы полученные", type=AccountType.LIABILITY, balance=0),
            Account(code="4410", name="Задолженность по заработной плате", type=AccountType.LIABILITY, balance=0),
            # 50-52: Денежные средства
            Account(code="5010", name="Касса (UZS)", type=AccountType.ASSET, balance=0),
            Account(code="5020", name="Касса (валютная)", type=AccountType.ASSET, balance=0),
            Account(code="5110", name="Расчётный счёт", type=AccountType.ASSET, balance=150000000),
            Account(code="5210", name="Валютный счёт", type=AccountType.ASSET, balance=0),
            # 60: Поставщики
            Account(code="6010", name="Поставщики и подрядчики", type=AccountType.LIABILITY, balance=45000000),
            # 63-65: Налоги и сборы
            Account(code="6410", name="Задолженность по НДС", type=AccountType.LIABILITY, balance=0),
            Account(code="6520", name="Задолженность по НДФЛ", type=AccountType.LIABILITY, balance=0),
            Account(code="6530", name="Задолженность по ИНПС", type=AccountType.LIABILITY, balance=0),
            # 80-85: Собственный капитал
            Account(code="8010", name="Уставный капитал", type=AccountType.EQUITY, balance=200000000),
            Account(code="8710", name="Нераспределённая прибыль", type=AccountType.EQUITY, balance=0),
            # 90: Доходы
            Account(code="9010", name="Доход от реализации продукции", type=AccountType.REVENUE, balance=180000000),
            Account(code="9020", name="Доход от оказания услуг", type=AccountType.REVENUE, balance=0),
            # 94-95: Расходы
            Account(code="9410", name="Расходы на оплату труда", type=AccountType.EXPENSE, balance=64000000),
            Account(code="9420", name="Начисления на оплату труда", type=AccountType.EXPENSE, balance=0),
            Account(code="9430", name="Амортизация", type=AccountType.EXPENSE, balance=0),
        ]
        for a in accounts:
            db.add(a)

        # ---- Accounting: Invoices ----
        invoices = [
            Invoice(number="INV-2026-001", client_name="TechStart UZ",
                    total=25000000, tax=3000000, subtotal=22000000,
                    date=date(2026, 1, 15), due_date=date(2026, 2, 15),
                    status=InvoiceStatus.PAID),
            Invoice(number="INV-2026-002", client_name="Global Trade",
                    total=40000000, tax=4800000, subtotal=35200000,
                    date=date(2026, 2, 1), due_date=date(2026, 3, 1),
                    status=InvoiceStatus.SENT),
        ]
        for i in invoices:
            db.add(i)

        # ---- Warehouse ----
        category = Category(name="Электроника")
        db.add(category)
        await db.flush()

        warehouse = Warehouse(name="Основной склад", code="WH-01", address="Ташкент, Мирзо-Улугбек 15")
        db.add(warehouse)
        await db.flush()

        products = [
            Product(name='Монитор 27" 4K', sku="MON-27-4K", quantity=15, price=4500000,
                    cost_price=3800000, min_stock=5, category_id=category.id, warehouse_id=warehouse.id),
            Product(name="Клавиатура механическая", sku="KB-MECH-01", quantity=50, price=850000,
                    cost_price=600000, min_stock=10, category_id=category.id, warehouse_id=warehouse.id),
        ]
        for p in products:
            db.add(p)

        # ---- Projects ----
        project = Project(name="ERP System v2.0", description="Разработка второй версии ERP-системы",
                          status="active", budget=500000000,
                          start_date=date(2026, 1, 1), end_date=date(2026, 6, 30))
        db.add(project)
        await db.flush()

        tasks = [
            Task(title="Модуль авторизации", description="Реализация JWT-аутентификации",
                 project_id=project.id, status="done", priority="high"),
            Task(title="Модуль CRM", description="CRUD для контактов, лидов, сделок",
                 project_id=project.id, status="in_progress", priority="high"),
            Task(title="Модуль аналитики", description="Дашборды и отчёты",
                 project_id=project.id, status="todo", priority="medium"),
        ]
        for t in tasks:
            db.add(t)

        await db.commit()
        print("Seed completed! Created:")
        print(f"  - {len(departments)} departments")
        print(f"  - {len(employees)} employees")
        print(f"  - {len(contacts)} contacts")
        print(f"  - {len(leads)} leads")
        print(f"  - {len(deals)} deals")
        print(f"  - {len(accounts)} accounts")
        print(f"  - {len(invoices)} invoices")
        print(f"  - {len(products)} products")
        print(f"  - 1 project with {len(tasks)} tasks")


if __name__ == "__main__":
    asyncio.run(seed())
