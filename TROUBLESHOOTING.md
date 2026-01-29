# 🔧 TROUBLESHOOTING - Profile Creation Issues

## Current Error: "permission denied for table profiles"

This error means the database trigger is NOT creating profiles automatically.

---

## ✅ SOLUTION: Verify & Fix Database Setup

### Step 1: Run Verification Script

1. Open Supabase SQL Editor
2. Copy and run: `supabase/verify_setup.sql`
3. Check the results:

**Expected Results:**
- ✅ Trigger exists: `on_auth_user_created`
- ✅ Function exists: `handle_new_user`
- ✅ 3 policies on profiles table
- ✅ RLS enabled on profiles

**If ANY of these are missing:**
- Run `supabase/setup_database.sql` again

---

### Step 2: Test Profile Creation

After running setup_database.sql:

1. **Delete your test account** (if you created one):
   ```sql
   -- In Supabase SQL Editor:
   DELETE FROM auth.users WHERE email = 'your-test-email@example.com';
   ```

2. **Register a new account** in your app

3. **Check if profile was created**:
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
   ```

4. **If profile exists**: ✅ Trigger is working!
5. **If profile doesn't exist**: ❌ Trigger failed - see below

---

## 🐛 If Trigger Still Not Working

### Option A: Manual Profile Creation for Existing Users

Run this in Supabase SQL Editor:

```sql
-- Create profiles for all users who don't have one
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'student'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
```

### Option B: Complete Fresh Start

1. **Delete all test users**:
   ```sql
   DELETE FROM auth.users;
   ```

2. **Run setup_database.sql** again

3. **Register a brand new account**

4. **Profile should be created automatically**

---

## 🔍 Debugging Steps

### Check 1: Is the trigger enabled?

```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

**Expected:** `tgenabled = 'O'` (means enabled)

**If not found:** Run setup_database.sql

### Check 2: Test the trigger manually

```sql
-- This simulates what happens when a user signs up
SELECT public.handle_new_user();
```

**If error:** The function has issues - run setup_database.sql

### Check 3: Check RLS policies

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

**Expected:** 3 policies (SELECT, INSERT, UPDATE)

**If missing:** Run setup_database.sql

---

## 📋 Current App Behavior

After the latest code changes:

### Registration Flow:
1. User registers → Supabase Auth creates user
2. **Trigger automatically creates profile** (should happen)
3. App waits 1 second for trigger to complete
4. Redirects to onboarding

### Onboarding Flow:
1. Checks if profile exists (with 3 retries)
2. **If profile found:** Updates it with onboarding data ✅
3. **If profile not found:** Shows error message ❌

### What This Means:
- ✅ App no longer tries to create profiles manually
- ✅ Relies on database trigger (proper way)
- ✅ Better error messages
- ❌ **Trigger MUST be working** for this to work

---

## 🎯 Action Plan

### Right Now:

1. **Run this in Supabase SQL Editor:**
   ```sql
   -- Check if trigger exists
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **If no results:**
   - Run `supabase/setup_database.sql` in full
   - This will create the trigger

3. **Delete your test account:**
   ```sql
   DELETE FROM auth.users WHERE email = 'YOUR_TEST_EMAIL';
   ```

4. **Register again** - should work now!

---

## ✅ Success Checklist

After running setup_database.sql, verify:

- [ ] Trigger `on_auth_user_created` exists
- [ ] Function `handle_new_user` exists
- [ ] RLS policies exist on profiles table
- [ ] Test registration creates profile automatically
- [ ] Onboarding updates profile successfully
- [ ] Can access dashboard after onboarding

---

## 🆘 Still Not Working?

If you've done everything above and it still doesn't work:

1. **Export your .env.local** (save your credentials)
2. **Create a new Supabase project**
3. **Run setup_database.sql in the new project**
4. **Update .env.local with new credentials**
5. **Test again**

Sometimes a fresh project is the fastest solution!

---

## 📞 Quick Reference

| Issue | Solution |
|-------|----------|
| "permission denied" | Trigger not working - run setup_database.sql |
| "Profile not found" | Trigger not working - run setup_database.sql |
| "Error creating profile" | Old code - update from git |
| Trigger exists but doesn't work | Delete test users, register fresh |
| Nothing works | Fresh Supabase project |

---

**Most Common Fix:** Just run `supabase/setup_database.sql` again!
