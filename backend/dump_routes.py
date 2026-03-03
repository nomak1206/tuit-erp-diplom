import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

def dump_routes():
    routes_by_tag = {}
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'tags'):
            path = route.path
            methods = [m for m in route.methods if m != 'OPTIONS']
            tags = route.tags
            tag = tags[0] if tags else 'Default'
            name = route.name

            if tag not in routes_by_tag:
                routes_by_tag[tag] = []
            
            for method in methods:
                routes_by_tag[tag].append({
                    'method': method,
                    'path': path,
                    'name': name
                })
    
    with open('/app/routes_audit.json', 'w', encoding='utf-8') as f:
        json.dump(routes_by_tag, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    dump_routes()
