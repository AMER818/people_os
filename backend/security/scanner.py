import hashlib
import os
from typing import List, Tuple


class SecurityScanner:
    """
    Security Scanner for File Uploads.
    Implements pattern matching and validation logic.
    """

    # Blocked extensions
    BLOCKED_EXTENSIONS = {
        ".exe",
        ".dll",
        ".bat",
        ".cmd",
        ".sh",
        ".php",
        ".pl",
        ".py",
        ".js",
        ".vbs",
    }

    # Magic numbers for file signature verification
    MAGIC_NUMBERS = {
        "pdf": b"%PDF",
        "png": b"\x89PNG\r\n\x1a\n",
        "jpg": b"\xff\xd8\xff",
        "jpeg": b"\xff\xd8\xff",
        "gif": b"GIF8",
        "docx": b"PK\x03\x04",
        "xlsx": b"PK\x03\x04",
    }

    @staticmethod
    def scan_file(file_content: bytes, filename: str) -> Tuple[bool, str]:
        """
        Scans a file for security threats.
        Returns (is_safe: bool, message: str)
        """

        # 1. Extension Check
        _, ext = os.path.splitext(filename.lower())
        if ext in SecurityScanner.BLOCKED_EXTENSIONS:
            return False, f"Blocked file extension: {ext}"

        # 2. Magic Number Check (Signature verification)
        # Identify expected signature based on extension
        expected_magic = None
        for key, magic in SecurityScanner.MAGIC_NUMBERS.items():
            if ext.endswith(key):
                expected_magic = magic
                break

        if expected_magic:
            if not file_content.startswith(expected_magic):
                return False, f"File signature mismatch for {ext}"

        # 3. Size Check (Example: 10MB limit)
        if len(file_content) > 10 * 1024 * 1024:
            return False, "File exceeds size limit (10MB)"

        # 4. Mock Virus Scan (Placeholder for ClamAV)
        # In a real impl, this would call pyclamd or a scan API
        if b"EICAR-STANDARD-ANTIVIRUS-TEST-FILE" in file_content:
            return False, "Virus detected (EICAR Signature)"

        return True, "File is safe"

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Removes dangerous characters from filenames"""
        keep = (" ", ".", "_", "-")
        return "".join(c for c in filename if c.isalnum() or c in keep).strip()


scanner = SecurityScanner()
