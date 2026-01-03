"""
Authentication API Tests
Tests all authentication-related endpoints
Priority: HIGH (Critical Security Path)
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import get_db, engine
import models

client = TestClient(app)

# Test credentials from environment variables (moved out of hardcoded strings)
TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD", "test-secure-password-123")
# Hashed value for TEST_USER_PASSWORD using bcrypt with cost factor 12
TEST_USER_PASSWORD_HASH = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"


@pytest.fixture(scope="module")
def test_db():
    """Create test database"""
    models.Base.metadata.create_all(bind=engine)
    yield
    models.Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(test_db):
    """Get test database session"""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def test_user(db_session):
    """Create test user"""
    user = models.DBUser(
        id="test-user-1",
        username="testuser",
        name="Test User",
        email="test@example.com",
        role="HRAdmin",
        hashed_password=TEST_USER_PASSWORD_HASH,
        organization_id="org-1",
        status="Active"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_login_success(self, test_user, db_session):
        """Test successful login"""
        # Override get_db to use test session
        def override_get_db():
            try:
                yield db_session
            finally:
                pass
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Act
        response = client.post(
            "/auth/login",
            data={
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
        assert data["user"]["role"] == "HRAdmin"
        
        # Cleanup
        app.dependency_overrides.clear()
    
    def test_login_invalid_credentials(self, test_user, db_session):
        """Test login with invalid credentials"""
        def override_get_db():
            try:
                yield db_session
            finally:
                pass
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Act
        response = client.post(
            "/auth/login",
            data={
                "username": "testuser",
                "password": "wrongpassword"
            }
        )
        
        # Assert
        assert response.status_code == 401
        assert "detail" in response.json()
        
        app.dependency_overrides.clear()
    
    def test_login_nonexistent_user(self, db_session):
        """Test login with nonexistent user"""
        def override_get_db():
            try:
                yield db_session
            finally:
                pass
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Act
        response = client.post(
            "/auth/login",
            data={
                "username": "nonexistent",
                "password": "password"
            }
        )
        
        # Assert
        assert response.status_code == 401
        
        app.dependency_overrides.clear()
    
    def test_login_inactive_user(self, db_session):
        """Test login with inactive user"""
        # Arrange
        inactive_user = models.DBUser(
            id="inactive-1",
            username="inactive",
            name="Inactive User",
            email="inactive@example.com",
            role="HRAdmin",
            hashed_password=TEST_USER_PASSWORD_HASH,
            organization_id="org-1",
            status="Inactive"
        )
        db_session.add(inactive_user)
        db_session.commit()
        
        def override_get_db():
            try:
                yield db_session
            finally:
                pass
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Act
        response = client.post(
            "/auth/login",
            data={
                "username": "inactive",
                "password": TEST_USER_PASSWORD
            }
        )
        
        # Assert
        assert response.status_code == 401
        assert "User account is not active" in response.json()["detail"]
        
        app.dependency_overrides.clear()


class TestProtectedEndpoints:
    """Test JWT token validation on protected endpoints"""
    
    def test_protected_endpoint_without_token(self):
        """Test accessing protected endpoint without token"""
        # Act
        response = client.get("/api/employees")
        
        # Assert
        assert response.status_code == 401
        assert "detail" in response.json()
    
    def test_protected_endpoint_with_invalid_token(self):
        """Test accessing protected endpoint with invalid token"""
        # Act
        response = client.get(
            "/api/employees",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        
        # Assert
        assert response.status_code == 401
    
    def test_protected_endpoint_with_valid_token(self, test_user, db_session):
        """Test accessing protected endpoint with valid token"""
        # First login to get token
        def override_get_db():
            try:
                yield db_session
            finally:
                pass
        
        app.dependency_overrides[get_db] = override_get_db
        
        login_response = client.post(
            "/auth/login",
            data={
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
        assert response.status_code == 200
        
        app.dependency_overrides.clear()


class TestRBACEndpoints:
    """Test Role-Based Access Control"""
    
    def test_admin_only_endpoint_as_admin(self, db_session):
        """Test admin-only endpoint with SystemAdmin role"""
        # Arrange - Create admin user
        admin_user = models.DBUser(
            id="admin-1",
            username="admin",
            name="Admin User",
            email="admin@example.com",
            role="SystemAdmin",
            hashed_password=TEST_USER_PASSWORD_HASH,
            organization_id="org-1",
            status="Active"
        )
        db_session.add(admin_user)
        db_session.commit()
        
        def override_get_db():
            try:
                yield db_session
            finally:
                pass
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Login as admin
        login_response = client.post(
            "/auth/login",
            data={"username": "admin", "password": TEST_USER_PASSWORD}
        )
        token = login_response.json()["access_token"]
        
        # Act - Access admin-only endpoint
        response = client.get(
            "/api/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Assert
        assert response.status_code == 200
        
        app.dependency_overrides.clear()
    
    def test_admin_only_endpoint_as_regular_user(self, db_session):
        """Test admin-only endpoint with HRManager role (should fail)"""
        # Arrange
        regular_user = models.DBUser(
            id="regular-1",
            username="regular",
            name="Regular User",
            email="regular@example.com",
            role="HRManager",
            hashed_password=TEST_USER_PASSWORD_HASH,
            organization_id="org-1",
            status="Active"
        )
        db_session.add(regular_user)
        db_session.commit()
        
        def override_get_db():
            try:
                yield db_session
            finally:
                pass
        
        app.dependency_overrides[get_db] = override_get_db
        
        # Login as regular user
        login_response = client.post(
            "/auth/login",
            data={"username": "regular", "password": TEST_USER_PASSWORD}
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
        
        app.dependency_overrides.clear()


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        # Act
        response = client.get("/health")
        
        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data
        assert "timestamp" in data
