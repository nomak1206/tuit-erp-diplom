import re
import sys

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simple replacement of specific strings in client.ts
    if 'client.ts' in filepath:
        content = content.replace(
            "'Недостаточно прав для этого действия'", 
            "i18n.t('api.forbidden', 'Недостаточно прав для этого действия')"
        )
        content = content.replace(
            "'Ошибка валидации данных'", 
            "i18n.t('api.validation_error', 'Ошибка валидации данных')"
        )
        content = content.replace(
            "'Ошибка сервера. Попробуйте позже.'", 
            "i18n.t('api.server_error', 'Ошибка сервера. Попробуйте позже.')"
        )
        
        # Add import if missing
        if 'i18n' in content and 'import i18n' not in content:
            content = "import i18n from '../i18n'\n" + content
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

if __name__ == '__main__':
    from sys import argv
    if len(argv) > 1:
        process_file(argv[1])
