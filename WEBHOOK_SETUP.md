# Webhook Setup Guide

This guide explains how to set up real-time synchronization between Supabase and Meilisearch using webhooks.

## Prerequisites

- Supabase project (cloud or self-hosted)
- Meilisearch running (via Docker or cloud)
- Next.js application deployed or running locally

## Step-by-Step Setup

### 1. Generate Webhook Secret

Generate a secure random secret for webhook authentication:

```bash
openssl rand -hex 32
```

Save this secret - you'll need it in multiple places.

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
# Webhook security
WEBHOOK_SECRET=<your_generated_secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# For production, use your actual domain:
# NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Restart your Next.js dev server after adding these variables.

### 3. Enable HTTP Extension in Supabase

The `http` extension is required for making HTTP requests from PostgreSQL.

**Supabase Cloud:**
1. Go to your Supabase dashboard
2. Navigate to "Database" → "Extensions"
3. Search for "http"
4. Enable the extension

**Self-hosted:**
```sql
create extension if not exists http with schema extensions;
```

### 4. Configure Webhook Settings in Supabase

You need to set the webhook URL and secret in your Supabase database.

**Option A: Using Supabase Vault (Recommended for Production)**

```sql
-- Store webhook secret securely
select vault.create_secret(
  'your_webhook_secret_here',
  'webhook_secret'
);

-- Store webhook URL
select vault.create_secret(
  'https://your-domain.com/api/webhooks/supabase/notes',
  'webhook_url'
);
```

Then update the trigger function to use vault:
```sql
l_secret := vault.read_secret('webhook_secret');
l_url := vault.read_secret('webhook_url');
```

**Option B: Using Database Settings (Development)**

```sql
-- Set webhook URL
alter database postgres set app.webhook_url = 'http://host.docker.internal:3000/api/webhooks/supabase/notes';

-- Set webhook secret
alter database postgres set app.webhook_secret = 'your_webhook_secret_here';
```

> **Note**: For local development with Docker, use `host.docker.internal` instead of `localhost` so Supabase can reach your Next.js server.

### 5. Run the Migration

In Supabase SQL Editor, run the migration:

```sql
-- Copy and paste the contents of:
-- supabase/migrations/webhook_sync_trigger.sql
```

Or if using Supabase CLI:

```bash
supabase migration new webhook_sync_trigger
# Copy the SQL into the generated migration file
supabase db push
```

### 6. Verify Setup

Check that the trigger was created:

```sql
-- List all triggers on notes table
select 
  trigger_name,
  event_manipulation,
  action_statement
from information_schema.triggers
where event_object_table = 'notes';
```

You should see `notes_meilisearch_sync` trigger.

## Testing

### Test INSERT

1. Upload a new note via the UI
2. Check your Next.js console logs
3. You should see:
   ```
   📫 Webhook received: INSERT on notes
   ✅ Webhook: Synced new note <note_id>
   ```

### Test UPDATE

1. Edit an existing note
2. Check console logs for webhook event
3. Search for the updated content - should appear immediately

### Test DELETE

1. Delete a note (if you have delete functionality)
2. Verify it's removed from search results

### Manual Test via SQL

```sql
-- Insert a test note
insert into public.notes (title, description, subject, file_url, author_id, is_public)
values (
  'Test Note',
  'Testing webhook sync',
  'Computer Science',
  'https://example.com/test.pdf',
  (select id from auth.users limit 1),
  true
);

-- Check your console for webhook event
```

## Troubleshooting

### Webhook Not Firing

1. **Check trigger exists:**
   ```sql
   select * from information_schema.triggers 
   where event_object_table = 'notes';
   ```

2. **Check http extension:**
   ```sql
   select * from pg_extension where extname = 'http';
   ```

3. **Check function exists:**
   ```sql
   select routine_name from information_schema.routines 
   where routine_name = 'notify_meilisearch_sync';
   ```

### 401 Unauthorized Error

- Webhook secret mismatch
- Check `WEBHOOK_SECRET` in `.env.local` matches Supabase setting
- Regenerate secret and update both places if needed

### 500 Server Error

- Check Next.js console for detailed error
- Common issues:
  - Meilisearch not running
  - Invalid note data format
  - Missing environment variables

### Connection Refused

**Local Development:**
- Using `localhost` instead of `host.docker.internal`
- Next.js dev server not running
- Port 3000 not accessible

**Production:**
- Incorrect webhook URL
- SSL/TLS issues
- Firewall blocking requests

### Check Webhook Logs

Enable Supabase function logging:

```sql
-- Show all notices and warnings
set client_min_messages to notice;

-- Test the trigger
insert into notes (...) values (...);
```

Watch for:
- `Webhook sent successfully`
- `Failed to send webhook`

## Production Deployment

### 1. Update Webhook URL

In your Supabase migration or database settings:

```sql
alter database postgres set app.webhook_url = 'https://your-production-domain.com/api/webhooks/supabase/notes';
```

### 2. Use Supabase Vault

Store secrets securely:

```sql
select vault.create_secret('your_production_secret', 'webhook_secret');
select vault.create_secret('https://your-domain.com/api/webhooks/supabase/notes', 'webhook_url');
```

### 3. Enable HTTPS

Ensure your production Next.js app uses HTTPS for webhook endpoint.

### 4. Rate Limiting

Consider adding rate limiting to webhook endpoint to prevent abuse.

### 5. Monitoring

- Monitor webhook success/failure rates
- Set up alerts for high failure rates
- Log all webhook events for debugging

## Security Considerations

1. **Never commit webhook secrets** to version control
2. **Use HTTPS** in production
3. **Rotate secrets** periodically
4. **Validate payloads** thoroughly
5. **Implement rate limiting**
6. **Monitor for suspicious activity**

## Alternative: Supabase Edge Functions

If you experience issues with webhooks, consider using Supabase Edge Functions:

1. More integrated with Supabase ecosystem
2. No need to expose public webhook endpoint
3. Better error handling and retries
4. Simpler deployment

See Supabase Edge Functions documentation for details.

## Support

If you encounter issues:

1. Check Supabase logs
2. Check Next.js console logs
3. Verify Meilisearch is running
4. Test webhook signature manually
5. Review this troubleshooting guide

For additional help, consult:
- Supabase Documentation: https://supabase.com/docs
- Meilisearch Documentation: https://www.meilisearch.com/docs
