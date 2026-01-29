# 🗄️ Database Setup & Management Guide

## 📋 Available Scripts

### 1. **`setup_database.sql`** - Complete Database Setup
Creates everything from scratch:
- ✅ All tables (profiles, notes, questions, answers)
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation trigger
- ✅ Storage buckets (notes-files, avatars)
- ✅ Storage policies
- ✅ Performance indexes
- ✅ Backfills existing users

### 2. **`cleanup_database.sql`** - Database Reset/Cleanup
Removes everything (safe by default):
- 🗑️ Drops all tables
- 🗑️ Removes all policies
- 🗑️ Removes triggers and functions
- 🗑️ Removes indexes
- ⚠️ Preserves auth users (by default)
- ⚠️ Preserves storage files (by default)

---

## 🚀 Quick Start - Fresh Setup

### Option 1: First Time Setup (Recommended)

If you're setting up the database for the first time:

1. **Open Supabase SQL Editor**
   - Go to: https://app.supabase.com/project/YOUR_PROJECT/sql
   - Click "New Query"

2. **Copy and Run `setup_database.sql`**
   ```sql
   -- Copy entire contents of supabase/setup_database.sql
   -- Paste into SQL Editor
   -- Click "Run" (or Ctrl+Enter)
   ```

3. **Wait for Success**
   - You should see: "✅ Database setup complete!"
   - Takes about 5-10 seconds

4. **Test Your App**
   - Register a new account
   - Profile should be created automatically
   - Complete onboarding
   - Upload a note

---

## 🔄 Complete Reset & Fresh Start

If you want to start completely fresh (useful for testing):

### Step 1: Clean Up Existing Database

1. **Open Supabase SQL Editor**
2. **Copy and Run `cleanup_database.sql`**
   ```sql
   -- Copy entire contents of supabase/cleanup_database.sql
   -- Paste into SQL Editor
   -- Click "Run"
   ```

3. **Optional: Delete Auth Users**
   - If you want to delete ALL user accounts too:
   - Open `cleanup_database.sql`
   - Uncomment the line: `-- DELETE FROM auth.users;`
   - Run it again

4. **Optional: Delete Storage Files**
   - Go to Storage in Supabase Dashboard
   - Manually delete files from buckets if needed

### Step 2: Set Up Fresh Database

1. **Run `setup_database.sql`** (as described above)
2. **Done!** You now have a clean database

---

## 🛠️ Common Scenarios

### Scenario 1: "I'm getting profile errors"

**Solution:**
```bash
# Run this in Supabase SQL Editor:
1. Run cleanup_database.sql
2. Run setup_database.sql
3. Test registration again
```

### Scenario 2: "I want to test with fresh data"

**Solution:**
```bash
# Keep users, reset data:
1. Manually delete from tables:
   DELETE FROM answers;
   DELETE FROM questions;
   DELETE FROM notes;
   
2. Or run full cleanup and setup
```

### Scenario 3: "Upload permissions not working"

**Solution:**
```bash
# Re-run just the storage policies section from setup_database.sql
# Or run the complete setup_database.sql (safe to run multiple times)
```

### Scenario 4: "I want to start completely fresh"

**Solution:**
```bash
1. Run cleanup_database.sql
2. Uncomment: DELETE FROM auth.users;
3. Run cleanup_database.sql again
4. Delete storage files manually
5. Run setup_database.sql
```

---

## 📊 What Each Script Does

### `setup_database.sql` Details

| Step | What It Does | Why |
|------|-------------|-----|
| 1 | Creates tables | Store data |
| 2 | Enables RLS | Security |
| 3-6 | Creates policies | Access control |
| 7 | Creates trigger | Auto-create profiles |
| 8 | Creates buckets | File storage |
| 9 | Storage policies | File access control |
| 10 | Backfills users | Fix existing accounts |
| 11 | Creates indexes | Performance |

### `cleanup_database.sql` Details

| Step | What It Does | Safe? |
|------|-------------|-------|
| 1 | Drops policies | ✅ Yes |
| 2 | Drops triggers | ✅ Yes |
| 3 | Drops functions | ✅ Yes |
| 4 | Drops indexes | ✅ Yes |
| 5 | Drops tables | ⚠️ Deletes data |
| 6 | Deletes buckets | ⚠️ Optional (commented) |
| 7 | Deletes users | ⚠️ Optional (commented) |

---

## ⚠️ Important Notes

### Safety Features

1. **`setup_database.sql` is safe to run multiple times**
   - Uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`
   - Won't duplicate data
   - Will update policies if needed

2. **`cleanup_database.sql` preserves users by default**
   - Auth users are NOT deleted (unless you uncomment)
   - Storage files are NOT deleted (manual cleanup needed)

3. **Always backup before cleanup**
   - Export data if needed
   - Take screenshots of important info

### Best Practices

1. **Development:**
   - Run cleanup + setup frequently
   - Test with fresh data
   - Don't worry about losing test data

2. **Production:**
   - NEVER run cleanup_database.sql
   - Use migrations for schema changes
   - Backup before any changes

---

## 🔍 Verification

After running `setup_database.sql`, verify everything:

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should show: profiles, notes, questions, answers
```

### Check Trigger
```sql
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
-- Should return 1 row
```

### Check Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
-- Should show multiple policies
```

### Check Buckets
```sql
SELECT * FROM storage.buckets;
-- Should show: notes-files, avatars
```

---

## 🎯 Recommended Workflow

### For Your Current Situation:

1. **Run `cleanup_database.sql`**
   - Removes broken setup
   - Clean slate

2. **Run `setup_database.sql`**
   - Complete fresh setup
   - Everything configured correctly

3. **Test Registration**
   - Create new account
   - Should work perfectly

4. **Test Upload**
   - Upload a note
   - Should work for all users

---

## 📚 File Locations

```
supabase/
├── schema.sql              # Original schema (for reference)
├── setup_database.sql      # 👈 USE THIS for fresh setup
├── cleanup_database.sql    # 👈 USE THIS to reset
└── migrations/
    └── fix_auth_and_profiles.sql  # Old migration (not needed if using setup_database.sql)
```

---

## 💡 Pro Tips

1. **Keep these scripts in version control**
   - Easy to recreate database
   - Team members can set up quickly

2. **Document any custom changes**
   - If you modify the scripts
   - Add comments explaining why

3. **Test locally first**
   - Use Supabase local development
   - Or use a separate test project

4. **Regular backups**
   - Export data periodically
   - Especially before running cleanup

---

## 🆘 Troubleshooting

### "Permission denied" errors
- Make sure you're logged into the correct project
- Check you have admin access

### "Relation already exists" errors
- Run cleanup_database.sql first
- Then run setup_database.sql

### "Trigger already exists" errors
- The cleanup script will remove it
- Or manually: `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`

### "Bucket already exists" errors
- Normal if bucket was created before
- Script uses `ON CONFLICT DO NOTHING`

---

## ✅ Next Steps

After running the setup:

1. ✅ Test user registration
2. ✅ Test profile creation
3. ✅ Test onboarding flow
4. ✅ Test note upload
5. ✅ Test questions & answers

Your database is now properly configured! 🎉
