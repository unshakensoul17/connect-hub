# Testing Workflow - Authentication & Onboarding

## Current System Status

### ✅ Database
- RLS policies: ACTIVE and CORRECT
- GRANT statements: IN PLACE
- Trigger: ENABLED

### ✅ Middleware
- Protects: `/dashboard/*` (including all subpages)
- Bypasses: `/onboarding`, `/`, `/login`, `/register`
- Logic: Auth check → Profile completion check → Redirect

### ✅ Frontend
- Login: No client-side redirects (middleware handles it)
- Register: 2s wait for trigger → Redirects to onboarding
- Onboarding: Step 1 → Step 2 (client-side only) → Submit → UPDATE → Dashboard

## Test Steps

### Test 1: New User Registration
```
1. Go to /register
2. Fill form and submit
3. ✅ Should auto-redirect to /onboarding after 2s
4. Fill Step 1 (nickname, college ID - both optional)
5. Click "Next Step"
6. ✅ Should show Step 2 (NO redirect)
7. Fill Step 2 (department, semester - both REQUIRED)
8. Click "Complete Profile"
9. ✅ Should redirect to /dashboard
10. ✅ Dashboard should load successfully
```

### Test 2: Existing User Login (Incomplete Profile)
```
1. Go to /login
2. Login with account that has no department/semester
3. ✅ Middleware redirects to /onboarding
4. Complete onboarding
5. ✅ Redirects to /dashboard
```

### Test 3: Existing User Login (Complete Profile)
```
1. Go to /login
2. Login with account that has department AND semester
3. ✅ Middleware redirects to /dashboard
4. ✅ Can access /dashboard/notes, /dashboard/questions, etc.
```

### Test 4: Protected Routes
```
1. Logout (or use incognito)
2. Try to visit /dashboard
3. ✅ Middleware redirects to /login
4. Try to visit /dashboard/notes
5. ✅ Middleware redirects to /login
```

## Debugging

### If redirecting during onboarding:
1. Open browser console (F12)
2. Look for errors during UPDATE
3. Check if department/semester are being saved:
   ```sql
   SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';
   ```

### If can't access dashboard after completing onboarding:
1. Check profile in database:
   ```sql
   SELECT id, department, semester FROM profiles WHERE email = 'YOUR_EMAIL';
   ```
2. Both department AND semester must be NOT NULL

### If middleware redirect loop:
1. Clear browser cache
2. Check browser console for errors
3. Verify cookies are being set correctly

## Common Issues

**Issue: "Redirecting before completion"**
- **Cause**: Middleware running on every page load, checking profile
- **Current Fix**: Middleware bypasses /onboarding completely
- **Verification**: /onboarding should NOT be in protected routes

**Issue: "Can't access dashboard subpages"**
- **Cause**: Profile incomplete (missing department or semester)
- **Fix**: Complete onboarding fully
- **Verification**: Check database for NULL values

**Issue: "Login redirects to onboarding even with complete profile"**
- **Cause**: Database query failing in middleware
- **Fix**: Check GRANT statements and RLS policies

## URLs Map

```
/                       → Landing page (public)
/register               → Registration (public)
/login                  → Login (public)
/onboarding            → Profile setup (auth required, bypassed by middleware)
/dashboard              → Main dashboard (protected)
/dashboard/notes        → Notes page (protected)
/dashboard/questions    → QA page (protected)
/dashboard/leaderboard  → Leaderboard (protected)
/dashboard/profile      → User profile (protected)
/dashboard/upload       → Upload page (protected)
```

All `/dashboard/*` routes are protected and require:
1. ✅ User is authenticated
2. ✅ Profile has department AND semester
