import json

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_all_keys(d, prefix=''):
    keys = set()
    for k, v in d.items():
        curr_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.update(get_all_keys(v, curr_key))
        else:
            keys.add(curr_key)
    return keys

ru_path = r'c:\diplom\frontend\src\i18n\locales\ru.json'
uz_path = r'c:\diplom\frontend\src\i18n\locales\uz.json'

ru_data = load_json(ru_path)
uz_data = load_json(uz_path)

ru_keys = get_all_keys(ru_data)
uz_keys = get_all_keys(uz_data)

missing_in_uz = ru_keys - uz_keys
missing_in_ru = uz_keys - ru_keys

print(f"Total keys in ru.json: {len(ru_keys)}")
print(f"Total keys in uz.json: {len(uz_keys)}")
print(f"Keys missing in uz.json: {len(missing_in_uz)}")
print(f"Keys missing in ru.json: {len(missing_in_ru)}")

if missing_in_uz:
    print("\nSample missing in UZ:")
    for k in list(missing_in_uz)[:20]:
        print(f" - {k}")
