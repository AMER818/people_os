
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

# Configuration
PROJECT_ROOT = Path("d:/Project/PEOPLE_OS")
SRC_DIR = PROJECT_ROOT / "src"
BACKEND_DIR = PROJECT_ROOT / "backend"

VIOLATIONS = []

def log_violation(category, message, file=None):
    v = f"[{category}] {message}"
    if file:
        v += f" (in {file})"
    VIOLATIONS.append(v)

def scan_file_duplication():
    """Check for duplicate filenames in different utility folders"""
    print("--- Scanning for File Duplication ---")
    files_registry = defaultdict(list)
    
    # Scan src/utils and src/lib
    target_dirs = [SRC_DIR / "utils", SRC_DIR / "lib", SRC_DIR / "services"]
    
    for d in target_dirs:
        if not d.exists(): continue
        for p in d.rglob("*"):
            if p.is_file():
                files_registry[p.name].append(str(p.relative_to(PROJECT_ROOT)))
    
    for filename, paths in files_registry.items():
        if len(paths) > 1:
            log_violation("FILE_DUPLICATION", f"File '{filename}' exists in multiple locations: {paths}")

def scan_type_duplication():
    """Check for re-definition of core Types (AuditBase, Employee)"""
    print("--- Scanning for Type Definition Duplication ---")
    
    # Regex to find 'interface Employee' or 'class Employee'
    type_patterns = {
        "Employee": re.compile(r"(interface|type|class)\s+Employee\W"),
        "Department": re.compile(r"(interface|type|class)\s+Department\W"),
        "User": re.compile(r"(interface|type|class)\s+User\W")
    }
    
    # Scan relevant frontend files
    for p in SRC_DIR.rglob("*.tsx"):
        try:
            content = p.read_text(encoding='utf-8')
            for type_name, pattern in type_patterns.items():
                if pattern.search(content):
                    # Exclude the canonical definition file (e.g., types/index.ts)
                    if "types" not in p.parts:
                        log_violation("TYPE_DUPLICATION", f"'{type_name}' defined in non-type file", str(p.relative_to(PROJECT_ROOT)))
        except:
            pass

def scan_ui_duplication():
    """Check for hardcoded styles that should use Components"""
    print("--- Scanning for UI Standard Violations ---")
    
    # Pattern for hardcoded buttons (Tailwind misuse)
    button_pattern = re.compile(r"<button.*className=.*bg-blue-500.*>")
    
    for p in SRC_DIR.rglob("*.tsx"):
        if "components/ui" in str(p): continue
        
        try:
            content = p.read_text(encoding='utf-8')
            if button_pattern.search(content):
                log_violation("UI_STANDARD", "Detected hardcoded primary button styles instead of <Button>", str(p.relative_to(PROJECT_ROOT)))
        except:
            pass

def verify_recent_fix():
    """Verify 'Engagement Models' is gone from DesignationManagement"""
    print("--- Verifying Specific Fixes ---")
    target_file = SRC_DIR / "modules/org-setup/DesignationManagement.tsx"
    if target_file.exists():
        content = target_file.read_text(encoding='utf-8')
        if "Engagement Models" in content:
            log_violation("REGRESSION", "'Engagement Models' section still found", str(target_file.relative_to(PROJECT_ROOT)))
        else:
            print(f"✓ Verified: 'Engagement Models' removed from {target_file.name}")
            
        if "addEmploymentLevel" in content:
             log_violation("REGRESSION", "'addEmploymentLevel' handler still found", str(target_file.relative_to(PROJECT_ROOT)))

def scan_code_search_duplication():
    """Check for manual filter/search logic (Protocol Sec 7)"""
    print("--- Scanning for Code Search Violations (Manual Filtering) ---")
    
    # Pattern: .filter(...) combined with .includes(...) which suggests manual search
    # Heuristic: looking for .filter and .includes on the same or adjacent lines would be complex with regex in this simple script
    # So we'll look for the specific anti-pattern: .filter(x => x.name.includes(...))
    
    manual_filter_pattern = re.compile(r"\.filter\s*\(.*\.(includes|match)\(")
    
    for p in SRC_DIR.rglob("*.tsx"):
        # Skip shared hooks
        if "hooks" in str(p): continue
        
        try:
            content = p.read_text(encoding='utf-8')
            if manual_filter_pattern.search(content):
                # We expect this in some files, but 'leaves/index.tsx' should be CLEAN now.
                log_violation("SEARCH_DUPLICATION", "Detected manual search/filter logic instead of useSearch hook", str(p.relative_to(PROJECT_ROOT)))
        except:
            pass

def main():
    print(f"Starting Deduplication Audit on {PROJECT_ROOT}\n")
    
    try:
        scan_file_duplication()
        scan_type_duplication()
        scan_ui_duplication()
        scan_code_search_duplication()
        verify_recent_fix()
        
        
        print("\n" + "="*40)
        print(f"AUDIT COMPLETE. Found {len(VIOLATIONS)} issues.")
        print("="*40)
        
        if VIOLATIONS:
            for v in VIOLATIONS:
                print(v)
            sys.exit(1)
        else:
            print("No deduplication violations found! Project is clean.")
            sys.exit(0)
            
    except Exception as e:
        print(f"Audit script failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
