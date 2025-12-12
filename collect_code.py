import os

# Configuration
OUTPUT_FILE = 'project_code_dump.txt'
SOURCE_DIRS = ['backend', 'frontend']
# Files to ignore explicitly
IGNORE_FILES = ['db.sqlite3', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']
# Directories to ignore
IGNORE_DIRS = [
    'node_modules', '.next', 'dist', 'build', '__pycache__', 
    'env', 'venv', '.git', '.idea', '.vscode', 'migrations',
    'static', 'staticfiles', 'media', 'Lib', 'Scripts', 'Include'
]
# Extensions to include
INCLUDE_EXTS = ['.py', '.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json']

def is_ignored(path):
    parts = path.split(os.sep)
    for part in parts:
        if part in IGNORE_DIRS:
            return True
    return False

def collect_code():
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        outfile.write(f"# Project Code Dump\n# Generated automatically\n\n")
        
        for root_dir in SOURCE_DIRS:
            if not os.path.exists(root_dir):
                print(f"Warning: Directory {root_dir} not found.")
                continue
                
            for root, dirs, files in os.walk(root_dir):
                # Filter directories in-place to prevent walking them
                dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
                
                for file in files:
                    if file in IGNORE_FILES:
                        continue
                        
                    ext = os.path.splitext(file)[1]
                    if ext in INCLUDE_EXTS:
                        file_path = os.path.join(root, file)
                        
                        # Double check full path for ignore (e.g. nested node_modules)
                        if is_ignored(file_path):
                            continue
                            
                        try:
                            with open(file_path, 'r', encoding='utf-8') as infile:
                                content = infile.read()
                                
                            outfile.write(f"\n{'='*80}\n")
                            outfile.write(f"FILE: {file_path}\n")
                            outfile.write(f"{'='*80}\n\n")
                            outfile.write(content)
                            outfile.write("\n")
                            print(f"Added: {file_path}")
                        except Exception as e:
                            print(f"Skipping {file_path}: {e}")

if __name__ == '__main__':
    print("Starting code collection...")
    collect_code()
    print(f"\nDone! All code collected in {OUTPUT_FILE}")
