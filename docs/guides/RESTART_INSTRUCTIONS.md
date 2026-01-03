# 🔄 Server Restart Instructions

## Issue
Backend changes (new fields, seed data) not showing because NestJS server hasn't reloaded the updated entities.

## Solution: Restart Backend

### Option 1: Quick Restart (Recommended)
1. **Stop NestJS server:**
   - Find terminal running `npm run start` in `hcm_api`
   - Press `Ctrl+C` to stop

2. **Restart NestJS:**
   ```bash
   cd hcm_api
   npm run start
   ```

3. **Wait for:**
   ```
   ✅ Seeded Grades
   ✅ Seeded Designations  
   ✅ Seeded Departments
   ✅ Seeded Shifts
   ✅ Seeded Pakistan Districts
   ```

4. **Refresh browser** (Ctrl+F5 for hard refresh)

### Option 2: Full Clean Restart
If Option 1 doesn't work:

1. **Delete database** (forces fresh schema):
   ```bash
   del d:\Python\HCM_WEB\sql_app.db
   ```

2. **Restart NestJS:**
   ```bash
   cd hcm_api
   npm run start
   ```

3. **Refresh browser**

## What Will Happen
- Database tables will be auto-created with new columns
- Master data will auto-seed:
  - 11 Grades (E1, E2, M1-M9)
  - 8 Designations (CEO, GM, Manager, etc.)
  - 7 Departments
  - 6 Shifts (A, B, C, G, R, Z)
  - 35 Pakistan Districts

## Verify It Worked
After restart, check backend logs for:
```
[Nest] INFO [TypeORM] - Entity synchronized
✅ Seeded Grades
✅ Seeded Designations
✅ Seeded Departments
✅ Seeded Shifts
✅ Seeded Pakistan Districts
```

## If Still Not Working
Check:
1. Frontend using correct API URL (should be http://localhost:3001)
2. No CORS errors in browser console
3. TypeScript compile errors in NestJS terminal

---

**Current Issue:** NestJS running for 1h+, hasn't loaded new entities yet.
**Fix:** Restart NestJS backend server → Database will auto-sync → Seed data will load
