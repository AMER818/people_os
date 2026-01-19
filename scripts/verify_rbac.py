"""
RBAC VERIFICATION SCRIPT
Confirms Root and Super Admin have full access.
"""
from backend.permissions_config import (
    has_permission,
    SUPER_ROLES,
    DEFAULT_ROLE_PERMISSIONS,
    SYSTEM_ROLES,
    get_role_level,
    is_higher_role
)

print("=" * 50)
print("RBAC VERIFICATION - Root & Super Admin Full Access")
print("=" * 50)

# 1. Check SYSTEM_ROLES
print("\n[1] SYSTEM_ROLES (Hardcoded):")
print(f"    {SYSTEM_ROLES}")

# 2. Check SUPER_ROLES
print("\n[2] SUPER_ROLES (Full Access Bypass):")
print(f"    {SUPER_ROLES}")

# 3. Check DEFAULT_ROLE_PERMISSIONS for Root and Super Admin
print("\n[3] DEFAULT_ROLE_PERMISSIONS:")
for role in ["Root", "Super Admin", "SystemAdmin", "Business Admin", "Manager", "User"]:
    perms = DEFAULT_ROLE_PERMISSIONS.get(role, [])
    print(f"    {role:15s} -> {perms}")

# 4. Test has_permission for Root
print("\n[4] Root Permission Checks (should ALL be True):")
test_perms = ["anything", "view_users", "delete_users", "system_config", "random_perm"]
for perm in test_perms:
    result = has_permission("Root", perm)
    status = "✅" if result else "❌"
    print(f"    {status} Root has '{perm}': {result}")

# 5. Test has_permission for Super Admin
print("\n[5] Super Admin Permission Checks (should ALL be True):")
for perm in test_perms:
    result = has_permission("Super Admin", perm)
    status = "✅" if result else "❌"
    print(f"    {status} Super Admin has '{perm}': {result}")

# 6. Test has_permission for other roles (should have limited/no access)
print("\n[6] Other Roles Permission Checks (should be False for empty configs):")
for role in ["SystemAdmin", "Business Admin", "Manager", "User"]:
    result = has_permission(role, "system_config")
    status = "✅" if not result else "⚠️"
    print(f"    {status} {role} has 'system_config': {result}")

# 7. Role Hierarchy
print("\n[7] Role Hierarchy Levels:")
for role in ["User", "Manager", "Business Admin", "SystemAdmin", "Super Admin", "Root"]:
    level = get_role_level(role)
    print(f"    {role:15s} -> Level {level}")

# 8. Authority Check
print("\n[8] Authority Checks:")
print(f"    Root is higher than Super Admin: {is_higher_role('Root', 'Super Admin')}")
print(f"    Super Admin is higher than SystemAdmin: {is_higher_role('Super Admin', 'SystemAdmin')}")
print(f"    User is higher than Root: {is_higher_role('User', 'Root')}")

print("\n" + "=" * 50)
print("VERIFICATION COMPLETE")
print("=" * 50)
