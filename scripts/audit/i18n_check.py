import json

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_keys(d, prefix=''):
    keys = set()
    for k, v in d.items():
        full_key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            keys.update(get_keys(v, full_key))
        else:
            keys.add(full_key)
    return keys

def main():
    ru = load_json('c:/diplom/frontend/src/i18n/locales/ru.json')
    uz = load_json('c:/diplom/frontend/src/i18n/locales/uz.json')

    ru_keys = get_keys(ru)
    uz_keys = get_keys(uz)

    missing_in_uz = ru_keys - uz_keys
    missing_in_ru = uz_keys - ru_keys

    print(f'=== Keys missing in UZ: {len(missing_in_uz)} ===')
    for k in sorted(missing_in_uz): 
        print(f'  - {k}')

    print(f'\n=== Keys missing in RU: {len(missing_in_ru)} ===')
    for k in sorted(missing_in_ru): 
        print(f'  - {k}')

if __name__ == '__main__':
    main()
