from datetime import datetime


def format_to_db(date_str: str) -> str:
    """
    Converts DD-MMM-YYYY (e.g., 31-Dec-2025) to YYYY-MM-DD.
    If input is already YYYY-MM-DD, returns as is.
    Raises ValueError if invalid.
    """
    if not date_str:
        return None

    # Check if already ISO format
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return date_str
    except ValueError:
        pass

    try:
        dt = datetime.strptime(date_str, "%d-%b-%Y")
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        # Try full month name just in case
        try:
            dt = datetime.strptime(date_str, "%d-%B-%Y")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            raise ValueError(
                f"Invalid date format: {date_str}. Expected DD-MMM-YYYY (e.g., 31-Dec-2025)."
            )


def format_from_db(date_str: str) -> str:
    """
    Converts YYYY-MM-DD to DD-MMM-YYYY.
    """
    if not date_str:
        return None

    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%d-%b-%Y")
    except ValueError:
        return date_str  # Return original if parsing fails (fallback)


def validate_date(date_str: str) -> bool:
    """
    Checks if date is valid DD-MMM-YYYY or YYYY-MM-DD.
    """
    try:
        format_to_db(date_str)
        return True
    except ValueError:
        return False


def validate_time(time_str: str) -> bool:
    """
    Checks if time is valid 24-hour format (HH:MM or HH:MM:SS).
    """
    if not time_str:
        return True  # Optional? Or strict? Assuming strict if provided.

    for fmt in ("%H:%M", "%H:%M:%S"):
        try:
            datetime.strptime(time_str, fmt)
            return True
        except ValueError:
            continue
    return False
