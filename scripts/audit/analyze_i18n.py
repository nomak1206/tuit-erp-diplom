import json

ru_path = r'c:\diplom\frontend\src\i18n\locales\ru.json'
uz_path = r'c:\diplom\frontend\src\i18n\locales\uz.json'

with open(ru_path, 'r', encoding='utf-8') as f: ru = json.load(f)
with open(uz_path, 'r', encoding='utf-8') as f: uz = json.load(f)

missing_in_uz = []
identical_values = []

def compare(d_ru, d_uz, path=''):
    for k, v_ru in d_ru.items():
        curr_path = f'{path}.{k}' if path else k
        if isinstance(v_ru, dict):
            if k not in d_uz or not isinstance(d_uz[k], dict):
                missing_in_uz.append(curr_path)
            else:
                compare(v_ru, d_uz[k], curr_path)
        else:
            if k not in d_uz:
                missing_in_uz.append(curr_path)
            else:
                v_uz = d_uz[k]
                if v_ru == v_uz and not str(v_ru).isdigit() and len(str(v_ru)) > 2:
                    identical_values.append((curr_path, v_ru))

compare(ru, uz)

print(f"Missing in UZ: {len(missing_in_uz)}")
for m in missing_in_uz: print(f"  - {m}")

print(f"\nIdentical values (RU == UZ): {len(identical_values)}")
for p, v in identical_values: print(f"  - {p}: {v}")
