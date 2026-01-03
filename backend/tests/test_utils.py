import pytest

from backend.utils import (format_from_db, format_to_db, validate_date,
                           validate_time)


def test_format_to_db():
    assert format_to_db("31-Dec-2025") == "2025-12-31"
    assert format_to_db("2025-12-31") == "2025-12-31"
    assert format_to_db(None) is None
    
    with pytest.raises(ValueError):
        format_to_db("invalid-date")

def test_format_from_db():
    assert format_from_db("2025-12-31") == "31-Dec-2025"
    assert format_from_db(None) is None
    # Fallback behavior
    assert format_from_db("invalid-date") == "invalid-date"

def test_validate_date():
    assert validate_date("31-Dec-2025") is True
    assert validate_date("2025-12-31") is True
    assert validate_date("invalid") is False

def test_validate_time():
    assert validate_time("14:30") is True
    assert validate_time("14:30:00") is True
    assert validate_time("invalid") is False
    assert validate_time(None) is True # Optional behavior logic
