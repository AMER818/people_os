# Phase 18: User Management Rules & Access Control

Complete the user management system by adding System Admin controls in `SystemSettings.tsx`, wiring user persistence to the backend, and enforcing profile-linked access control.

## Proposed Changes

### Frontend Components

---

#### [MODIFY] [SystemSettings.tsx](file:///d:/Python/HCM_WEB/modules/SystemSettings.tsx)

Add a new "User Control" tab for managing System Admin users:
- Create `renderUserControlTab()` function
- Filter and display users where `userType === 'SystemAdmin'`
- Add form modal for creating/editing System Admins (no employee linking)
- Roles limited to: Super Admin, HR Admin, Admin, Auditor
- Add tab to the `tabGroups` configuration

---

#### [MODIFY] [OrgSetup.tsx](file:///d:/Python/HCM_WEB/modules/OrgSetup.tsx)

Enhance existing Org User management:
- Wire `handleSaveUser` to persist to backend API
- Add `useEffect` to sync `profileStatus` when employee status changes
- Add visual warning for users with inactive linked employees

---

#### [MODIFY] [orgStore.ts](file:///d:/Python/HCM_WEB/store/orgStore.ts)

- Update `addUser` to call backend API
- Update `updateUser` to call backend API
- Update `deleteUser` to call backend API
- Ensure `syncProfileStatus` propagates to backend

---

### Backend API Integration

---

#### [MODIFY] [api.ts](file:///d:/Python/HCM_WEB/services/api.ts)

Add/verify user management methods:
- `getUsers()` - Fetch all users
- `saveUser(user)` - Create/update user
- `deleteUser(id)` - Delete user
- Ensure proper authorization headers

---

## Verification Plan

### Manual Verification

**Test 1: System Admin CRUD in SystemSettings**
1. Run dev server: `npm run dev`
2. Login as admin user
3. Navigate to System Settings → User Control tab
4. Create a new System Admin user (no employee link)
5. Edit the user's role
6. Delete the user
7. Verify audit logs show operations

**Test 2: Org User CRUD in Org Setup**
1. Navigate to Org Setup → User & Permission tab
2. Create a new Org User by selecting an active employee
3. Verify name/email auto-populate from employee
4. Save and verify user appears in list
5. Edit role and save
6. Delete user

**Test 3: Profile Linking Access Control**
1. Create an Org User linked to an active employee
2. Change the linked employee's status to Inactive
3. Verify the Org User's `profileStatus` syncs to Inactive
4. Attempt to login as that Org User
5. Verify access is blocked with "Access Revoked" message

### Automated Tests (if applicable)
No existing user management tests found. Manual browser verification is recommended.
