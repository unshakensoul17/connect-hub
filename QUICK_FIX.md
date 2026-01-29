# 🚀 QUICK START - Fix Your Database NOW!

## ⚡ 3-Minute Fix

### Step 1: Open Supabase SQL Editor
👉 https://app.supabase.com/project/YOUR_PROJECT/sql

### Step 2: Run This Script
Copy **ALL** of `supabase/setup_database.sql` and paste it into the SQL Editor, then click **Run**.

### Step 3: Test
- Register a new account
- Complete onboarding  
- Upload a note
- ✅ Everything should work!

---

## 🔄 Need to Reset Everything?

### Option A: Keep Users, Reset Data
```sql
DELETE FROM answers;
DELETE FROM questions;
DELETE FROM notes;
```

### Option B: Complete Fresh Start
1. Run `supabase/cleanup_database.sql`
2. Run `supabase/setup_database.sql`

---

## 📁 Files You Need

| File | Purpose | When to Use |
|------|---------|-------------|
| `setup_database.sql` | ✅ Create everything | First time or reset |
| `cleanup_database.sql` | 🗑️ Delete everything | Before fresh start |
| `DATABASE_SETUP_GUIDE.md` | 📖 Full instructions | Need help |

---

## 🐛 Current Error Fix

Your error: `Error creating profile: {}`

**Fix:** Run `setup_database.sql` - it will:
1. Create the auto-profile trigger ✅
2. Fix all permissions ✅
3. Set up storage properly ✅
4. Create profiles for existing users ✅

---

## ✅ What You'll Get

After running `setup_database.sql`:
- ✅ Automatic profile creation
- ✅ Upload works for everyone
- ✅ Proper authentication flow
- ✅ Storage buckets configured
- ✅ All permissions set correctly

---

## 🎯 Do This NOW

```bash
1. Open: https://app.supabase.com/project/YOUR_PROJECT/sql
2. Copy: supabase/setup_database.sql
3. Paste and Run
4. Wait 10 seconds
5. Test your app
6. Done! 🎉
```

---

**Need detailed help?** → Read `DATABASE_SETUP_GUIDE.md`
