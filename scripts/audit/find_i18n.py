import re
from pathlib import Path

def find_hardcoded_cyrillic(src_dir):
    cyrillic_pattern = re.compile(r'[А-Яа-яЁё]+')
    
    # Simple regex to try and ignore comments (not perfect but helpful)
    comment_pattern = re.compile(r'//.*|/\*.*?\*/', re.DOTALL)
    
    # We want to find Cyrillic strings that are NOT inside a t('...') or t("...") call
    # This regex is a simplistic attempt to find cyrillic text.
    
    files_with_cyrillic = {}
    
    # Find all tsx files
    for filepath in Path(src_dir).rglob("*.tsx"):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Remove comments to reduce false positives
            content = comment_pattern.sub('', content)
            
            lines = content.split('\n')
            found_lines = []
            
            for i, line in enumerate(lines):
                if cyrillic_pattern.search(line):
                    # Check if it's wrapped in translation function like t('...')
                    # Simple check: does the line contain t(
                    if 't(' not in line and 'i18n.t(' not in line:
                        found_lines.append((i+1, line.strip()))
            
            if found_lines:
                files_with_cyrillic[str(filepath)] = found_lines
                
    return files_with_cyrillic

def main():
    src_dir = r"c:\diplom\frontend\src"
    results = find_hardcoded_cyrillic(src_dir)
    
    out_path = r"c:\diplom\i18n_issues.txt"
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("Files containing potentially hardcoded Cyrillic text (missing translations):\n\n")
        for filepath, lines in results.items():
            f.write(f"--- {filepath} ---\n")
            for line_num, line_content in lines:
                f.write(f"  Line {line_num}: {line_content}\n")
            f.write("\n")
            
    print(f"Analysis complete. Found {len(results)} files with potential hardcoded text.")
    print(f"Results saved to {out_path}")

if __name__ == '__main__':
    main()
