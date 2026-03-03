import os, re, json

t_pattern = re.compile(r"t\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)")
found = {}

for root, _, files in os.walk('c:\\diplom\\frontend\\src'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            with open(os.path.join(root, f), 'r', encoding='utf-8') as fds:
                matches = t_pattern.findall(fds.read())
                for key, fallback in matches: found[key] = fallback

ru_path = r'c:\diplom\frontend\src\i18n\locales\ru.json'
with open(ru_path, 'r', encoding='utf-8') as fds: ru = json.load(fds)

def get_nested(d, key_path):
    current = d
    for p in key_path.split('.'):
        if not isinstance(current, dict) or p not in current: return None
        current = current[p]
    return current

missing = []
for k, v in found.items():
    if get_nested(ru, k) is None:
        missing.append((k, v))

with open('c:\\diplom\\missing_keys.json', 'w', encoding='utf-8') as f:
    json.dump(missing, f, ensure_ascii=False, indent=4)
print(f"Found {len(missing)} missing keys in ru.json. Check missing_keys.json.")
