import asyncio
import os
import sys
from datetime import datetime, date, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.user import User, UserRole
from app.models.accounting import Account, AccountType, Invoice, InvoiceStatus, JournalEntry, JournalLine
from app.models.warehouse import Product, Category, Warehouse, StockMovement, MovementType, UnitOfMeasure
from app.models.project import Project, Task, ProjectStatus, TaskStatus, TaskPriority
from app.models.crm import Contact, Lead, Deal, LeadSource, LeadStatus, DealStage
from app.models.hr import Employee, EmployeeStatus, Department

async def seed_presentation_data():
    async with async_session() as session:
        print("Starting comprehensive presentation data seed...")
        
        # Ensure Users exist
        admin = (await session.execute(select(User).where(User.email == "admin@tashkent.erp"))).scalars().first()
        manager = (await session.execute(select(User).where(User.email == "manager@tashkent.erp"))).scalars().first()
        if not admin or not manager:
            print("Run standard seed.py first to create base users!")
            return

        # ==========================================
        # SCENARIO 1: B2B SALES CYCLE & WAREHOUSE
        # ==========================================
        
        # 1. Contact, Lead, Deal
        contact = (await session.execute(select(Contact).where(Contact.email == "ceo@innotech.uz"))).scalars().first()
        if not contact:
            contact = Contact(
                first_name="Алишер", last_name="Икрамов", email="ceo@innotech.uz",
                phone="+998901112233", company="ООО 'InnoTech Solutions'", position="IT Директор",
                address="Mirzo Ulugbek, Tashkent"
            )
            session.add(contact)
            await session.commit()
            print("Created Contact: InnoTech Solutions")

        lead = Lead(
            title="Закупка серверов для ЦОД", contact_name="Alisher Ikramov", email="ceo@innotech.uz",
            phone="+998901112233", company="ООО 'InnoTech Solutions'", source=LeadSource.WEBSITE,
            status=LeadStatus.QUALIFIED, estimated_value=150000000.0, assigned_to=manager.id
        )
        session.add(lead)
        await session.commit()
        
        deal = Deal(
            title="Поставка серверного оборудования", contact_id=contact.id, lead_id=lead.id,
            stage=DealStage.WON, amount=150000000.0, currency="UZS",
            expected_close_date=date.today(), assigned_to=manager.id
        )
        session.add(deal)
        await session.commit()

        # 2. Warehouse & Product
        wh = (await session.execute(select(Warehouse).where(Warehouse.code == "WH-MAIN"))).scalars().first()
        if not wh:
            wh = Warehouse(name="Главный Склад (Юнусабад)", code="WH-MAIN", manager_id=admin.id)
            session.add(wh)
            await session.commit()

        cat = Category(name="Серверное оборудование")
        session.add(cat)
        await session.commit()

        product = Product(
            sku="SVR-DELL-PE", name="Сервер Dell PowerEdge R740", category_id=cat.id,
            unit=UnitOfMeasure.PIECE, purchase_price=50000000.0, selling_price=75000000.0
        )
        session.add(product)
        await session.commit()

        # Input Movement (stocking up)
        mov_in = StockMovement(
            product_id=product.id, warehouse_id=wh.id, type=MovementType.INCOMING, quantity=10,
            unit_price=50000000.0, total_price=500000000.0, document_ref="IN-001", date=date.today() - timedelta(days=5)
        )
        session.add(mov_in)
        
        # Output Movement (sale)
        mov_out = StockMovement(
            product_id=product.id, warehouse_id=wh.id, type=MovementType.OUTGOING, quantity=2,
            unit_price=75000000.0, total_price=150000000.0, document_ref=f"OUT-DEAL-{deal.id}", date=date.today(),
            created_by=manager.id
        )
        session.add(mov_out)
        await session.commit()

        # 3. Invoice
        invoice = Invoice(
            number="INV-2026-042", contact_id=contact.id, contact_name=contact.company,
            date=date.today() - timedelta(days=2), due_date=date.today() + timedelta(days=8),
            status=InvoiceStatus.PAID, subtotal=150000000.0, total=150000000.0, notes="Оплата за 2 сервера Dell"
        )
        session.add(invoice)
        await session.commit()

        # 4. Accounting Entries for the sale
        acc_bank = (await session.execute(select(Account).where(Account.code == "5110"))).scalars().first()
        acc_rev = (await session.execute(select(Account).where(Account.code == "4010"))).scalars().first()
        
        if acc_bank and acc_rev:
            je_sale = JournalEntry(date=date.today(), description="Оплата по счёту INV-2026-042 (Серверы)", is_posted=True, created_by=admin.id)
            session.add(je_sale)
            await session.commit()
            
            session.add(JournalLine(entry_id=je_sale.id, account_id=acc_bank.id, debit=150000000.0, credit=0.0))
            session.add(JournalLine(entry_id=je_sale.id, account_id=acc_rev.id, debit=0.0, credit=150000000.0))
            
            acc_bank.balance += 150000000.0
            acc_rev.balance -= 150000000.0
            await session.commit()


        # ==========================================
        # SCENARIO 2: HR & PAYROLL
        # ==========================================
        dept_it = Department(name="IT Отдел", code="IT-01", description="Разработка и инфраструктура")
        session.add(dept_it)
        await session.commit()

        emp2 = Employee(
            employee_number="EMP-002", first_name="Сардор", last_name="Ахмедов",
            email="sardor.dev@tashkent.erp", phone="+998909876543", hire_date=date.today() - timedelta(days=30),
            department_id=dept_it.id, position="Senior Frontend Developer",
            salary=25000000.0, status=EmployeeStatus.ACTIVE
        )
        session.add(emp2)
        await session.commit()

        # Payroll Accounting entries
        acc_exp = (await session.execute(select(Account).where(Account.code == "9420"))).scalars().first()
        acc_pay = (await session.execute(select(Account).where(Account.code == "6710"))).scalars().first()

        if acc_exp and acc_pay:
            je_payroll = JournalEntry(date=date.today(), description="Начисление ЗП за текущий месяц (IT Отдел)", is_posted=True, created_by=admin.id)
            session.add(je_payroll)
            await session.commit()
            
            session.add(JournalLine(entry_id=je_payroll.id, account_id=acc_exp.id, debit=25000000.0, credit=0.0))
            session.add(JournalLine(entry_id=je_payroll.id, account_id=acc_pay.id, debit=0.0, credit=25000000.0))
            
            acc_exp.balance += 25000000.0
            acc_pay.balance -= 25000000.0
            await session.commit()


        # ==========================================
        # SCENARIO 3: PROJECTS
        # ==========================================
        proj = Project(
            name="Внедрение и настройка ЦОД InnoTech", code="PRJ-INNO-01",
            description="Установка закупленных Dell серверов у клиента", status=ProjectStatus.ACTIVE,
            start_date=date.today(), end_date=date.today() + timedelta(days=14),
            budget=5000000.0, manager_id=admin.id, progress=30
        )
        session.add(proj)
        await session.commit()

        t1 = Task(title="Распаковка и аудит оборудования", project_id=proj.id, status=TaskStatus.DONE, priority=TaskPriority.HIGH, assigned_to=admin.id, estimated_hours=4, actual_hours=5)
        t2 = Task(title="Монтаж в серверную стойку", project_id=proj.id, status=TaskStatus.IN_PROGRESS, priority=TaskPriority.HIGH, estimated_hours=8, actual_hours=2)
        t3 = Task(title="Настройка сетевого окружения", project_id=proj.id, status=TaskStatus.TODO, priority=TaskPriority.MEDIUM)
        
        session.add_all([t1, t2, t3])
        await session.commit()

        # ==========================================
        # SCENARIO 4: NOTIFICATIONS
        # ==========================================
        from app.models.notification import Notification
        
        n_crm = Notification(
            user_id=admin.id, type="success", title="crm.new_lead_title",
            description="crm.new_lead_desc", module="crm", link="/crm/leads"
        )
        n_acc = Notification(
            user_id=admin.id, type="info", title="accounting.invoice_paid_title",
            description="accounting.invoice_paid_desc", module="accounting", link="/accounting/trial-balance"
        )
        n_hr = Notification(
            user_id=admin.id, type="warning", title="hr.vacation_request_title",
            description="hr.vacation_request_desc", module="hr", link="/hr/employees"
        )
        n_wh = Notification(
            user_id=admin.id, type="error", title="warehouse.low_stock_title",
            description="warehouse.low_stock_desc", module="warehouse", link="/warehouse"
        )
        n_proj = Notification(
            user_id=admin.id, type="info", title="projects.new_task_title",
            description="projects.new_task_desc", module="projects", link="/projects"
        )

        session.add_all([n_crm, n_acc, n_hr, n_wh, n_proj])
        await session.commit()

        print("✅ Presentation data generated successfully!")

if __name__ == "__main__":
    asyncio.run(seed_presentation_data())
