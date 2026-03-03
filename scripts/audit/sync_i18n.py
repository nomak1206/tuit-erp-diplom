import json

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def merge_dicts(source, target):
    """
    Recursively add missing keys from source to target.
    The values added to target will just be the Russian values (prefixed with [UZ] or just exact copy) 
    so the user or translator can easily spot them if they need translation, or they just act as fallbacks.
    For this script, we'll just copy the value over so the app doesn't break.
    """
    for key, value in source.items():
        if key not in target:
            target[key] = value
        elif isinstance(value, dict) and isinstance(target[key], dict):
            merge_dicts(value, target[key])

def main():
    ru_path = 'c:/diplom/frontend/src/i18n/locales/ru.json'
    uz_path = 'c:/diplom/frontend/src/i18n/locales/uz.json'

    ru = load_json(ru_path)
    uz = load_json(uz_path)

    # Add missing RU keys to UZ
    merge_dicts(ru, uz)
    
    # Add missing UZ keys to RU
    merge_dicts(uz, ru)

    save_json(ru_path, ru)
    save_json(uz_path, uz)

    print("Success: Synchronized keys between ru.json and uz.json")

if __name__ == '__main__':
    main()
