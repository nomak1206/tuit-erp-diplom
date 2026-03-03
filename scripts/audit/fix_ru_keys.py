import json
import os

ru_path = r'c:\diplom\frontend\src\i18n\locales\ru.json'
with open(ru_path, 'r', encoding='utf-8') as f:
    ru = json.load(f)

# The following were accidentally overwritten with Uzbek in ru.json
fixes = {
    'layout': {
        'help_text': 'ERP System v2.0 — Корпоративная система управления предприятием. \n\nПоддержка: admin@erp.uz',
        'logout_confirm': 'Вы действительно хотите выйти?',
        'logout_success': 'Вы вышли из системы',
    },
    'crm': {
        'lead_statuses': {
            'proposal': 'Предложение'
        }
    },
    'leads': {
        'sources': {
            'other': 'Прочее'
        }
    },
    'accounting': {
        'all_sections': 'Все разделы',
        'account_groups': {
            '01': 'Основные средства',
            '02': 'Износ основных средств',
            '04': 'Нематериальные активы',
            '10': 'Материалы',
            '28': 'Готовая продукция',
            '31': 'Расходы будущих периодов',
            '40': 'Счета к получению',
            '50': 'Касса',
            '60': 'Счета к оплате',
            '64': 'Задолженность по налогам',
            '67': 'Задолженность по оплате труда',
            '83': 'Уставный капитал',
            '87': 'Нераспределенная прибыль',
            '90': 'Доходы от основной деятельности',
            '91': 'Доходы от реализации ОС',
            '94': 'Расходы периода',
            '99': 'Конечный финансовый результат'
        }
    },
    'warehouse': {
        'inventory_desc': 'Фактическая проверка остатков'
    },
    'projects': {
        'priorities': {
            'urgent': 'Срочный'
        }
    },
    'documents': {
        'edit_document': 'Редактировать документ'
    },
    'settings': {
        'lang_ru': 'Русский',
        'lang_uz': 'O\'zbekcha'
    },
    'staffing': {
        'position': 'Должность',
        'schedule': 'График'
    },
    'hr': {
        'title': 'Кадры и персонал — Обзор',
        'vacation_request_title': 'Заявка на отпуск',
        'vacation_request_desc': 'Новая заявка на отпуск от сотрудника'
    }
}

def apply_fixes(d, fixes_dict):
    for k, v in fixes_dict.items():
        if isinstance(v, dict):
            if k in d:
                apply_fixes(d[k], v)
        else:
            if k in d:
                d[k] = v

apply_fixes(ru, fixes)

# Fix top-level keys that were added mistakenly
for key in ["Генеральный директор", "Руководитель отдела продаж", "Менеджер по работе с клиентами", "Менеджер по продажам"]:
    if key in ru:
        ru[key] = key

with open(ru_path, 'w', encoding='utf-8') as f:
    json.dump(ru, f, ensure_ascii=False, indent=4)

print('Successfully fixed ru.json')
