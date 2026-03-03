import json

ru_path = r'c:\diplom\frontend\src\i18n\locales\ru.json'
with open(ru_path, 'r', encoding='utf-8') as f: ru = json.load(f)
ru['common']['notes'] = 'Заметки'
with open(ru_path, 'w', encoding='utf-8') as f: json.dump(ru, f, ensure_ascii=False, indent=4)

uz_path = r'c:\diplom\frontend\src\i18n\locales\uz.json'
with open(uz_path, 'r', encoding='utf-8') as f: uz = json.load(f)
uz['common']['notes'] = 'Eslatmalar'
with open(uz_path, 'w', encoding='utf-8') as f: json.dump(uz, f, ensure_ascii=False, indent=4)

print('Added common.notes to both RU and UZ.')
