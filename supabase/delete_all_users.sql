-- ============================================
-- DELETE ALL USERS AND PROFILES (FRESH START)
-- ============================================
-- Use this to completely reset and start fresh

-- Step 1: Delete all data in correct order (due to foreign keys)
DELETE FROM answers;
DELETE FROM questions;
DELETE FROM notes;
DELETE FROM profiles;  -- Must delete profiles before users
DELETE FROM auth.users;  -- Now we can delete users

-- Step 2: Verify everything is deleted
SELECT 
  (SELECT COUNT(*) FROM auth.users) as users_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM notes) as notes_count,
  (SELECT COUNT(*) FROM questions) as questions_count,
  (SELECT COUNT(*) FROM answers) as answers_count;

-- Expected: All counts should be 0

-- Step 3: Now register a new account in your app
-- The trigger should automatically create the profile!
