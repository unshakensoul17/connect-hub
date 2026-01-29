#!/bin/bash

# Webhook Setup Script for Campus Connect
# This script helps you set up real-time sync between Supabase and Meilisearch

set -e

echo "🚀 Campus Connect - Webhook Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it first:"
    echo "   cp .env.example .env.local"
    exit 1
fi

# Generate webhook secret if not already set
if ! grep -q "^WEBHOOK_SECRET=" .env.local; then
    echo "🔐 Generating webhook secret..."
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    echo "" >> .env.local
    echo "# Webhook Configuration" >> .env.local
    echo "WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.local
    echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> .env.local
    echo "✅ Webhook secret added to .env.local"
    echo ""
    echo "📋 Your webhook secret: $WEBHOOK_SECRET"
    echo "   Save this - you'll need it in Supabase!"
    echo ""
else
    echo "✅ WEBHOOK_SECRET already configured"
    WEBHOOK_SECRET=$(grep "^WEBHOOK_SECRET=" .env.local | cut -d '=' -f2)
    echo ""
fi

echo "📝 Next steps:"
echo ""
echo "1. Enable http extension in Supabase:"
echo "   - Go to Database → Extensions"
echo "   - Enable 'http' extension"
echo ""
echo "2. Configure Supabase settings:"
echo "   Run this SQL in Supabase SQL Editor:"
echo ""
echo "   -- Set webhook URL"
echo "   alter database postgres set app.webhook_url = 'http://host.docker.internal:3000/api/webhooks/supabase/notes';"
echo ""
echo "   -- Set webhook secret"
echo "   alter database postgres set app.webhook_secret = '$WEBHOOK_SECRET';"
echo ""
echo "3. Run the migration:"
echo "   - Copy contents of: supabase/migrations/webhook_sync_trigger.sql"
echo "   - Paste into Supabase SQL Editor"
echo "   - Execute"
echo ""
echo "4. Test it:"
echo "   - Upload a note via the UI"
echo "   - Check console for webhook logs"
echo ""
echo "📚 For detailed instructions, see: WEBHOOK_SETUP.md"
echo ""
