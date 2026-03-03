import json
import os

ru_path = r'c:\diplom\frontend\src\i18n\locales\ru.json'
uz_path = r'c:\diplom\frontend\src\i18n\locales\uz.json'

with open(ru_path, 'r', encoding='utf-8') as f: ru = json.load(f)
with open(uz_path, 'r', encoding='utf-8') as f: uz = json.load(f)

new_keys = {
    'accounting': {
        'subtotal_no_nds': 'Сумма без НДС',
        'nds_rate': 'Ставка НДС %',
        'nds_amount': 'Сумма НДС',
        'currency': 'Валюта',
        'buyer_inn': 'ИНН покупателя',
        'supplier_inn': 'ИНН поставщика',
        'contract_number': 'Договор №',
        'invoice_print_title': 'СЧЁТ-ФАКТУРА №',
        'supplier': 'Поставщик (ИНН)',
        'buyer': 'Покупатель',
        'calculation': 'Расчёт',
        'nds': 'НДС',
        'without_nds': 'Без НДС',
        'print_invoice': 'Печать счёт-фактуры',
        'director': 'Руководитель',
        'accountant': 'Бухгалтер',
        'payment_methods': {
            'bank_transfer': 'Банковский перевод',
            'cash': 'Наличные',
            'card': 'Карта'
        }
    },
    'documents': {
        'status_changed': 'Статус →'
    }
}

for section, keys in new_keys.items():
    if section not in ru: ru[section] = {}
    if section not in uz: uz[section] = {}
    for k, v in keys.items():
        if isinstance(v, dict):
            if k not in ru[section]: ru[section][k] = {}
            if k not in uz[section]: uz[section][k] = {}
            for sub_k, sub_v in v.items():
                ru[section][k][sub_k] = sub_v
                # We'll just put the RU value in UZ as a placeholder to be translated later, Or translate basic ones
                uz[section][k][sub_k] = f'[UZ] {sub_v}'
        else:
            ru[section][k] = v
            uz[section][k] = f'[UZ] {v}'

# Some manual translations for UZ to make it look better
uz['accounting']['payment_methods'] = {
    'bank_transfer': 'Bank o\'tkazmasi',
    'cash': 'Naqd pul',
    'card': 'Karta'
}
uz['accounting']['subtotal_no_nds'] = 'QQSsiz summa'
uz['accounting']['nds_rate'] = 'QQS stavkasi %'
uz['accounting']['nds_amount'] = 'QQS summasi'
uz['accounting']['currency'] = 'Valyuta'
uz['accounting']['buyer_inn'] = 'Xaridor STIR(INN)'
uz['accounting']['supplier_inn'] = 'Yetkazib beruvchi STIR(INN)'
uz['accounting']['contract_number'] = 'Shartnoma №'
uz['accounting']['invoice_print_title'] = 'HISOB-FAKTURA №'
uz['accounting']['supplier'] = 'Yetkazib beruvchi (STIR)'
uz['accounting']['buyer'] = 'Xaridor'
uz['accounting']['calculation'] = 'Hisob-kitob'
uz['accounting']['nds'] = 'QQS'
uz['accounting']['without_nds'] = 'QQSsiz'
uz['accounting']['print_invoice'] = 'Hisob-fakturani chop etish'
uz['accounting']['director'] = 'Rahbar'
uz['accounting']['accountant'] = 'Buxgalter'
uz['documents']['status_changed'] = 'Holat →'

with open(ru_path, 'w', encoding='utf-8') as f: json.dump(ru, f, ensure_ascii=False, indent=4)
with open(uz_path, 'w', encoding='utf-8') as f: json.dump(uz, f, ensure_ascii=False, indent=4)
print('JSON updated successfully')
