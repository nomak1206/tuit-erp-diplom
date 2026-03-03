import json
import os

uz_path = r'c:\diplom\frontend\src\i18n\locales\uz.json'
with open(uz_path, 'r', encoding='utf-8') as f:
    uz = json.load(f)

issues = []
def find_uz(d, path=''):
    for k, v in d.items():
        if isinstance(v, dict):
            find_uz(v, f'{path}.{k}' if path else k)
        elif isinstance(v, str):
            # Check if it has [UZ] or contains cyrillic
            import re
            if '[UZ]' in v or re.search(r'[А-Яа-яЁё]', v):
                issues.append((f'{path}.{k}' if path else k, v))

find_uz(uz)

out_path = r'c:\diplom\uz_to_translate.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(dict(issues), f, ensure_ascii=False, indent=4)

print(f"Found {len(issues)} items needing translation in UZ.")
print(f"Saved to {out_path}")
