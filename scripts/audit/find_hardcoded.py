import os
import re

def find_hardcoded_cyrillic(directory):
    # Match any string literal (single or double quotes) containing at least one Cyrillic char
    # We want to ignore lines containing: t(
    # Also ignore comments: //
    
    cyrillic_pattern = re.compile(r'[А-Яа-яЁё]+')
    t_func_pattern = re.compile(r'\bt\(')
    comment_pattern = re.compile(r'^\s*//')
    
    issues = []
    
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f):
                        if cyrillic_pattern.search(line):
                            if not t_func_pattern.search(line) and not comment_pattern.search(line):
                                issues.append(f"{filepath}:{i+1}:{line.strip()}")
    
    return issues

if __name__ == '__main__':
    directory = r'c:\diplom\frontend\src'
    issues = find_hardcoded_cyrillic(directory)
    print(f"Found {len(issues)} lines with hardcoded Cyrillic text.")
    for issue in issues[:20]:
        print(issue)
