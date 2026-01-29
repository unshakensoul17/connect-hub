#!/bin/bash

# Campus Connect - Database Migration Script
# This script helps apply the authentication and profile fixes

echo "🚀 Campus Connect - Authentication Fix Migration"
echo "================================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Load environment variables
source .env.local

echo "📋 Migration Steps:"
echo "1. Apply database trigger for automatic profile creation"
echo "2. Update upload permissions policy"
echo "3. Backfill profiles for existing users"
echo ""

echo "⚠️  IMPORTANT: You need to run this migration in your Supabase SQL Editor"
echo ""
echo "Options:"
echo "  1. Copy the SQL file to clipboard (if xclip is installed)"
echo "  2. Open Supabase Dashboard"
echo "  3. Manual instructions"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        if command -v xclip &> /dev/null; then
            cat supabase/migrations/fix_auth_and_profiles.sql | xclip -selection clipboard
            echo "✅ SQL copied to clipboard!"
            echo "Now paste it in your Supabase SQL Editor and run it."
        else
            echo "❌ xclip not installed. Please choose option 2 or 3."
        fi
        ;;
    2)
        echo ""
        echo "📖 Manual Steps:"
        echo "1. Go to: https://app.supabase.com/project/YOUR_PROJECT/sql"
        echo "2. Copy the contents of: supabase/migrations/fix_auth_and_profiles.sql"
        echo "3. Paste into the SQL Editor"
        echo "4. Click 'Run' to execute"
        echo ""
        echo "Migration file location:"
        echo "$(pwd)/supabase/migrations/fix_auth_and_profiles.sql"
        ;;
    3)
        echo ""
        echo "📖 Manual Instructions:"
        echo ""
        echo "Step 1: Open your Supabase SQL Editor"
        echo "  https://app.supabase.com/project/YOUR_PROJECT/sql"
        echo ""
        echo "Step 2: Copy and run this SQL:"
        echo "----------------------------------------"
        cat supabase/migrations/fix_auth_and_profiles.sql
        echo "----------------------------------------"
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ After running the migration, test the following:"
echo "  1. Register a new user"
echo "  2. Check if profile is created automatically"
echo "  3. Try uploading a note"
echo "  4. Test login with existing users"
echo ""
echo "📚 For detailed information, see: FIXES.md"
