import json
import os

uz_path = r'c:\diplom\frontend\src\i18n\locales\uz.json'
with open(uz_path, 'r', encoding='utf-8') as f:
    uz = json.load(f)

translations = {
    'layout': { 'acc_payments': 'To\'lovlar' },
    'crm': {
        'title': 'CRM — Umumiy ko\'rinish',
        'activities': 'Faoliyatlar',
        'subject': 'Mavzu / Tavsif',
        'contact': 'Mijoz',
        'deal': 'Bitim'
    },
    'hr_dashboard': {
        'vacation_request_title': 'Ta\'til uchun ariza',
        'vacation_request_desc': 'Xodimdan ta\'til uchun yangi ariza'
    },
    'accounting': {
        'payment_method': 'To\'lov usuli',
        'payments': 'To\'lovlar',
        'invoice': 'Hisob-faktura'
    }
}

for section, keys in translations.items():
    if section not in uz: uz[section] = {}
    for k, v in keys.items():
        uz[section][k] = v

with open(uz_path, 'w', encoding='utf-8') as f:
    json.dump(uz, f, ensure_ascii=False, indent=4)

print('UZ Translations fixed')
