# Phase 18: User Management Rules & Access Control

## Current Status: IN PROGRESS

---

## Tasks

### 1. Differentiate System Admins vs Org Users
- [x] Define `UserType` as `'SystemAdmin' | 'OrgUser'` in `types.ts`
- [x] Add `userType` field to `User` interface
- [x] Add `profileStatus` field for OrgUser linked profiles
- [/] Add `employeeId` linking for OrgUser → Employee mapping

### 2. Implement Org Setup > User & Permission (Org User Management)
- [x] Create `renderUserPermissionsTab()` in `OrgSetup.tsx`
- [x] Filter users by `userType === 'OrgUser'`
- [x] Implement employee selection dropdown (active employees only)
- [x] Show profile status badge (Active/Inactive)
- [x] Wire up `handleAddUser`, `handleEditUser`, `handleSaveUser`
- [ ] Wire users to backend API (persistence)
- [ ] Sync profileStatus when linked employee status changes

### 3. Implement System Settings > User Control (System Admin Management)
- [ ] Create `renderUserControlTab()` in `SystemSettings.tsx`
- [ ] Filter users by `userType === 'SystemAdmin'`
- [ ] Implement admin-only role dropdown (Super Admin, HR Admin, Admin)
- [ ] No employee linking required for SystemAdmin
- [ ] Allow standalone user creation

### 4. Enforce Profile Linking & Inactive Access Control
- [x] Block login if OrgUser's linked employee is Inactive
- [ ] Auto-sync OrgUser status when employee status changes
- [ ] Add warning indicators for mismatched status

---

## Verification Plan
- [ ] Verify Org User CRUD operations in browser
- [ ] Verify System Admin CRUD operations in browser
- [ ] Test profile linking access control (Inactive employee blocks access)
- [ ] Test audit logging for user operations
