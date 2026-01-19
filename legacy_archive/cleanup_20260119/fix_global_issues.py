import os

def fix_files(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.tsx') or filename.endswith('.ts'):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Fix Button Casing
                    content = content.replace("@components/ui/Button", "@components/ui/button")
                    content = content.replace("../../components/ui/Button", "../../components/ui/button")
                    content = content.replace("./ui/Card", "./ui/card") # Just in case

                    # Fix Variant
                    content = content.replace('variant="destructive"', 'variant="danger"')

                    if content != original_content:
                        print(f"Fixing {filepath}")
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    fix_files(r"d:\Python\HCM_WEB\src")
