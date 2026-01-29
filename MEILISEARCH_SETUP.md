# Meilisearch Integration Guide

## Quick Start

### 1. Start Meilisearch
```bash
# Start Meilisearch using Docker Compose
docker-compose up -d

# Verify it's running
curl http://localhost:7700/health
```

### 2. Set Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_MASTER_KEY=campus_connect_master_key_2026
```

### 3. Initialize and Sync Data
```bash
# Start your Next.js dev server
npm run dev

# In a new terminal, trigger initial sync
curl -X POST http://localhost:3000/api/meilisearch/sync
```

### 4. Test Search
Visit http://localhost:3000/dashboard/notes and start typing to see instant search results!

## Automatic Sync (Optional but Recommended)

For real-time synchronization, set up webhooks so notes automatically sync to Meilisearch on INSERT/UPDATE/DELETE.

See [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) for step-by-step instructions.

**Benefits:**
- ✅ No manual sync needed
- ✅ Changes appear in search immediately
- ✅ Always up-to-date
- ✅ Production-ready

## Features

✅ **Typo-tolerant search** - Finds results even with spelling mistakes
✅ **Instant results** - Search as you type with debouncing
✅ **Highlighted matches** - See exactly what matched your query
✅ **Subject filtering** - Filter by category
✅ **Fast performance** - Sub-50ms search times

## API Endpoints

### Search Notes
```bash
GET /api/search/notes?q=mathematics&subject=Computer%20Science&limit=20
```

### Sync Data
```bash
# Full sync of all notes
POST /api/meilisearch/sync

# Check health
GET /api/meilisearch/sync
```

## Meilisearch Dashboard

Access the Meilisearch admin interface at:
http://localhost:7700

Use the master key from `.env.local` to authenticate.

## Troubleshooting

### Meilisearch not running
```bash
docker-compose up -d
```

### No search results
1. Check if Meilisearch is running: `curl http://localhost:7700/health`
2. Trigger a sync: `curl -X POST http://localhost:3000/api/meilisearch/sync`
3. Check index stats in Meilisearch dashboard

### Type errors
Make sure you have the latest types:
```bash
npm install
```

## Production Deployment

### Option 1: Meilisearch Cloud (Recommended)
1. Sign up at https://www.meilisearch.com/cloud
2. Create a new project
3. Update environment variables:
   ```env
   NEXT_PUBLIC_MEILISEARCH_HOST=https://your-instance.meilisearch.io
   MEILISEARCH_MASTER_KEY=your_master_key
   ```

### Option 2: Self-hosted
Deploy Meilisearch to Railway, Render, or any container platform:
1. Use the official Meilisearch Docker image
2. Set MEILI_MASTER_KEY environment variable
3. Expose port 7700
4. Update your Next.js environment variables

## Syncing Strategy

### Manual Sync
Use the API endpoint when needed:
```bash
curl -X POST https://your-domain.com/api/meilisearch/sync
```

### Automatic Sync (Future)
For real-time synchronization, implement Supabase webhooks or database triggers.

## Performance Tips

1. **Limit results**: Use the `limit` parameter to control page size
2. **Use filters**: Subject filters are pre-indexed for fast filtering
3. **Debounce input**: The search hook already includes 300ms debouncing
4. **Cache results**: Consider implementing SWR or React Query for caching

## Support

- Meilisearch Docs: https://www.meilisearch.com/docs
- API Reference: https://www.meilisearch.com/docs/reference/api
