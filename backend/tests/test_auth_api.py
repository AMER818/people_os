"""
Authentication API Tests
Tests all authentication-related endpoints
Priority: HIGH (Critical Security Path)
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
import sys
import os

import sys
import os

# Add root to path (optional if running from root, but good for safety)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.main import app
from backend.database import get_db, engine
import backend.models as models
from backend.dependencies import get_password_hash

# Test credentials from environment variables (moved out of hardcoded strings)
TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD", "test-secure-password-123")
# Hashed value for TEST_USER_PASSWORD
TEST_USER_PASSWORD_HASH = get_password_hash(TEST_USER_PASSWORD)


@pytest.fixture
def test_organization(db):
    """Create a test organization"""
    org = models.DBOrganization(
        id="org-1",
        name="Test Org",
        code="ORG1"
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@pytest.fixture
def regular_user(db, test_organization):
    """Create regular user"""
    regular_user = models.DBUser(
        id="regular-user-1",
        username="regular",
        name="Regular User",
        email="regular@example.com",
        role="Manager",
        password_hash=TEST_USER_PASSWORD_HASH,
        organization_id=test_organization.id,
        is_active=True
    )
    db.add(regular_user)
    db.commit()
    db.refresh(regular_user)
    return regular_user

@pytest.fixture
def admin_user(db, test_organization):
    """Create admin user"""
    admin_user = models.DBUser(
        id="admin-user-1",
        username="admin",
        name="Admin User",
        email="admin@example.com",
        role="SystemAdmin",
        password_hash=TEST_USER_PASSWORD_HASH,
        organization_id=test_organization.id,
        is_active=True
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user

@pytest.fixture
def inactive_user(db, test_organization):
    """Create inactive user"""
    inactive_user = models.DBUser(
        id="inactive-user-1",
        username="inactive",
        name="Inactive User",
        email="inactive@example.com",
        role="Business Admin",
        password_hash=TEST_USER_PASSWORD_HASH,
        organization_id=test_organization.id,
        is_active=False
    )
    db.add(inactive_user)
    db.commit()
    db.refresh(inactive_user)
    return inactive_user

@pytest.fixture
def test_user(db, test_organization):
    """Create a test user"""
    user = models.DBUser(
        id="user-1",
        username="testuser",
        name="Test User",
        email="test@example.com",
        role="Business Admin",
        password_hash=TEST_USER_PASSWORD_HASH,
        organization_id="org-1",
        is_active=True
    )
    # Check if exists (unlikely with function scope)
    # db.add(user)
    # Logic: conftest db fixture drops all. So clean state.
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_login_success(self, client, test_user):
        """Test successful login"""
        # Act
        response = client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": TEST_USER_PASSWORD
            }
        )
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "testuser"
        assert data["user"]["role"] == "Business Admin"
    
    def test_login_invalid_credentials(self, client, test_user):
        """Test login with invalid credentials"""
        # Act
        response = client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": "wrongpassword"
            }
        )
        
        # Assert
        assert response.status_code == 401
        assert "detail" in response.json()
    
    def test_login_nonexistent_user(self, client):
        """Test login with nonexistent user"""
        # Act
        response = client.post(
            "/api/auth/login",
            json={
                "username": "nonexistent",
                "password": "password"
            }
        )
        
        # Assert
        assert response.status_code == 401
    
    def test_login_inactive_user(self, client, inactive_user):
        """Test login with inactive user"""
        # Act
        response = client.post(
            "/api/auth/login",
            json={
                "username": "inactive",
                "password": TEST_USER_PASSWORD
            }
        )
        
        # Assert
        assert response.status_code == 403
        assert "User account is not active" in response.json()["detail"] or "Account is inactive" in response.json()["detail"]


class TestProtectedEndpoints:
    """Test JWT token validation on protected endpoints"""
    
    def test_protected_endpoint_without_token(self, client):
        """Test accessing protected endpoint without token"""
        # Act
        response = client.get("/api/employees")
        
        # Assert
        assert response.status_code == 401
        assert "detail" in response.json()
    
    def test_protected_endpoint_with_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token"""
        # Act
        response = client.get(
            "/api/employees",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        
        # Assert
        assert response.status_code == 401
    
    def test_protected_endpoint_with_valid_token(self, client, test_user):
        """Test accessing protected endpoint with valid token"""
        # First login to get token
        login_response = client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": TEST_USER_PASSWORD
            }
        )
        
        token = login_response.json()["access_token"]
        
        # Act
        response = client.get(
            "/api/employees",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Assert
        # 200 or 404 (if no employees) usually 200 with empty list
        assert response.status_code == 200


class TestRBACEndpoints:
    """Test Role-Based Access Control"""
    
    def test_admin_only_endpoint_as_admin(self, client, admin_user):
        """Test admin-only endpoint with SystemAdmin role"""
        # Login as admin
        login_response = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": TEST_USER_PASSWORD}
        )
        token = login_response.json()["access_token"]
        
        # Act - Access admin-only endpoint
        response = client.get(
            "/api/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Assert
        assert response.status_code == 200
    
    def test_admin_only_endpoint_as_regular_user(self, client, regular_user):
        """Test admin-only endpoint with HRManager role (should fail)"""
        # Login as regular user
        login_response = client.post(
            "/api/auth/login",
            json={"username": "regular", "password": TEST_USER_PASSWORD}
        )
        token = login_response.json()["access_token"]
        
        # Act - Try to access admin-only endpoint
        response = client.get(
            "/api/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Assert
        assert response.status_code == 403
        assert "Access Forbidden" in response.json()["detail"]


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        # Act
        response = client.get("/health")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert "timestamp" in data
