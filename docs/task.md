# Phase 18: User Management Rules & Access Control

## Status: IN PROGRESS (2/4 Complete)

### Tasks
- [x] Differentiate System Admins vs Org Users (Types, Roles)
- [x] Implement System Settings > User Control (System Admin Management)
- [/] Implement Org Setup > User & Permission
    - [ ] User Management- [x] Backend Implementation
    - [x] Modify `backend/main.py`
        - [x] Add `POST /api/users`, `PUT /api/users/{id}`, `DELETE` endpoints
        - [x] Enforce `is_active` check in `login` and `get_current_user`
    - [x] Modify `backend/crud.py`
        - [x] Implement `create_user`, `update_user`, `delete_user`
    - [x] Create `backend/schemas.py` User schemas
- [x] Frontend Implementation
    - [x] Update `services/api.ts` with `saveUser`, `deleteUser`
    - [x] Update `store/orgStore.ts` to call API methods
- [ ] Verification (Manual Required - Browser Unavailable)
    - [ ] Add User & Link to Employee -> Verify `profileStatus` matches
    - [ ] Offboard Employee -> Verify User `profileStatus` becomes 'Inactive'
    - [ ] Try Login with Inactive User -> Verify Access Deniedtrol
- [ ] Enforce Profile Linking & Inactive Access Control

### Completed
- Added `renderUserControlTab()` in `SystemSettings.tsx`
- System Admin CRUD with modal form and audit logging
- 'User Control' tab with role-based filtering

### Remaining
- Wire users to backend API for persistence
- [x] Auto-sync profileStatus when linked employee status changes
- [x] Re-align Org Structure tabs according to hierarchy (Depts -> Levels -> Grades -> Positions)
