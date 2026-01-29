-- Enable http extension if not already enabled
-- This extension allows making HTTP requests from PostgreSQL
create extension if not exists http with schema extensions;

-- Create function to notify Meilisearch via webhook
create or replace function public.notify_meilisearch_sync()
returns trigger
language plpgsql
security definer
as $$
declare
  l_url text;
  l_payload jsonb;
  l_signature text;
  l_secret text;
  l_response jsonb;
begin
  -- Get webhook URL from environment or use default
  -- In production, update this to your production URL
  l_url := coalesce(
    current_setting('app.webhook_url', true),
    'http://host.docker.internal:3000/api/webhooks/supabase/notes'
  );

  -- Get webhook secret from Supabase vault or environment
  -- For now, using a placeholder - you'll configure this in Supabase
  l_secret := coalesce(
    current_setting('app.webhook_secret', true),
    'your_webhook_secret_here'
  );

  -- Build payload based on operation type
  if (TG_OP = 'DELETE') then
    l_payload := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', null,
      'old_record', row_to_json(OLD)
    );
  elsif (TG_OP = 'UPDATE') then
    l_payload := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    );
  elsif (TG_OP = 'INSERT') then
    l_payload := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', row_to_json(NEW),
      'old_record', null
    );
  end if;

  -- Generate HMAC signature
  -- Note: This is a simplified version. In production, you'd compute the HMAC
  -- in a more secure way, possibly using Supabase Edge Functions
  l_signature := encode(
    hmac(l_payload::text, l_secret, 'sha256'),
    'hex'
  );

  -- Make HTTP request to webhook endpoint
  begin
    select content::jsonb into l_response
    from extensions.http((
      'POST',
      l_url,
      ARRAY[
        extensions.http_header('Content-Type', 'application/json'),
        extensions.http_header('Authorization', 'Bearer ' || l_signature)
      ],
      'application/json',
      l_payload::text
    )::extensions.http_request);

    -- Log success
    raise notice 'Webhook sent successfully: % %', TG_OP, l_response;
  exception
    when others then
      -- Log error but don't fail the transaction
      raise warning 'Failed to send webhook: %', SQLERRM;
  end;

  -- Return appropriate record
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists notes_meilisearch_sync on public.notes;

-- Create trigger on notes table
create trigger notes_meilisearch_sync
  after insert or update or delete on public.notes
  for each row
  when (
    -- Only trigger for public notes
    (TG_OP = 'DELETE' and OLD.is_public = true) or
    (TG_OP = 'INSERT' and NEW.is_public = true) or
    (TG_OP = 'UPDATE' and (NEW.is_public = true or OLD.is_public = true))
  )
  execute function public.notify_meilisearch_sync();

-- Grant execute permission on the function
grant execute on function public.notify_meilisearch_sync() to postgres;

-- Add comment
comment on function public.notify_meilisearch_sync() is 
  'Sends webhook to Next.js API to sync notes with Meilisearch';

comment on trigger notes_meilisearch_sync on public.notes is
  'Automatically syncs note changes to Meilisearch via webhook';
