import json
import os

ru_path = r'c:\diplom\frontend\src\i18n\locales\ru.json'
uz_path = r'c:\diplom\frontend\src\i18n\locales\uz.json'

with open(ru_path, 'r', encoding='utf-8') as f: ru = json.load(f)
with open(uz_path, 'r', encoding='utf-8') as f: uz = json.load(f)

translations = {
    'hr': { 'employees': ('Сотрудники', 'Xodimlar') },
    'layout': { 'crm_activities': ('Активности', 'Faoliyatlar') },
    'contacts': { 
        '9_digits': ('9 цифр', '9 raqam'),
        'org_placeholder': ('ООО «Название»', 'MChJ «Nomi»'),
        'address_placeholder': ('г. Ташкент, ...', 'Toshkent sh., ...')
    },
    'common': {
        'fields': ('полей', 'maydon'),
        'h': ('ч', 's')
    },
    'documents': {
        'no_templates': ('Нет шаблонов', 'Shablonlar yo\'q')
    },
    'settings': {
        'currency_uzs': ('UZS (Сум)', 'UZS (So\'m)'),
        'currency_usd': ('USD (Доллар)', 'USD (Dollar)'),
        'currency_eur': ('EUR (Евро)', 'EUR (Yevro)'),
        'tz_tash': ('UTC+5 (Ташкент)', 'UTC+5 (Toshkent)'),
        'tz_moscow': ('UTC+3 (Москва)', 'UTC+3 (Moskva)')
    },
    'dashboard': {
        'months': {
            'jan': ('Январь', 'Yanvar'),
            'mar': ('Март', 'Mart'),
            'apr': ('Апрель', 'Aprel'),
            'jun': ('Июнь', 'Iyun'),
            'jul': ('Июль', 'Iyul'),
            'sep': ('Сентябрь', 'Sentabr'),
            'oct': ('Октябрь', 'Oktabr'),
            'dec': ('Декабрь', 'Dekabr')
        }
    }
}

def inject(d_ru, d_uz, t_dict):
    for k, v in t_dict.items():
        if isinstance(v, dict):
            if k not in d_ru: d_ru[k] = {}
            if k not in d_uz: d_uz[k] = {}
            inject(d_ru[k], d_uz[k], v)
        else:
            d_ru[k] = v[0]
            d_uz[k] = v[1]

inject(ru, uz, translations)

with open(ru_path, 'w', encoding='utf-8') as f: json.dump(ru, f, ensure_ascii=False, indent=4)
with open(uz_path, 'w', encoding='utf-8') as f: json.dump(uz, f, ensure_ascii=False, indent=4)
print('Successfully injected missing keys into ru.json and uz.json')
