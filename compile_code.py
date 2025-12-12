"""
Code Consolidation Script
Compiles all source code from the project into a single file.

Run with: python compile_code.py
"""
import os
from datetime import datetime

# Configuration
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_DIR, 'backend')
FRONTEND_DIR = os.path.join(PROJECT_DIR, 'frontend', 'src')

OUTPUT_FILE = os.path.join(PROJECT_DIR, 'project_code_dump.txt')

# File extensions to include
CODE_EXTENSIONS = {
    '.py': 'python',
    '.tsx': 'typescript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.js': 'javascript',
    '.css': 'css',
    '.json': 'json',
}

# Directories to exclude
EXCLUDE_DIRS = {
    '__pycache__', 'node_modules', '.next', '.git', 'venv', 
    'migrations', 'data_export', '.gemini', 'build', 'dist'
}

# Files to exclude
EXCLUDE_FILES = {
    'package-lock.json', 'yarn.lock', '.env', '.env.local'
}


def should_include(path):
    """Check if path should be included"""
    parts = path.split(os.sep)
    for part in parts:
        if part in EXCLUDE_DIRS:
            return False
    
    filename = os.path.basename(path)
    if filename in EXCLUDE_FILES:
        return False
    
    return True


def get_files(directory, extensions):
    """Get all files with specified extensions"""
    files = []
    for root, dirs, filenames in os.walk(directory):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            if ext in extensions:
                full_path = os.path.join(root, filename)
                if should_include(full_path):
                    files.append(full_path)
    
    return sorted(files)


def compile_code():
    """Compile all code into single file"""
    output_lines = []
    
    # Header
    output_lines.append("=" * 80)
    output_lines.append(f"PROJECT CODE DUMP - MangaTK")
    output_lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    output_lines.append("=" * 80)
    output_lines.append("")
    
    # Backend files
    output_lines.append("\n" + "=" * 80)
    output_lines.append("BACKEND (Django)")
    output_lines.append("=" * 80 + "\n")
    
    backend_files = get_files(BACKEND_DIR, {'.py'})
    for filepath in backend_files:
        relative_path = os.path.relpath(filepath, PROJECT_DIR)
        output_lines.append(f"\n{'─' * 60}")
        output_lines.append(f"FILE: {relative_path}")
        output_lines.append(f"{'─' * 60}\n")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                output_lines.append(content)
        except Exception as e:
            output_lines.append(f"[Error reading file: {e}]")
    
    # Frontend files
    output_lines.append("\n" + "=" * 80)
    output_lines.append("FRONTEND (Next.js / React)")
    output_lines.append("=" * 80 + "\n")
    
    frontend_files = get_files(FRONTEND_DIR, {'.tsx', '.ts', '.jsx', '.js', '.css'})
    for filepath in frontend_files:
        relative_path = os.path.relpath(filepath, PROJECT_DIR)
        output_lines.append(f"\n{'─' * 60}")
        output_lines.append(f"FILE: {relative_path}")
        output_lines.append(f"{'─' * 60}\n")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                output_lines.append(content)
        except Exception as e:
            output_lines.append(f"[Error reading file: {e}]")
    
    # Write output
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))
    
    print(f"✅ Code compiled to: {OUTPUT_FILE}")
    print(f"   Backend files: {len(backend_files)}")
    print(f"   Frontend files: {len(frontend_files)}")
    print(f"   Total files: {len(backend_files) + len(frontend_files)}")


if __name__ == '__main__':
    compile_code()
