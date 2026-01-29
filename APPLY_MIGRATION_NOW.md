# 🚨 URGENT: Apply Database Migration

## The Error You're Seeing

The error `Error updating profile: {}` happens because:
1. The profile doesn't exist in the database
2. The database trigger to auto-create profiles hasn't been set up yet

## ✅ Quick Fix - Apply This Migration NOW

### Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Copy and Paste This SQL

```sql
-- Migration: Fix Authentication and Profile Creation
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Add the trigger function to automatically create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 3: Update the notes upload policy to allow all authenticated users
DROP POLICY IF EXISTS "Seniors can upload notes." ON notes;
DROP POLICY IF EXISTS "Authenticated users can upload notes." ON notes;

CREATE POLICY "Authenticated users can upload notes."
  ON notes FOR INSERT
  WITH CHECK ( auth.uid() = author_id );

-- Step 4: Backfill - Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'role', 'student')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
```

### Step 3: Run the Query

1. Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)
2. Wait for "Success. No rows returned" message
3. Close the SQL Editor

### Step 4: Test Your App

1. **If you have an existing account:**
   - Log out
   - Log back in
   - Complete onboarding
   - Try uploading a note

2. **If you're creating a new account:**
   - Register
   - Profile will be auto-created ✅
   - Complete onboarding
   - Access dashboard

## 🎯 What This Migration Does

1. ✅ Creates a trigger that automatically creates profiles when users sign up
2. ✅ Updates upload permissions to allow all authenticated users
3. ✅ Creates profiles for any existing users who don't have one

## ⚠️ Important

- **You MUST run this migration** for the app to work properly
- The frontend code expects these database changes
- Without this, users will continue to see errors

## 🐛 Still Having Issues?

If you still see errors after running the migration:

1. **Clear your browser data:**
   - Open DevTools (F12)
   - Go to Application tab
   - Clear all storage
   - Refresh the page

2. **Check if migration ran successfully:**
   - Go to Supabase SQL Editor
   - Run: `SELECT * FROM profiles LIMIT 5;`
   - You should see profiles listed

3. **Verify the trigger exists:**
   - Run: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
   - Should return 1 row

## 📞 Need Help?

If the migration fails, check:
- You're running it in the correct project
- You have the necessary permissions
- The `profiles` table exists

---

**After applying this migration, your authentication system will work perfectly! 🎉**
