import asyncio
import os
import sys
from datetime import datetime, date, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Add the parent directory to sys.path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.hr import Department, Employee, EmployeeStatus, Timesheet
from app.models.crm import Contact, Lead, Deal, LeadSource, LeadStatus, DealStage

async def seed_data():
    async with async_session() as session:
        print("Starting seed process for Uzbekistan/Tashkent...")
        
        # 1. Create Users
        admin_email = "admin@tashkent.erp"
        result = await session.execute(select(User).where(User.email == admin_email))
        admin_user = result.scalars().first()
        
        if not admin_user:
            admin_user = User(
                email=admin_email,
                username="admin_tashkent",
                hashed_password=hash_password("admin123"),
                full_name="Алишер Усманов",  # Localized name
                role=UserRole.ADMIN,
                phone="+998901234567",
                position="Генеральный Директор",
                department="Администрация",
                is_superuser=True
            )
            session.add(admin_user)
            await session.commit()
            print("Created Admin User: Алишер Усманов")
            
        manager_email = "manager@tashkent.erp"
        result = await session.execute(select(User).where(User.email == manager_email))
        manager_user = result.scalars().first()
        
        if not manager_user:
            manager_user = User(
                email=manager_email,
                username="manager_tashkent",
                hashed_password=hash_password("manager123"),
                full_name="Дурдона Шомуродова",
                role=UserRole.MANAGER,
                phone="+998939876543",
                position="Руководитель отдела продаж",
                department="Продажи"
            )
            session.add(manager_user)
            await session.commit()
            print("Created Manager User: Дурдона Шомуродова")

        # 2. Create Departments
        hr_dept_code = "HR-01"
        result = await session.execute(select(Department).where(Department.code == hr_dept_code))
        hr_dept = result.scalars().first()
        
        if not hr_dept:
            hr_dept = Department(
                name="Отдел Кадров Ташкент",
                code=hr_dept_code,
                head_id=admin_user.id,
                description="Центральный отдел кадров"
            )
            session.add(hr_dept)
            
            sales_dept = Department(
                name="Отдел Продаж (Юнусабад)",
                code="SALES-01",
                head_id=manager_user.id,
                description="Отдел активных продаж в Ташкенте"
            )
            session.add(sales_dept)
            await session.commit()
            print("Created Departments: HR and Sales")

        # 3. Create Employees
        emp_number = "EMP-001"
        result = await session.execute(select(Employee).where(Employee.employee_number == emp_number))
        emp = result.scalars().first()
        
        if not emp:
            # We assume sales_dept and hr_dept were just created or fetched
            result = await session.execute(select(Department).where(Department.code == "SALES-01"))
            sales_dept = result.scalars().first()
            
            emp1 = Employee(
                employee_number="EMP-001",
                first_name="Сардор",
                last_name="Абдуллаев",
                middle_name="Улугбекович",
                email="sardor@tashkent.erp",
                phone="+998971112233",
                birth_date=date(1990, 5, 15),
                hire_date=date(2023, 1, 10),
                department_id=sales_dept.id if sales_dept else None,
                position="Менеджер по работе с клиентами",
                salary=8000000.0, # UZS
                status=EmployeeStatus.ACTIVE,
                address="г. Ташкент, Мирзо-Улугбекский район, ул. Паркентская, 10",
                passport_data="AA1234567",
                inn="123456789",
                user_id=manager_user.id
            )
            session.add(emp1)
            await session.commit()
            print("Created Employee: Сардор Абдуллаев")

            # Create Timesheet for this employee
            ts = Timesheet(
                employee_id=emp1.id,
                date=date.today() - timedelta(days=1),
                hours_worked=8.0
            )
            session.add(ts)
            await session.commit()

        # 4. Create CRM Data
        contact_title = "Тимур Каримов"
        result = await session.execute(select(Contact).where(Contact.first_name == "Тимур", Contact.last_name == "Каримов"))
        contact = result.scalars().first()
        
        if not contact:
            contact = Contact(
                first_name="Тимур",
                last_name="Каримов",
                email="timur.k@it-company.uz",
                phone="+998909998877",
                company="ООО 'Tashkent Tech Solutions'",
                position="Директор",
                address="г. Ташкент, Шайхантахурский район, ул. Навои",
                notes="Потенциальный VIP клиент"
            )
            session.add(contact)
            await session.commit()
            print("Created Contact: Тимур Каримов")

            lead = Lead(
                title="Внедрение ERP Системы - Tashkent Tech",
                contact_name="Тимур Каримов",
                email="timur.k@it-company.uz",
                phone="+998909998877",
                company="ООО 'Tashkent Tech Solutions'",
                source=LeadSource.REFERRAL,
                status=LeadStatus.QUALIFIED,
                score=85,
                estimated_value=150000000.0,
                assigned_to=manager_user.id
            )
            session.add(lead)
            await session.commit()
            print("Created Lead: Внедрение ERP Системы")

            deal = Deal(
                title="Поставка оборудования и ERP (Учтепа)",
                contact_id=contact.id,
                lead_id=lead.id,
                stage=DealStage.NEGOTIATION,
                amount=85000000.0,
                currency="UZS",
                probability=70,
                expected_close_date=date.today() + timedelta(days=14),
                description="Ожидается подтверждение контракта от коммерческого директора",
                assigned_to=manager_user.id
            )
            session.add(deal)
            await session.commit()
            print("Created Deal: Поставка оборудования и ERP")
            
        print("Done seeding the database.")

if __name__ == "__main__":
    asyncio.run(seed_data())
