# 🔄 START FRESH - Complete Reset Guide

## Current Situation
You're getting "Profile not found" error, which means:
- You registered/logged in with a user
- But that user doesn't have a profile in the database
- The trigger might not have fired for that registration

---

## ✅ SOLUTION: Two Options

### **Option A: Fix Existing Users (Faster)**

Run this in Supabase SQL Editor:

```sql
-- Create profiles for ALL users who don't have one
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

Then:
1. Refresh your browser
2. Go to `/onboarding`
3. Should work now!

---

### **Option B: Complete Fresh Start (Recommended)**

This ensures everything is clean and working:

#### Step 1: Delete All Test Users

```sql
-- In Supabase SQL Editor:
DELETE FROM auth.users;
```

#### Step 2: Verify Trigger Exists

```sql
-- Check if trigger exists:
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**If no results:** Run the complete `setup_database.sql` again

#### Step 3: Verify UPDATE Policy

```sql
-- Check if UPDATE policy has WITH CHECK:
SELECT policyname, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'UPDATE';
```

**If with_check is NULL:** Run the fix from `FINAL_FIX.md`

#### Step 4: Register a Brand New Account

1. Go to `/register`
2. Use a NEW email (never used before)
3. Fill in the form
4. Submit

#### Step 5: Verify Profile Was Created

```sql
-- Check if profile was created:
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
```

**If profile exists:** ✅ Trigger is working!
**If no profile:** ❌ Trigger failed - see troubleshooting below

---

## 🐛 Troubleshooting

### If Trigger Exists But Doesn't Create Profiles:

1. **Check trigger is enabled:**
   ```sql
   SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
   Should show: `tgenabled = 'O'`

2. **Test trigger manually:**
   ```sql
   -- This should work without errors:
   SELECT public.handle_new_user();
   ```

3. **Check for errors in function:**
   ```sql
   SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
   ```

### If UPDATE Policy Doesn't Work:

```sql
-- Fix it:
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## 📋 Complete Checklist

Before testing, verify:

- [ ] Trigger `on_auth_user_created` exists and is enabled
- [ ] Function `handle_new_user` exists
- [ ] UPDATE policy has `WITH CHECK` clause
- [ ] All test users deleted (fresh start)
- [ ] Email confirmation disabled in Supabase settings

Then test:

- [ ] Register new account
- [ ] Profile created automatically
- [ ] Redirected to onboarding
- [ ] Can fill and submit onboarding form
- [ ] Redirected to dashboard
- [ ] Can upload notes

---

## 🎯 Quick Commands

### Check Everything:
```sql
-- 1. Check trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 2. Check policies
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Check users vs profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles;
```

### Fix Everything:
```sql
-- Run setup_database.sql in full
-- OR run these individually:

-- 1. Fix trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Fix UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Create missing profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT u.id, u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'student'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
```

---

## 💡 Recommended Path

**For fastest resolution:**

1. Run `create_missing_profiles.sql` (fixes current users)
2. Run `FINAL_FIX.md` SQL (fixes UPDATE policy)
3. Test with current account
4. If works: ✅ Done!
5. If doesn't work: Delete all users and start fresh

---

## 🆘 Still Not Working?

If nothing works after all this:

1. **Export your code** (git commit/push)
2. **Create a brand new Supabase project**
3. **Run `setup_database.sql` in the new project**
4. **Update `.env.local` with new credentials**
5. **Test - should work perfectly**

Sometimes a fresh database is the fastest solution!

---

**Start with Option A (fix existing users) - it's the fastest!**
