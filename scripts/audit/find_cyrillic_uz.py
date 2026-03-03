import json
import re

uz_path = r'c:\diplom\frontend\src\i18n\locales\uz.json'
with open(uz_path, 'r', encoding='utf-8') as f:
    uz = json.load(f)

cyrillic = re.compile(r'[А-Яа-яЁё]+')
issues = {}

def find_cyrillic(d, path=''):
    for k, v in d.items():
        curr_path = f'{path}.{k}' if path else k
        if isinstance(v, dict):
            find_cyrillic(v, curr_path)
        elif isinstance(v, str):
            if cyrillic.search(v):
                issues[curr_path] = v

find_cyrillic(uz)
print(f'Found {len(issues)} keys in uz.json that contain Cyrillic text!')

with open(r'c:\diplom\uz_cyrillic_issues.json', 'w', encoding='utf-8') as f:
    json.dump(issues, f, ensure_ascii=False, indent=4)
