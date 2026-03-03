import asyncio
from app.database import async_session
from app.models.accounting import Account, AccountType
from sqlalchemy import select

async def load_nsbu():
    async with async_session() as db:
        result = await db.execute(select(Account))
        existing = result.scalars().all()
        existing_codes = {a.code for a in existing}
        accounts = [
            ("0100", "Основные средства", AccountType.ASSET, 500000000),
            ("0200", "Нематериальные активы", AccountType.ASSET, 0),
            ("0400", "Амортизация основных средств", AccountType.ASSET, 0),
            ("0500", "Амортизация нематер. активов", AccountType.ASSET, 0),
            ("0800", "Долгосрочные инвестиции", AccountType.ASSET, 0),
            ("1000", "Материалы", AccountType.ASSET, 0),
            ("1010", "Сырье и материалы", AccountType.ASSET, 0),
            ("1500", "Заготовление и приобретение", AccountType.ASSET, 0),
            ("2800", "Готовая продукция", AccountType.ASSET, 0),
            ("2900", "Товары", AccountType.ASSET, 0),
            ("4010", "Счета к получению", AccountType.ASSET, 0),
            ("4110", "Авансы выданные", AccountType.ASSET, 0),
            ("4310", "Авансы полученные", AccountType.LIABILITY, 0),
            ("4410", "Задолженность по зарплате", AccountType.LIABILITY, 0),
            ("5010", "Касса (UZS)", AccountType.ASSET, 0),
            ("5020", "Касса (валютная)", AccountType.ASSET, 0),
            ("5110", "Расчетный счет", AccountType.ASSET, 150000000),
            ("5210", "Валютный счет", AccountType.ASSET, 0),
            ("6010", "Поставщики и подрядчики", AccountType.LIABILITY, 45000000),
            ("6410", "Задолженность по НДС", AccountType.LIABILITY, 0),
            ("6520", "Задолженность по НДФЛ", AccountType.LIABILITY, 0),
            ("6530", "Задолженность по ИНПС", AccountType.LIABILITY, 0),
            ("8010", "Уставный капитал", AccountType.EQUITY, 200000000),
            ("8710", "Нераспределенная прибыль", AccountType.EQUITY, 0),
            ("9010", "Доход от реализации", AccountType.REVENUE, 180000000),
            ("9020", "Доход от оказания услуг", AccountType.REVENUE, 0),
            ("9410", "Расходы на оплату труда", AccountType.EXPENSE, 64000000),
            ("9420", "Начисления на оплату труда", AccountType.EXPENSE, 0),
            ("9430", "Амортизация", AccountType.EXPENSE, 0),
        ]
        added = 0
        for code, name, atype, bal in accounts:
            if code not in existing_codes:
                db.add(Account(code=code, name=name, type=atype, balance=bal))
                added += 1
        await db.commit()
        print(f"Added {added} NSBU accounts (skipped {len(existing_codes)} existing)")

asyncio.run(load_nsbu())
